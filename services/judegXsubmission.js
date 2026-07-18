import { Submission } from "../schema/submission.js";
import { Problem } from "../schema/problem.js";
import { TestCase } from "../schema/testcase.js";
import { compareOutputs } from "./outputComprator.js";
import { buildCode } from "./codeBuilder/index.js";
import { executeCode } from "./dockerRunner.js";
import { getLanguageId } from "./languageMap.js";
import { updateContestScore } from "./contestScore.js";
import { redis } from "../config/redis.js";
export const judgeSubmission = async (
    submissionId,
    contestId,
    job
) => {
    try {
        const submission =
            await Submission.findById(submissionId);
        if (!submission) {
            throw new Error(
                "Submission not found"
            );
        }
        submission.status = "judging";
        await submission.save();
        const problem =
            await Problem.findById(
                submission.problemId
            );
        if (!problem) {

            submission.status =
                "runtime_error";

            submission.errorOutput =
                "Problem not found";

            await submission.save();

            return submission;
        }
        console.log(
            "Problem parameters:",
            problem.parameters
        );
        console.log(
            "Function Name:",
            problem.functionName
        );
        console.log(
            "Return Type:",
            problem.returnType
        );
        const testCases =
            await TestCase.find({
                problemId:
                    submission.problemId
            });
        console.log(
            "Found Test Cases:",
            testCases.length
        );
        if (!testCases.length) {
            submission.status =
                "runtime_error";
            submission.errorOutput =
                "No test cases found";
            await submission.save();

            return submission;
        }
        const fullCode =
            buildCode(
                submission.code,
                submission.language,
                problem
            );
        console.log(
            "Generated Code:\n",
            fullCode
        );
        const languageId =
            getLanguageId(
                submission.language
            );
        let passed = 0;
        let finalOutput = "";
        let executionTime = 0;
        let memory = 0;
        const TEST_CASE_CONCURRENCY =
            Number(
                process.env.TEST_CASE_CONCURRENCY
            ) || 5;
        const processTestCase = async (
            testCase,
            index
        ) => {
            console.log(
                `Running testcase ${index + 1}`
            );
            const result =
                await executeCode(
                    fullCode,
                    languageId,
                    testCase.input
                );
            const statusId =
                result.status?.id;
            const actualOutput =
                result.stdout?.trim() || "";
            const expectedOutput =
                testCase.output?.trim() || "";

                   console.log("================================");
    console.log("Input:", JSON.stringify(testCase.input));
    console.log("Expected:", JSON.stringify(expectedOutput));
    console.log("Actual:", JSON.stringify(actualOutput));
    console.log("Status ID:", statusId);
    console.log("Compare:", compareOutputs(expectedOutput, actualOutput));
    console.log("================================");
 
            return {
                index,
                statusId,
                result,
                actualOutput,
                isCorrect:
                    compareOutputs(
                        expectedOutput,
                        actualOutput
                    )
            };
        };
        for(
            let i = 0;
            i < testCases.length;
            i += TEST_CASE_CONCURRENCY
        ) {
            const batch =
                testCases.slice(
                    i,
                    i + TEST_CASE_CONCURRENCY
                );
            const batchResults =
                await Promise.all(
                    batch.map(
                        (testCase,index)=>
                            processTestCase(
                                testCase,
                                i + index
                            )
                    )
                );

            for(
                const result of batchResults
            ) {
                if(job){
                    await job.updateProgress({
                        testcase:
                            result.index + 1,
                        total:
                            testCases.length
                    });
                }
                const statusId =
                    result.statusId;
                if(statusId === 6){
                    submission.status =
                        "compile_error";
                    submission.compileOutput =
                        result.result
                        .compile_output || "";
                    await submission.save();
                    await publishSubmissionUpdate(
                        submission
                    );
                    return submission;

                }
                if(
                    [
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13
                    ].includes(statusId)
                ){
                    submission.status =
                        "runtime_error";
                    submission.errorOutput =
                        result.result.stderr ||
                        "Runtime Error";
                    await submission.save();
                    await publishSubmissionUpdate(
                        submission
                    );
                    return submission;
                }
                if(statusId === 5){
                    submission.status =
                        "time_limit_exceeded";
                    await submission.save();
                    await publishSubmissionUpdate(
                        submission
                    );
                    return submission;
                }
                if(result.isCorrect){
                    passed++;
                }
                finalOutput =
                    result.actualOutput;
                executionTime =
                    Math.max(
                        executionTime,
                        Number(
                            result.result.time || 0
                        )
                    );
                memory =
                    Math.max(
                        memory,
                        Number(
                            result.result.memory || 0
                        )
                    );
            }
        }
        submission.passedTestCases =
            passed;
        submission.totalTestCases =
            testCases.length;
        submission.executionOutput =
            finalOutput;
        submission.executionTime =
            executionTime;
        submission.memory =
            memory;
        submission.accepted =
            passed === testCases.length;
        submission.status =
            submission.accepted
                ? "accepted"
                : "wrong_answer";
             console.log("Before save:", submission.status);
   
        await submission.save();
console.log("After save:", submission.status);

        if(
            contestId &&
            submission.accepted
        ){
            const score =
                await updateContestScore(
                    contestId,
                    submission.userId,
                    submission.problemId
                );
            if(score){
                await redis.publish(
                    "contest-score-updated",
                    JSON.stringify({
                        contestId,
                        userId:
                            submission.userId,
                        problemId:
                            submission.problemId,
                        score:
                            score.score
                    })
                );
            }
        }
        await publishSubmissionUpdate(
            submission
        );
        return submission;
    }
    catch(error){
        console.error(
            "Judge Submission Error:",
            error
        );

        await Submission.findByIdAndUpdate(
            submissionId,
            {
                status:
                    "runtime_error",
                errorOutput:
                    error.message
            }
        );

        throw error;
    }
};

// Redis event publisher

const publishSubmissionUpdate = async(
    submission
)=>{
    await redis.publish(

        "submission-updated",

        JSON.stringify({

            submissionId:
                submission._id,

            userId:
                submission.userId,

            status:
                submission.status,

            passedTestCases:
                submission.passedTestCases,

            totalTestCases:
                submission.totalTestCases,

            executionTime:
                submission.executionTime,

            memory:
                submission.memory,

            accepted:
                submission.accepted

        })

    );

};