// Main entry point for codeBuilder module

import buildCpp from "./cpp.js";
import buildJava from "./java.js";
import buildPython from "./python.js";
import buildJavascript from "./javascript.js";

// Type registry exports
import {
    TYPE_MAPPINGS,
    normalizeType,
    isArrayType,
    is2DArrayType,
    isCustomType,
    getLanguageType,
} from "./typeRegistry.js";

// Structure exports
import * as tree from "./structures/tree.js";
import * as linkedList from "./structures/linkedList.js";
import * as graph from "./structures/graph.js";

/**
 * Build executable source code for the given language.
 */
const buildCode = (userCode, language, problem) => {
    switch (language) {
        case "cpp":
            return buildCpp(userCode, problem);

        case "java":
            return buildJava(userCode, problem);

        case "python":
            return buildPython(userCode, problem);

        case "javascript":
            return buildJavascript(userCode, problem);

        default:
            throw new Error(`Unsupported language: ${language}`);
    }
};

export {
    // Main builder
    buildCode,

    // Language builders
    buildCpp,
    buildJava,
    buildPython,
    buildJavascript,

    // Type utilities
    TYPE_MAPPINGS,
    normalizeType,
    isArrayType,
    is2DArrayType,
    isCustomType,
    getLanguageType,

    // Structures
    tree,
    linkedList,
    graph,
};