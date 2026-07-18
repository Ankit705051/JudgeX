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
    const userImportLines = [];
    const userCodeBody = userCode
        .split("\n")
        .filter((line) => {
            const trimmedLine = line.trim();

            if (
                trimmedLine.startsWith("import ") ||
                trimmedLine.startsWith("package ")
            ) {
                userImportLines.push(trimmedLine);
                return false;
            }

            return true;
        })
        .join("\n");

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
    const resolvedParameters = Array.isArray(parameters) ? parameters : [];

    // Determine required structures
    const needsListNode =
        resolvedParameters.some(
            (p) => normalizeType(p.type) === "ListNode"
        ) || normalizedReturnType === "ListNode";

    const needsTreeNode =
        resolvedParameters.some(
            (p) => normalizeType(p.type) === "TreeNode"
        ) || normalizedReturnType === "TreeNode";

    const needsGraph =
        resolvedParameters.some(
            (p) => normalizeType(p.type) === "graph"
        ) || normalizedReturnType === "graph";

    // Generate helper methods
    const { imports: javaImports, helpers: helperMethods } = generateJavaParsers(resolvedParameters);

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

    if (needsGraph) {
        serializers += graph.javaGraphSerializer + "\n";
    }

    // Generate input parsing
    const { inputReading, paramNames } =
        generateJavaInputReading(resolvedParameters);

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
${userImportLines.join("\n")}
${javaImports}
${structureDefs}

${userCodeBody}

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
