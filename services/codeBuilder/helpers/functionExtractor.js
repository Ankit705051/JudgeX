import { normalizeType } from "../typeRegistry.js";

const splitJavaParameters = (parameterList) => {
    const parameters = [];
    let current = "";
    let depth = 0;

    for (let index = 0; index < parameterList.length; index++) {
        const character = parameterList[index];

        if (character === "<") depth++;
        if (character === ">") depth = Math.max(0, depth - 1);

        if (character === "," && depth === 0) {
            if (current.trim()) parameters.push(current.trim());
            current = "";
            continue;
        }

        current += character;
    }

    if (current.trim()) {
        parameters.push(current.trim());
    }

    return parameters;
};

const splitCppParameters = (parameterList) => splitJavaParameters(parameterList);

const stripJavaModifiers = (typeText) =>
    typeText
        .replace(/\b(public|protected|private|static|final|abstract|synchronized|native|strictfp)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

const stripCppModifiers = (typeText) =>
    typeText
        .replace(/\b(public|protected|private)\s*:/g, "")
        .replace(/\b(const|constexpr|inline|static|virtual|mutable|volatile|friend|explicit)\b/g, "")
        .replace(/\bstd::/g, "")
        .replace(/[&*]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();

const extractJavaSignature = (userCode, functionName) => {
    const functionMatch = new RegExp(`\\b${functionName}\\s*\\(`).exec(userCode);
    const functionIndex = functionMatch?.index ?? -1;
    if (functionIndex === -1) {
        return null;
    }

    const openParenIndex = userCode.indexOf("(", functionIndex);
    if (openParenIndex === -1) {
        return null;
    }

    let depth = 0;
    let closeParenIndex = -1;

    for (let index = openParenIndex; index < userCode.length; index++) {
        const character = userCode[index];

        if (character === "(") depth++;
        if (character === ")") {
            depth--;
            if (depth === 0) {
                closeParenIndex = index;
                break;
            }
        }
    }

    if (closeParenIndex === -1) {
        return null;
    }

    const beforeFunction = userCode.slice(0, functionIndex);
    const lastBoundary = Math.max(
        beforeFunction.lastIndexOf("{"),
        beforeFunction.lastIndexOf(";"),
        beforeFunction.lastIndexOf("}")
    );
    const signaturePrefix =
        lastBoundary >= 0
            ? beforeFunction.slice(lastBoundary + 1)
            : beforeFunction;
    const returnType = stripJavaModifiers(signaturePrefix);
    const rawParameters = userCode.slice(openParenIndex + 1, closeParenIndex).trim();

    if (!rawParameters) {
        return {
            returnType,
            parameters: [],
        };
    }

    const parameters = splitJavaParameters(rawParameters).map((parameter) => {
        const cleaned = stripJavaModifiers(parameter);
        const parts = cleaned.split(/\s+/);

        if (parts.length < 2) {
            return {
                name: cleaned,
                type: cleaned,
            };
        }

        const name = parts.pop();
        const type = parts.join(" ");

        return { name, type };
    });

    return {
        returnType,
        parameters,
    };
};

const extractCppSignature = (userCode, functionName) => {
    const functionIndex = userCode.indexOf(`${functionName}(`);
    if (functionIndex === -1) {
        return null;
    }

    const openParenIndex = userCode.indexOf("(", functionIndex);
    if (openParenIndex === -1) {
        return null;
    }

    let depth = 0;
    let closeParenIndex = -1;

    for (let index = openParenIndex; index < userCode.length; index++) {
        const character = userCode[index];

        if (character === "(") depth++;
        if (character === ")") {
            depth--;
            if (depth === 0) {
                closeParenIndex = index;
                break;
            }
        }
    }

    if (closeParenIndex === -1) {
        return null;
    }

    const beforeFunction = userCode.slice(0, functionIndex);
    const lastBoundary = Math.max(
        beforeFunction.lastIndexOf("{"),
        beforeFunction.lastIndexOf(";"),
        beforeFunction.lastIndexOf("}")
    );
    const signaturePrefix =
        lastBoundary >= 0
            ? beforeFunction.slice(lastBoundary + 1)
            : beforeFunction;
    const returnType = stripCppModifiers(signaturePrefix);
    const rawParameters = userCode.slice(openParenIndex + 1, closeParenIndex).trim();

    if (!rawParameters) {
        return {
            returnType,
            parameters: [],
        };
    }

    const parameters = splitCppParameters(rawParameters).map((parameter) => {
        const cleaned = stripCppModifiers(parameter);
        const parts = cleaned.split(/\s+/);

        if (parts.length < 2) {
            return {
                name: cleaned,
                type: cleaned,
            };
        }

        const name = parts.pop();
        const type = parts.join(" ");

        return { name, type };
    });

    return {
        returnType,
        parameters,
    };
};

/**
 * Return the canonical return type from the problem definition.
 */
const extractReturnType = (userCode, functionName, language, problem) => {
    if (language === "cpp") {
        const signature = extractCppSignature(userCode, functionName);

        if (signature?.returnType) {
            return normalizeType(signature.returnType);
        }
    }

    if (language === "java") {
        const signature = extractJavaSignature(userCode, functionName);

        if (signature?.returnType) {
            return normalizeType(signature.returnType);
        }
    }

    if (!problem?.returnType) {
        throw new Error("Problem returnType is missing.");
    }

    return normalizeType(problem.returnType);
};

/**
 * Return the canonical parameter list from the problem definition.
 */
const extractParameters = (userCode, functionName, language, problem) => {
    if (language === "cpp") {
        const signature = extractCppSignature(userCode, functionName);

        if (signature?.parameters?.length) {
            return signature.parameters;
        }
    }

    if (language === "java") {
        const signature = extractJavaSignature(userCode, functionName);

        if (signature?.parameters?.length) {
            return signature.parameters;
        }

        if (!Array.isArray(problem?.parameters)) {
            throw new Error("Problem parameters are missing.");
        }

        return problem.parameters.map((param) => ({
            name: param.name,
            type: normalizeType(param.type),
        }));
    }

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
