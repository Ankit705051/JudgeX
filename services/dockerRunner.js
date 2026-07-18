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

export const executeCode = async (code, languageId, stdin) => {
    const runner = RUNNERS[languageId];

    if (!runner) {
        throw new Error(`Unsupported language ID: ${languageId}`);
    }

    const jobId = crypto.randomUUID();
    const jobDir = path.join(SANDBOX_DIR, jobId);

    try {
        await fs.mkdir(jobDir, { recursive: true });

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

        let filename = `main.${runner.extension}`;

        if (runner.name === "java") {
            filename = "Main.java";
        }

        await fs.writeFile(path.join(jobDir, filename), code);
        await fs.writeFile(path.join(jobDir, "input.txt"), stdin || "");

        let compileCmd = "";
        let executeCmd = "";

        switch (runner.name) {
            case "cpp":
                compileCmd = `timeout 10s g++ ${filename} -o main`;
                executeCmd = `timeout 2s ./main < input.txt`;
                break;

            case "java":
                compileCmd = `timeout 10s javac -d gson_build com/google/gson/Gson.java && timeout 10s jar cf gson.jar -C gson_build . && timeout 10s javac -cp gson.jar Main.java`;
                executeCmd = `timeout 2s java -cp .:gson.jar Main < input.txt`;
                break;

            case "python":
                executeCmd = `timeout 2s python3 ${filename} < input.txt`;
                break;

            case "javascript":
                executeCmd = `timeout 2s node ${filename} < input.txt`;
                break;
        }

        // ---------------- COMPILE ----------------

        if (compileCmd) {
            try {
                const dockerCompile = `docker run ${DOCKER_FLAGS} -v "${jobDir}:/sandbox" -w /sandbox ${runner.image} sh -c "${compileCmd}"`;

                await execAsync(dockerCompile, {
                    timeout: 30000,
                    maxBuffer: MAX_OUTPUT_BYTES,
                });

            } catch (err) {

                if (err.code === 124 || err.killed) {
                    return {
                        status: { id: 5 },
                        compile_output: "Compilation timed out",
                    };
                }

                return {
                    status: { id: 6 },
                    compile_output: truncate(
                        err.stderr || err.stdout || err.message
                    ),
                };
            }
        }

        // ---------------- EXECUTE ----------------

        try {
            const dockerExecute = `docker run ${DOCKER_FLAGS} -v "${jobDir}:/sandbox" -w /sandbox ${runner.image} sh -c "${executeCmd}"`;

            const { stdout, stderr } = await execAsync(dockerExecute, {
                timeout: 15000,
                maxBuffer: MAX_OUTPUT_BYTES,
            });

            return {
                status: { id: 3 },
                stdout: truncate(stdout),
                stderr: truncate(stderr),
            };

        } catch (err) {

            const output = `${err.stdout || ""}${err.stderr || ""}`;

            if (
                err.code === 124 ||
                err.killed ||
                output.includes("124")
            ) {
                return {
                    status: { id: 5 },
                };
            }

            return {
                status: { id: 7 },
                stderr: truncate(
                    err.stderr || err.stdout || err.message
                ),
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
            await fs.rm(jobDir, {
                recursive: true,
                force: true,
            });
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    }
};
