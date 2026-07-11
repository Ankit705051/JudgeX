import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';
import os from "os";
const execAsync = util.promisify(exec);

const RUNNERS = {
    54: { name: 'cpp', image: 'gcc:latest', extension: 'cpp' },
    71: { name: 'python', image: 'python:3.9-slim', extension: 'py' },
    63: { name: 'javascript', image: 'node:18-slim', extension: 'js' },
    62: { name: 'java', image: 'eclipse-temurin:17-jdk-jammy', extension: 'java' }
};

const SANDBOX_DIR = path.join(os.tmpdir(), "judgex");
const VOLUME_NAME = 'backend_code_sandbox_vol';

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
            compileInnerCmd = `g++ ${filename} -o main`;
            executeInnerCmd = `timeout 2s ./main < input.txt`;
        } else if (runner.name === 'java') {
            compileInnerCmd = `javac ${filename}`;
            executeInnerCmd = `timeout 2s java Main < input.txt`;
        } else if (runner.name === 'python') {
            executeInnerCmd = `timeout 2s python3 ${filename} < input.txt`;
        } else if (runner.name === 'javascript') {
            executeInnerCmd = `timeout 2s node ${filename} < input.txt`;
        }

        // --- COMPILATION STEP ---
        if (compileInnerCmd) {
            let compileContainerId = '';
            try {
                // 1. Create container
                const createCompileCmd = `docker create --network none -w /sandbox ${runner.image} sh -c "${compileInnerCmd}"`;
                const { stdout: compileCreateOut } = await execAsync(createCompileCmd);
                compileContainerId = compileCreateOut.trim();

                // 2. Copy files into container
                await execAsync(`docker cp ${jobDir}/. ${compileContainerId}:/sandbox`);

                // 3. Start container (without -a so it stays running for file copying)
                await execAsync(`docker start ${compileContainerId}`, { timeout: 20000 });
                
                // 4. Wait for compilation to complete
                await execAsync(`docker wait ${compileContainerId}`, { timeout: 20000 });
                
                // 5. Copy the compiled binary back to our job directory for the execution step
                if (runner.name === "cpp") {
                    await execAsync(
                        `docker cp ${compileContainerId}:/sandbox/main ${jobDir}/main`
                    );
                }
                else if (runner.name === "java") {
                    // Copy every generated .class file (Main.class, Solution.class, etc.)
                    const { stdout } = await execAsync(
                        `docker cp ${compileContainerId}:/sandbox/. ${jobDir}/`
                    );
                }
            } catch (err) {
                return {
                    status: { id: 6 }, // Compile Error
                    compile_output: err.stderr || err.stdout || err.message
                };
            } finally {
                if (compileContainerId) {
                    await execAsync(`docker rm -f ${compileContainerId}`).catch(() => {});
                }
            }
        }

        // --- EXECUTION STEP ---
        let execContainerId = '';
        try {
            // 1. Create container
            const createExecCmd = `docker create --network none --memory 256m --cpus 1 -w /sandbox ${runner.image} sh -c "${executeInnerCmd}"`;
            const { stdout: execCreateOut } = await execAsync(createExecCmd);
            execContainerId = execCreateOut.trim();

            // 2. Copy files (including compiled binary if any) into container
            await execAsync(`docker cp ${jobDir}/. ${execContainerId}:/sandbox`);

            // 3. Start container
            const { stdout, stderr } = await execAsync(`docker start -a ${execContainerId}`, { timeout: 15000 });
            
            return {
                status: { id: 3 }, // Accepted
                stdout: stdout,
                stderr: stderr
            };
        } catch (err) {
            // If the start command fails, we check for exit code 124 (timeout command) or timeout of execAsync
            if (err.killed || err.code === 124 || (err.message && err.message.includes('124'))) {
                return {
                    status: { id: 5 } // Time Limit Exceeded
                };
            }
            return {
                status: { id: 7 }, // Runtime Error
                stderr: err.stderr || err.stdout || err.message
            };
        } finally {
            if (execContainerId) {
                await execAsync(`docker rm -f ${execContainerId}`).catch(() => {});
            }
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
