import { extractReturnType, extractParameters } from "./helpers/functionExtractor.js";
import {
    generateJavaParsers,
    generateJavaInputReading,
} from "./helpers/parserGenerator.js";
import {
    generateJavaOutputWriting,
    generateFunctionCall,
} from "./helpers/serializerGenerator.js";
import { normalizeType } from "./typeRegistry.js";
import * as linkedList from "./structures/linkedList.js";
import * as tree from "./structures/tree.js";

const buildJava = (userCode, problem) => {
    // Get metadata from problem definition
    const returnType = extractReturnType(
        userCode,
        problem.functionName,
        "java",
        problem
    );

    const parameters = extractParameters(
        userCode,
        problem.functionName,
        "java",
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

    // Generate helper methods
    const helperMethods = generateJavaParsers(parameters);

    // Generate structure definitions
    let structureDefs = "";

    if (needsListNode) {
        structureDefs += linkedList.javaListNodeDef + "\n";
    }

    if (needsTreeNode) {
        structureDefs += tree.javaTreeNodeDef + "\n";
    }

    // Generate serializers
    let serializers = "";

    if (needsListNode) {
        serializers += linkedList.javaListSerializer + "\n";
    }

    if (needsTreeNode) {
        serializers += tree.javaTreeSerializer + "\n";
    }

    // Generate input parsing
    const { inputReading, paramNames } =
        generateJavaInputReading(parameters);

    // Generate function invocation
    const callCode = generateFunctionCall(
        userCode,
        problem.functionName,
        paramNames,
        "java",
        returnType
    );

    // Generate output serialization
    const outputWriting = generateJavaOutputWriting(returnType);

    return `
import java.util.*;
import java.io.*;

${structureDefs}

${userCode}

public class Main {

${helperMethods}

${serializers}

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

${inputReading}

${callCode}

${outputWriting}
    }
}
`;
};

export default buildJava;