import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';
import os from "os";
const execAsync = util.promisify(exec);

const RUNNERS = {
    54: { name: 'cpp', image: 'gcc:13', extension: 'cpp' },
    71: { name: 'python', image: 'python:3.9-slim', extension: 'py' },
    63: { name: 'javascript', image: 'node:18-slim', extension: 'js' },
    62: { name: 'java', image: 'eclipse-temurin:17-jdk-jammy', extension: 'java' }
};
const SANDBOX_DIR = path.join(os.tmpdir(), "judgex");

export const executeCode = async (code, languageId, stdin) => {
    const runner = RUNNERS[languageId];
    if (!runner) {
        throw new Error(`Unsupported language ID: ${languageId}`);
    }

    const jobId = crypto.randomUUID();
    const jobDir = path.join(SANDBOX_DIR, jobId);

    try {
        await fs.mkdir(jobDir, { recursive: true });
        
        let filename = `main.${runner.extension}`;
        if (runner.name === 'java') {
            filename = 'Main.java';
        }

        await fs.writeFile(path.join(jobDir, filename), code);
        await fs.writeFile(path.join(jobDir, 'input.txt'), stdin || '');

        let compileInnerCmd = '';
        let executeInnerCmd = '';

        if (runner.name === 'cpp') {
            compileInnerCmd = `timeout 10s g++ ${filename} -o main`;
            executeInnerCmd = `timeout 2s ./main < input.txt`;
        } else if (runner.name === 'java') {
            compileInnerCmd = `timeout 10s javac ${filename}`;
            executeInnerCmd = `timeout 2s java Main < input.txt`;
        } else if (runner.name === 'python') {
            executeInnerCmd = `timeout 2s python3 ${filename} < input.txt`;
        } else if (runner.name === 'javascript') {
            executeInnerCmd = `timeout 2s node ${filename} < input.txt`;
        }

        // --- COMPILATION STEP ---
        if (compileInnerCmd) {
            try {
                const compileCmd = `
                    docker run --rm \
                    --network none \
                    --memory=512m \
                    --cpus=1 \
                    -v "${jobDir}:/sandbox" \
                    -w /sandbox \
                    ${runner.image} \
                    sh -c "${compileInnerCmd}"
                `;

                await execAsync(compileCmd, { timeout: 30000 });

            } catch (err) {
                if (err.code === 124 || err.killed) {
                    return {
                        status: { id: 5 },
                        compile_output: "Compilation timed out"
                    };
                }

                return {
                    status: { id: 6 },
                    compile_output: err.stderr || err.stdout || err.message
                };
            }
        }

        // --- EXECUTION STEP ---
            try {
            const executeCmd = `
                docker run --rm \
                --network none \
                --memory=256m \
                --cpus=1 \
                -v "${jobDir}:/sandbox" \
                -w /sandbox \
                ${runner.image} \
                sh -c "${executeInnerCmd}"
            `;

            const { stdout, stderr } = await execAsync(executeCmd, {
                timeout: 15000
            });

            return {
                status: { id: 3 },
                stdout: stdout.trim(),
                stderr: stderr.trim()
            };

            } catch (err) {

            const output = `${err.stdout || ""} ${err.stderr || ""}`;
                if (
                    err.code === 124 ||
                    err.killed ||
                    output.includes("124")
                ) {
                    return {
                        status: { id: 5 }
                    };
                }

            return {
                status: { id: 7 },
                stderr: err.stderr || err.stdout || err.message
            };
        }

    } catch (err) {
        console.error("Execution error:", err);
        return {
            status: { id: 13 }, // Internal Error
            message: err.message
        };
    } finally {
        try {
            await fs.rm(jobDir, { recursive: true, force: true });
        } catch (e) {
            console.error("Failed to clean up job dir:", e);
        }
    }
};
