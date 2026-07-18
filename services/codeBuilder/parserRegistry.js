import { normalizeType, isCustomType } from './typeRegistry.js';

// Registry for custom parsers (trees, linked lists, graphs)
const parserRegistry = {
    // Tree parsers
    tree: {
        // Parse tree from LeetCode format: [1,2,3,null,null,4,5]
        cpp: (varName) => `
    cout << parseTree(${varName}) << endl;
`,
        java: (varName) => `
        System.out.println(serializeTree(${varName}));
`,
        python: (varName) => `    print(serialize_tree(${varName}))\n`,
        javascript: (varName) => `    console.log(serializeTree(${varName}));\n`
    },
    
    // Linked list serializers
    linkedList: {
        // Serialize linked list to LeetCode format: [1,2,3,4,5]
        cpp: (varName) => `
    cout << serializeList(${varName}) << endl;
`,
        java: (varName) => `
        System.out.println(serializeList(${varName}));
`,
        python: (varName) => `    print(serialize_list(${varName}))\n`,
        javascript: (varName) => `    console.log(serializeList(${varName}));\n`
    },
    
    // Graph serializers
    graph: {
        // Serialize graph to adjacency list format
        cpp: (varName) => `
    cout << serializeGraph(${varName}) << endl;
`,
        java: (varName) => `
        System.out.println(serializeGraph(${varName}));
`,
        python: (varName) => `    print(serialize_graph(${varName}))\n`,
        javascript: (varName) => `    console.log(serializeGraph(${varName}));\n`
    }
};

// Get parser for a specific type and language
const getParser = (type, language) => {
    const normalizedType = normalizeType(type).toLowerCase();
    
    if (normalizedType === 'treenode' || normalizedType === 'listnode' || normalizedType === 'graph') {
        const structureType =
            normalizedType === 'treenode'
                ? 'tree'
                : normalizedType === 'listnode'
                    ? 'linkedList'
                    : 'graph';
        return parserRegistry[structureType]?.[language];
    }
    
    return null;
};

// Check if a type requires a custom serializer
const requiresCustomParser = (type) => {
    return isCustomType(type);
};

export {
    parserRegistry,
    getParser,
    requiresCustomParser
};
