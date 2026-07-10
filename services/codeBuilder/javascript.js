import { extractParameters } from "./helpers/functionExtractor.js";
import {
    generateJavascriptInputParsing,
} from "./helpers/parserGenerator.js";
import {
    generateJavascriptOutputWriting,
    generateFunctionCall,
} from "./helpers/serializerGenerator.js";
import { normalizeType } from './typeRegistry.js';
import * as linkedList from './structures/linkedList.js';
import * as tree from './structures/tree.js';

const buildJavascript = (userCode, problem) => {
    if (!problem) {
        throw new Error("Problem metadata is required.");
    }

    if (!problem.functionName) {
        throw new Error("Problem functionName is required.");
    }

    const parameters =
        problem.parameters?.length
            ? [...problem.parameters]
            : extractParameters(
                  userCode,
                  problem.functionName,
                  "javascript"
              );

    // Check if custom types are needed
    const needsListNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === 'listnode' || type === 'ListNode';
    }) || normalizeType(problem.returnType) === 'listnode' || normalizeType(problem.returnType) === 'ListNode';
    
    const needsTreeNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === 'treenode' || type === 'TreeNode';
    }) || normalizeType(problem.returnType) === 'treenode' || normalizeType(problem.returnType) === 'TreeNode';

    const { parsingCode, paramNames } =
        generateJavascriptInputParsing(parameters);

    const callCode = generateFunctionCall(
        userCode,
        problem.functionName,
        paramNames,
        "javascript"
    );

    const outputWriting =
        generateJavascriptOutputWriting(problem.returnType);

    // Add structure definitions if needed
    let structureDefs = '';
    if (needsListNode) {
        structureDefs += linkedList.javascriptListNodeDef;
    }
    if (needsTreeNode) {
        structureDefs += tree.javascriptTreeNodeDef;
    }
    
    // Add parsers if needed
    let parsers = '';
    if (needsListNode) {
        parsers += linkedList.javascriptListParser;
    }
    if (needsTreeNode) {
        parsers += tree.javascriptTreeParser;
    }
    
    // Add serializers if needed
    let serializers = '';
    if (needsListNode) {
        serializers += linkedList.javascriptListSerializer;
    }
    if (needsTreeNode) {
        serializers += tree.javascriptTreeSerializer;
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
