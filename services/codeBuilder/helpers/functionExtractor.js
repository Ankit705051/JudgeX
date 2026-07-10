import { normalizeType } from "../typeRegistry.js";

/**
 * Return the canonical return type from the problem definition.
 */
const extractReturnType = (userCode, functionName, language, problem) => {
    if (!problem?.returnType) {
        throw new Error("Problem returnType is missing.");
    }

    return normalizeType(problem.returnType);
};

/**
 * Return the canonical parameter list from the problem definition.
 */
const extractParameters = (userCode, functionName, language, problem) => {
    if (!Array.isArray(problem?.parameters)) {
        throw new Error("Problem parameters are missing.");
    }

    return problem.parameters.map((param) => ({
        name: param.name,
        type: normalizeType(param.type),
    }));
};

export {
    extractReturnType,
    extractParameters,
};