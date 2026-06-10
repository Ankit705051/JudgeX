import mongoose from "mongoose";
import { Problem } from "../schema/problem.js";
import { TestCase } from "../schema/testcase.js";

const sendError = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
};

const sendSuccess = (res, status, message, data = null) => {
    const response = {
        success: true,
        message
    };
    if (data) {
        response.data = data;
    }
    return res.status(status).json(response);
};

export const createTestCase = async (req, res) => {
    try {
        const { problemId, input, output, explanation, isHidden } = req.body;
        const testCase = new TestCase({
            problemId,
            input,
            output,
            explanation,
            isHidden
        });
         if(!problemId || !input || !output  ){
            return sendError(res,400,"please provide all required fields");
         }
         if(!mongoose.Types.ObjectId.isValid(problemId)){
            return sendError(res, 400, "Invalid problem id");
         }
         const existingProblem=await Problem.findById(problemId);
         if(!existingProblem){
            return sendError(res,400,"problem does not exist");
         }


     return sendSuccess(
    res,
    201,
    "Test case created successfully",
    testCase
);
    } catch (error) {
        console.error(error);
        sendError(res,500,"error creating test")
    }
};


export const getTestCases = async (req, res) => {
    try {
        const { problemId } = req.params;
        if (
            !mongoose.Types.ObjectId.isValid(problemId)
        ) {
            return sendError(
                res,
                400,
                "Invalid problem id"
            );
        }

        const problem = await Problem.findById(
            problemId
        );

        if (!problem) {
            return sendError(
                res,
                404,
                "Problem not found"
            );
        }

        const testCases = await TestCase.find({
            problemId
        });

        return sendSuccess(
            res,
            200,
            "Test cases retrieved successfully",
            testCases
        );

    } catch (error) {
        console.error(error);

        return sendError(
            res,
            500,
            "Error retrieving test cases"
        );
    }
};
