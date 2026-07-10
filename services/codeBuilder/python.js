import {
    extractReturnType,
    extractParameters,
} from "./helpers/functionExtractor.js";

import {
    generatePythonInputParsing,
} from "./helpers/parserGenerator.js";

import {
    generatePythonOutputWriting,
    generateFunctionCall,
} from "./helpers/serializerGenerator.js";

import { normalizeType } from "./typeRegistry.js";

import * as linkedList from "./structures/linkedList.js";
import * as tree from "./structures/tree.js";

const buildPython = (userCode, problem) => {
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
        "python",
        problem
    );

    const parameters = extractParameters(
        userCode,
        problem.functionName,
        "python",
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
        generatePythonInputParsing(parameters);

    // Generate function call
    const callCode = generateFunctionCall(
        userCode,
        problem.functionName,
        paramNames,
        "python",
        returnType
    );

    // Generate output writing
    const outputWriting =
        generatePythonOutputWriting(returnType);

    // Structure definitions
    let structureDefs = "";

    if (needsListNode) {
        structureDefs += linkedList.pythonListNodeDef + "\n";
    }

    if (needsTreeNode) {
        structureDefs += tree.pythonTreeNodeDef + "\n";
    }

    // Parsers
    let parsers = "";

    if (needsListNode) {
        parsers += linkedList.pythonListParser + "\n";
    }

    if (needsTreeNode) {
        parsers += tree.pythonTreeParser + "\n";
    }

    // Serializers
    let serializers = "";

    if (needsListNode) {
        serializers += linkedList.pythonListSerializer + "\n";
    }

    if (needsTreeNode) {
        serializers += tree.pythonTreeSerializer + "\n";
    }

    return `
import sys
import json

${structureDefs}

${userCode}

${parsers}

${serializers}

def main():
    input_data = sys.stdin.read()

    if not input_data.strip():
        return

    inputLines = input_data.strip().splitlines()

${parsingCode}

${callCode}

${outputWriting}

if __name__ == "__main__":
    main()
`;
};

export default buildPython;