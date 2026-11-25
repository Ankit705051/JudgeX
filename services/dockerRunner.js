import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import crypto from "crypto";
import os from "os";

const execAsync = util.promisify(exec);

const RUNNERS = {
    54: { name: "cpp", image: "gcc:13", extension: "cpp" },
    62: { name: "java", image: "eclipse-temurin:17-jdk-jammy", extension: "java" },
    71: { name: "python", image: "python:3.9-slim", extension: "py" },
    63: { name: "javascript", image: "node:18-slim", extension: "js" },
};

const SANDBOX_DIR = path.join(os.tmpdir(), "judgex");

const MAX_OUTPUT_BYTES = 1024 * 1024;

// Timeouts are env-configurable. Compilation includes nlohmann/json.hpp for
// C++ and a from-source Gson build for Java, both of which need far more than
// the old hardcoded 10s on small instances.
const COMPILE_TIMEOUT_S = Number(process.env.COMPILE_TIMEOUT_S) || 60;
const RUN_TIMEOUT_S = Number(process.env.RUN_TIMEOUT_S) || 5;
const COMPILE_EXEC_MS =
    Number(process.env.COMPILE_EXEC_TIMEOUT_MS) || (COMPILE_TIMEOUT_S + 60) * 1000;
const RUN_EXEC_MS =
    Number(process.env.RUN_EXEC_TIMEOUT_MS) || (RUN_TIMEOUT_S + 15) * 1000;

const DOCKER_FLAGS = [
    "--rm",
    "--network=none",
    "--memory=256m",
    "--cpus=1",
    "--pids-limit=64",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges",
    "--tmpfs=/tmp:rw,size=64m",
].join(" ");

function truncate(text) {
    if (!text) return "";
    return text.length > MAX_OUTPUT_BYTES
        ? text.slice(0, MAX_OUTPUT_BYTES) + "\n...[output truncated]"
        : text;
}

async function copyVendorFiles(jobDir) {
    const jsonHeaderSrc = path.join(
        process.cwd(),
        "services",
        "codeBuilder",
        "vendor",
        "nlohmann",
        "json.hpp"
    );
    const jsonHeaderDest = path.join(jobDir, "nlohmann", "json.hpp");
    await fs.mkdir(path.dirname(jsonHeaderDest), { recursive: true });
    await fs.copyFile(jsonHeaderSrc, jsonHeaderDest);

    const gsonSourceSrc = path.join(
        process.cwd(),
        "services",
        "codeBuilder",
        "vendor",
        "gson",
        "src",
        "com",
        "google",
        "gson",
        "Gson.java"
    );
    const gsonSourceDest = path.join(jobDir, "com", "google", "gson", "Gson.java");
    await fs.mkdir(path.dirname(gsonSourceDest), { recursive: true });
    await fs.copyFile(gsonSourceSrc, gsonSourceDest);

    const typeTokenSrc = path.join(
        process.cwd(),
        "services",
        "codeBuilder",
        "vendor",
        "gson",
        "src",
        "com",
        "google",
        "gson",
        "reflect",
        "TypeToken.java"
    );
    const typeTokenDest = path.join(jobDir, "com", "google", "gson", "reflect", "TypeToken.java");
    await fs.mkdir(path.dirname(typeTokenDest), { recursive: true });
    await fs.copyFile(typeTokenSrc, typeTokenDest);
}

function dockerRunCmd(runner, jobDir, shellCmd) {
    return `docker run ${DOCKER_FLAGS} -v "${jobDir}:/sandbox" -w /sandbox ${runner.image} sh -c "${shellCmd}"`;
}

function runCommandFor(runner, filename) {
    switch (runner.name) {
        case "cpp":
            return "./main";
        case "java":
            return "java -cp .:gson.jar Main";
        case "python":
            return `python3 ${filename}`;
        case "javascript":
            return `node ${filename}`;
        default:
            throw new Error(`Unknown runner: ${runner.name}`);
    }
}

