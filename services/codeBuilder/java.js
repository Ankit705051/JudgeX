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
import * as graph from "./structures/graph.js";

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

    const needsGraph =
        parameters.some(
            (p) => normalizeType(p.type) === "graph"
        ) || normalizedReturnType === "graph";

    // Generate helper methods
    const { imports: javaImports, helpers: helperMethods } = generateJavaParsers(parameters);

    // Generate structure definitions. Skip defs the user already declared —
    // a duplicate top-level class fails compilation. userCode is emitted
    // BEFORE these defs so user `import` statements stay legal (imports must
    // precede all type declarations in a Java file).
    let structureDefs = "";

    if (needsListNode && !/class\s+ListNode\s*\{/.test(userCode)) {
        structureDefs += linkedList.javaListNodeDef + "\n";
    }

    if (needsTreeNode && !/class\s+TreeNode\s*\{/.test(userCode)) {
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

    if (needsGraph) {
        serializers += graph.javaGraphSerializer + "\n";
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
${javaImports}

${userCode}

${structureDefs}

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
