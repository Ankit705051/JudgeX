import { extractReturnType, extractParameters } from "./helpers/functionExtractor.js";
import {
    generateCppParsers,
    generateCppInputReading,
} from "./helpers/parserGenerator.js";
import {
    generateCppOutputWriting,
    generateFunctionCall,
} from "./helpers/serializerGenerator.js";
import { normalizeType } from "./typeRegistry.js";
import * as linkedList from "./structures/linkedList.js";
import * as tree from "./structures/tree.js";
import * as graph from "./structures/graph.js";

const buildCpp = (userCode, problem) => {
    // Get metadata from problem definition
    const returnType = extractReturnType(
        userCode,
        problem.functionName,
        "cpp",
        problem
    );

    const parameters = extractParameters(
        userCode,
        problem.functionName,
        "cpp",
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

    // Generate helper parsers
    const { includes: cppIncludes, helpers: helperFunctions } = generateCppParsers(parameters);

    // Generate structure definitions
    let structureDefs = "";

    if (needsListNode) {
        structureDefs += linkedList.cppListNodeDef + "\n";
    }

    if (needsTreeNode) {
        structureDefs += tree.cppTreeNodeDef + "\n";
    }

    // Generate serializers
    let serializers = "";

    if (needsListNode) {
        serializers += linkedList.cppListSerializer + "\n";
    }

    if (needsTreeNode) {
        serializers += tree.cppTreeSerializer + "\n";
    }

    if (needsGraph) {
        serializers += graph.cppGraphSerializer + "\n";
    }

    // Generate input parsing
    const { inputReading, paramNames } =
        generateCppInputReading(parameters);

    // Generate function invocation
    const callCode = generateFunctionCall(
        userCode,
        problem.functionName,
        paramNames,
        "cpp",
        returnType
    );

    // Generate output serialization
    const outputWriting = generateCppOutputWriting(returnType);

    return `
#include <bits/stdc++.h>
${cppIncludes}
using namespace std;

${structureDefs}

${helperFunctions}

${serializers}

${userCode}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

${inputReading}

${callCode}

${outputWriting}

    return 0;
}
`;
};

export default buildCpp;
