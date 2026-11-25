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
import * as graph from "./structures/graph.js";

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

    const needsGraph =
        parameters.some(
            (p) => normalizeType(p.type) === "graph"
        ) || normalizedReturnType === "graph";

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

    if (needsListNode && !/class\s+ListNode\s*\{/.test(userCode)) {
        structureDefs += linkedList.javascriptListNodeDef + "\n";
    }

    if (needsTreeNode && !/class\s+TreeNode\s*\{/.test(userCode)) {
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

    if (needsGraph) {
        parsers += graph.javascriptGraphParser + "\n";
    }

    // Serializers
    let serializers = "";

    if (needsListNode) {
        serializers += linkedList.javascriptListSerializer + "\n";
    }

    if (needsTreeNode) {
        serializers += tree.javascriptTreeSerializer + "\n";
    }

    if (needsGraph) {
        serializers += graph.javascriptGraphSerializer + "\n";
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
