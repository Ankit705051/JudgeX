import {
    extractReturnType,
    extractParameters,
} from "./helpers/functionExtractor.js";

import {
    generateJavascriptInputParsing,
} from "./helpers/parserGenerator.js";

import {
    generateJavascriptOutputWriting,
    generateFunctionCall,
} from "./helpers/serializerGenerator.js";

import { normalizeType } from "./typeRegistry.js";

import * as linkedList from "./structures/linkedList.js";
import * as tree from "./structures/tree.js";

const buildJavascript = (userCode, problem) => {
    if (!problem) {
        throw new Error("Problem metadata is required.");
    }

    if (!problem.functionName) {
        throw new Error("Problem functionName is required.");
    }

    // Get metadata
    const returnType = extractReturnType(
        userCode,
        problem.functionName,
        "javascript",
        problem
    );

    const parameters = extractParameters(
        userCode,
        problem.functionName,
        "javascript",
        problem
    );

    const normalizedReturnType = normalizeType(returnType);

    // Determine required structures
    const needsListNode =
        parameters.some(
            (p) => normalizeType(p.type) === "ListNode"
        ) || normalizedReturnType === "ListNode";

    const needsTreeNode =
        parameters.some(
            (p) => normalizeType(p.type) === "TreeNode"
        ) || normalizedReturnType === "TreeNode";

    // Generate input parsing
    const { parsingCode, paramNames } =
        generateJavascriptInputParsing(parameters);

    // Generate function call
    const callCode = generateFunctionCall(
        userCode,
        problem.functionName,
        paramNames,
        "javascript",
        returnType
    );

    // Generate output serialization
    const outputWriting =
        generateJavascriptOutputWriting(returnType);

    // Structure definitions
    let structureDefs = "";

    if (needsListNode) {
        structureDefs += linkedList.javascriptListNodeDef + "\n";
    }

    if (needsTreeNode) {
        structureDefs += tree.javascriptTreeNodeDef + "\n";
    }

    // Parsers
    let parsers = "";

    if (needsListNode) {
        parsers += linkedList.javascriptListParser + "\n";
    }

    if (needsTreeNode) {
        parsers += tree.javascriptTreeParser + "\n";
    }

    // Serializers
    let serializers = "";

    if (needsListNode) {
        serializers += linkedList.javascriptListSerializer + "\n";
    }

    if (needsTreeNode) {
        serializers += tree.javascriptTreeSerializer + "\n";
    }

    return `
const fs = require("fs");

${structureDefs}

${userCode}

${parsers}

${serializers}

function main() {
    const input = fs.readFileSync(0, "utf8");

    if (!input.trim()) return;

    const inputLines = input
        .trim()
        .split(/\\r?\\n/);

${parsingCode}

${callCode}

${outputWriting}
}

main();
`;
};

export default buildJavascript;