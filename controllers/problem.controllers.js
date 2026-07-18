import { Problem } from "../schema/problem.js";
import { sendSuccess, sendError } from "../utils/response.js";

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
            returnType,
            parameters,
            visibility,
            timeLimit,
            memoryLimit,
            difficulty,
            tags,
        } = req.validated.body;
        
        const existingProblem = await Problem.findOne({ $or: [{ slug }, { title }] });
        if (existingProblem) {
            return sendError(res, 400, "Problem with this slug or title already exists");
        }
        
        const normalizedExamples = examples?.map(({ explanation, ...example }) => (
            explanation?.trim()
                ? { ...example, explanation: explanation.trim() }
                : example
        ));

        const problem = new Problem({
            title,
            description,
            slug,
            constraints,
            exmaples: normalizedExamples,
            codeTemplate,
            solution,
            functionName,
            returnType,
            parameters,
            timeLimit,
            visibility,
            memoryLimit,
            difficulty,
            tags,
        });
        await problem.save();
        return sendSuccess(res, 201, "Problem created successfully", problem);
        
    } catch (error) {
        console.error(error);
        if (error.name === "ValidationError") {
            return sendError(res, 400, error.message);
        }
        return sendError(res, 500, "Internal server error");
    }
}

export const bulkCreateProblems = async (req, res) => {
    try {
        const problems = req.validated.body;
        const slugs = problems.map(p => p.slug);
        const titles = problems.map(p => p.title);

        const existing = await Problem.find({
            $or: [
                { slug: { $in: slugs } },
                { title: { $in: titles } }
            ]
        });

        if (existing.length > 0) {
            return sendError(
                res,
                400,
                "Some problems already exist.",
                existing.map(p => ({
                    title: p.title,
                    slug: p.slug
                }))
            );
        }

        const formattedProblems = problems.map(problem => ({
            ...problem,
            examples: problem.examples?.map(({ explanation, ...exmaples }) =>
                explanation?.trim()
                    ? { ...exmaples, explanation: explanation.trim() }
                    : exmaples
            )
        }));

        const createdProblems = await Problem.insertMany(formattedProblems);

        return sendSuccess(
            res,
            201,
            `${createdProblems.length} problems imported successfully.`,
            createdProblems
        );

    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getAllProblem = async (req, res) => {
    try {

        const {
            page,
            limit,
            title,
            slug,
            difficulty,
            tags
        } = req.validated.query;

        const skip = (page - 1) * limit;

        const query = {};

        if (title) {
            query.title = {
                $regex: title,
                $options: "i"
            };
        }

        if (slug) {
            query.slug = slug;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (tags) {
            const tagList = Array.isArray(tags)
                ? tags
                : tags.split(",").map((tag) => tag.trim()).filter(Boolean);
            query.tags = { $in: tagList };
        }

        const problems = await Problem.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select("-__v");

        const totalProblem =
            await Problem.countDocuments(query);

        return sendSuccess(
            res,
            200,
            "Problems retrieved successfully",
            {
                problems,
                pagination: {
                    totalProblem,
                    currentPage: page,
                    totalPages: Math.ceil(
                        totalProblem / limit
                    ),
                    limit
                }
            }
        );

    } catch (error) {
        console.error(error);

        return sendError(
            res,
            500,
            "Internal server error"
        );
    }
};

export const getProblemBySlug=async(req,res)=>{
    try{
        const {slug}=req.validated.params;
        const problem=await Problem.findOne({
            slug:slug.toLowerCase().trim()
        }).lean();
        if(!problem){
            return sendError(res,404,"Problem not found");
        }
        // Older documents use the original schema typo (`exmaples`). Expose a
        // stable API field so the problem page can always render examples.
        problem.examples = problem.examples || problem.exmaples || [];
        delete problem.exmaples;
        return sendSuccess(res,200,"Problem retrieved successfully",problem);
    }catch(error){
        console.error("error in fetching problem by slug",error);
        return sendError(res,500,"Internal server error");
    }
}

export const updateProblem = async (req, res) => {
    try {
        const { id } = req.validated.params;
        const updateData = { ...req.validated.body };

        if (updateData.examples) {
            updateData.exmaples = updateData.examples.map(({ explanation, ...example }) => (
                explanation?.trim()
                    ? { ...example, explanation: explanation.trim() }
                    : example
            ));
            delete updateData.examples;
        }

        if (updateData.title) {
            updateData.slug = updateData.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");

            const existingTitle = await Problem.findOne({
                title: updateData.title,
                _id: { $ne: id }
            });

            if (existingTitle) {
                return sendError(
                    res,
                    409,
                    "Problem title already exists"
                );
            }

            const existingSlug = await Problem.findOne({
                slug: updateData.slug,
                _id: { $ne: id }
            });

            if (existingSlug) {
                return sendError(
                    res,
                    409,
                    "Problem slug already exists"
                );
            }
        }

        const updatedProblem =
            await Problem.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).select("-__v");

        if (!updatedProblem) {
            return sendError(
                res,
                404,
                "Problem not found"
            );
        }

        return sendSuccess(
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

        if (error.code === 11000) {
            return sendError(
                res,
                409,
                "Title or slug already exists"
            );
        }

        return sendError(
            res,
            500,
            "Internal server error"
        );
    }
};

export const deleteProblem = async (req, res) => {
    try {
        const { id } = req.validated.params;
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) {
            return sendError(res, 404, "Problem not found");
        }
        return sendSuccess(res, 200, "Problem deleted successfully", deletedProblem);
    } catch (error) {
        console.error("Error deleting problem:", error);
        return sendError(res, 500, "Internal server error");
    }
};

