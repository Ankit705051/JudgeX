import { Problem } from "../models/models.problem.js";

const sendtError = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
};
const sendtSuccess = (res, status, message, data = null) => {
    const response = {
        success: true,
        message
    };
    if (data) {
        response.data = data;
    }
    return res.status(status).json(response);
};


const createProblem = async (req, res) => {
    try {
        const {
            title,
            description,
            slug,
            constraints,
            examples,
            codeTemplate,
            solution,
            functionName,
            parameterTypes,
            timeLimit,
            memoryLimit,
            difficulty,
            tags,
        } = req.body;

        if (!title || !description || !slug || !constraints || !examples || !codeTemplates || !solutions || !functionName || !parameterTypes || !time_limit || !memory_limit || !difficulty || !tags) {
            return sendtError(res, 400, "Please provide all required fields");
        }
        
        const existingProblem = await Problem.findOne({ $or: [{ slug }, { title }] });
        if (existingProblem) {
            return sendtError(res, 400, "Problem with this slug or title already exists");
        }
        if(!["easy", "medium", "hard"].includes(difficulty)) {
            return sendtError(res, 400, "Invalid difficulty level");
        }
        if(!Array.isArray(tags)  || tags.length===0) {
            return sendtError(res, 400, "Tags must be a non-empty array");
        }
        if(!Array.isArray(examples)) {
            return sendtError(res, 400, "Examples must be an array");
        }
        
        if(!Array.isArray(codeTemplates)) {
            return sendtError(res, 400, "Code templates must be an array");
        }

        if(typeof functionName !== "string") {
            return sendtError(res, 400, "Function name must be a string");
        }

        if(!Array.isArray(parameterTypes)) {
            return sendtError(res, 400, "Parameter types must be an array");
        }

        if(timeLimit<=0) {
            return sendtError(res, 400, "Time limit must be greater than 0");
        }

        if(memoryLimit<=0) {
            return sendtError(res, 400, "Memory limit must be greater than 0");
        }
        
        for(const example of examples) {
            if(!example.input?.trim()) {
                return sendtError(res, 400, "Each example must have input and output");
            }
            if(!example.output?.trim()) {
                return sendtError(res, 400, "Each example must have input and output");
            }
        }
        for(const template of codeTemplate) {
            if(!template.language?.trim()) {
                return sendtError(res, 400, "Each code template must have a language");
            }
            if(!template.starterCode?.trim()) {
                return sendtError(res, 400, "Each code template must have a template");
            }
        }

        if(!Array.isArray(solution)) {
            return sendtError(res, 400, "Solutions must be an array");
        }

        for(const solutionItem of solution) {
            if(!solutionItem.code?.trim()) {
                return sendtError(res, 400, "Each solution must have code");
            }
            if(!solutionItem.language?.trim()) {
                return sendtError(res, 400, "Each solution must have a language");
            }
        }
        
        const problem = new Problem({
            title,
            description,
            slug,
            constraints,
            examples,
            codeTemplate,
            solutions,
            functionName,
            parameterTypes,
            timeLimit,
            memoryLimit,
            difficulty,
            tags,
        });
        await problem.save();
        return sendtSuccess(res, 201, "Problem created successfully", problem);
        
    } catch (error) {
        console.error(error);
        return sendtError(res, 500, "Internal server error");
    }
}
