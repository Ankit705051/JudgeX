import mongoose from "mongoose";
import { Problem } from "../schema/problem.js";

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


export const createProblem = async (req, res) => {
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

        if (!title || !description || !slug || !constraints || !examples || !codeTemplate || !solution || !functionName || !parameterTypes || !timeLimit || !memoryLimit || !difficulty || !tags) {
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
        
        if(!Array.isArray(codeTemplate)) {
            return sendtError(res, 400, "Code template must be an array");
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
            return sendtError(res, 400, "Solution must be an array");
        }

        for(const solutionItem of solution) {
            if(!solutionItem.solution?.trim()) {
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
            solution,
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


export const getAllProblem=async(req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const { title,slug,difficulty,tags } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if(title) {
            query.title = { $regex: title, $options: "i" };
        }
        if(slug) {
            query.slug = slug;
        }
        if(difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
            query.difficulty = difficulty;
        }
        if(tags) {
            query.tags = { $in: tags.split(",") };
        }

        const problems = await Problem.find(query)
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .sort({ createdAt: -1 });
        const totalProblem=await Problem.countDocuments(query);
        
            return sendtSuccess(
            res,
            200,
            "Problems retrieved successfully",
            {
                problems,
                pagination: {
                    totalProblem,
                    currentPage: page,
                    totalPages: Math.ceil(totalProblem / limit)
                }
            }
        );
    }catch(error){
        console.error("error in fetching problems",error);
        return sendtError(res, 500, "Internal server error");
    }
}

export const getProblemBySlug=async(req,res)=>{
    try{
        const {slug}=req.params;
        if(!slug){
            return sendtError(res,400,"slug is required");
        }
        const problem=await Problem.findOne({
            slug:slug.toLowerCase().trim()
        }).lean();
        if(!problem){
            return sendtError(res,404,"Problem not found");
        }
        return sendtSuccess(res,200,"Problem retrieved successfully",problem);
    }catch(error){
        console.error("error in fetching problem by slug",error);
        return sendtError(res,500,"Internal server error");
    }
}

export const updateProblem = async (req, res) => {
try {
const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendtError(res, 400, "Invalid problem id");
    }
    const updateData = { ...req.body };
    if (updateData.title) {
        updateData.slug = updateData.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");
    }
    if (
        updateData.difficulty &&
        !["easy", "medium", "hard"].includes(updateData.difficulty)
    ) {
        return sendtError(res, 400, "Invalid difficulty level");
    }
    if (
        updateData.tags &&
        (!Array.isArray(updateData.tags) ||
            updateData.tags.length === 0)
    ) {
        return sendtError(
            res,
            400,
            "Tags must be a non-empty array"
        );
    }
    if (updateData.title) {
        const existingTitle = await Problem.findOne({
            title: updateData.title,
            _id: { $ne: id }
        });

        if (existingTitle) {
            return sendtError(
                res,
                409,
                "Problem title already exists"
            );
        }
    }
    if (updateData.slug) {
        const existingSlug = await Problem.findOne({
            slug: updateData.slug,
            _id: { $ne: id }
        });

        if (existingSlug) {
            return sendtError(
                res,
                409,
                "Problem slug already exists"
            );
        }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).select("-__v");

    if (!updatedProblem) {
        return sendtError(
            res,
            404,
            "Problem not found"
        );
    }

    return sendtSuccess(
        res,
        200,
        "Problem updated successfully",
        updatedProblem
    );

} catch (error) {
    console.error(
        "Error updating problem:",
        error
    );

    return sendtError(
        res,
        500,
        "Internal server error"
    );
}

};


export const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendtError(res, 400, "Invalid problem id");
        }
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) {
            return sendtError(res, 404, "Problem not found");
        }
        return sendtSuccess(res, 200, "Problem deleted successfully", deletedProblem);
    } catch (error) {
        console.error("Error deleting problem:", error);
        return sendtError(res, 500, "Internal server error");
    }
};