/**
 * Prepare a submission: create the sandbox dir, write the source, and compile
 * once. Returns { ok: true, job } or { ok: false, status, compileOutput?, cleanup }.
 * Call job.cleanup() when all testcases are done.
 */
export const prepareSubmission = async (code, languageId) => {
    const runner = RUNNERS[languageId];

    if (!runner) {
        return {
            ok: false,
            status: { id: 13 },
            message: `Unsupported language ID: ${languageId}`,
        };
    }

    const jobId = crypto.randomUUID();
    const jobDir = path.join(SANDBOX_DIR, jobId);

    const cleanup = async () => {
        try {
            await fs.rm(jobDir, { recursive: true, force: true });
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    };

    try {
        await fs.mkdir(jobDir, { recursive: true });
        await copyVendorFiles(jobDir);

        const filename = runner.name === "java" ? "Main.java" : `main.${runner.extension}`;
        await fs.writeFile(path.join(jobDir, filename), code);

        let compileCmd = "";
        switch (runner.name) {
            case "cpp":
                compileCmd = `timeout ${COMPILE_TIMEOUT_S}s g++ ${filename} -o main`;
                break;
            case "java":
                compileCmd =
                    `timeout ${COMPILE_TIMEOUT_S}s javac -d gson_build com/google/gson/Gson.java com/google/gson/reflect/TypeToken.java` +
                    ` && timeout ${COMPILE_TIMEOUT_S}s jar cf gson.jar -C gson_build .` +
                    ` && timeout ${COMPILE_TIMEOUT_S}s javac -cp gson.jar ${filename}`;
                break;
        }

        if (compileCmd) {
            try {
                await execAsync(dockerRunCmd(runner, jobDir, compileCmd), {
                    timeout: COMPILE_EXEC_MS,
                    maxBuffer: MAX_OUTPUT_BYTES,
                });
            } catch (err) {
                if (err.code === 124 || err.killed) {
                    return {
                        ok: false,
                        status: { id: 5 },
                        compileOutput: "Compilation timed out",
                        cleanup,
                    };
                }
                return {
                    ok: false,
                    status: { id: 6 },
                    compileOutput: truncate(err.stderr || err.stdout || err.message),
                    cleanup,
                };
            }
        }

        return {
            ok: true,
            job: { runner, jobDir, filename, cleanup },
        };
    } catch (err) {
        await cleanup();
        return {
            ok: false,
            status: { id: 13 },
            message: err.message,
        };
    }
};

/**
 * Run one testcase against a prepared job. Each call uses a unique input file
 * so concurrent testcases in the same jobDir don't clobber each other.
 */
export const runCompiled = async (job, stdin) => {
    const { runner, jobDir, filename } = job;
    const inputName = `input_${crypto.randomUUID()}.txt`;
    const inputPath = path.join(jobDir, inputName);

    try {
        await fs.writeFile(inputPath, stdin || "");

        const executeCmd = `timeout ${RUN_TIMEOUT_S}s ${runCommandFor(runner, filename)} < ${inputName}`;

        try {
            const { stdout, stderr } = await execAsync(
                dockerRunCmd(runner, jobDir, executeCmd),
                { timeout: RUN_EXEC_MS, maxBuffer: MAX_OUTPUT_BYTES }
            );

            return {
                status: { id: 3 },
                stdout: truncate(stdout),
                stderr: truncate(stderr),
            };
        } catch (err) {
            const output = `${err.stdout || ""}${err.stderr || ""}`;

            if (err.code === 124 || err.killed || output.includes("124")) {
                return { status: { id: 5 } };
            }

            return {
                status: { id: 7 },
                stderr: truncate(err.stderr || err.stdout || err.message),
            };
        }
    } catch (err) {
        console.error("Execution error:", err);
        return {
            status: { id: 13 },
            message: err.message,
        };
    } finally {
        try {
            await fs.rm(inputPath, { force: true });
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    }
};
