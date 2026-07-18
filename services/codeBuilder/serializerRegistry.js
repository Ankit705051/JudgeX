import { normalizeType, isCustomType } from './typeRegistry.js';

// Registry for custom serializers (trees, linked lists, graphs)
const serializerRegistry = {
    // Tree serializers
    tree: {
        // Serialize tree to LeetCode format: [1,2,3,null,null,4,5]
        cpp: (varName) => `
    cout << serializeTree(${varName}) << endl;
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

// Get serializer for a specific type and language
const getSerializer = (type, language) => {
    const normalizedType = normalizeType(type).toLowerCase();
    
    if (normalizedType === 'treenode' || normalizedType === 'listnode' || normalizedType === 'graph') {
        const structureType =
            normalizedType === 'treenode'
                ? 'tree'
                : normalizedType === 'listnode'
                    ? 'linkedList'
                    : 'graph';
        return serializerRegistry[structureType]?.[language];
    }
    
    return null;
};

// Check if a type requires a custom serializer
const requiresCustomSerializer = (type) => {
    return isCustomType(type);
};

export {
    serializerRegistry,
    getSerializer,
    requiresCustomSerializer
};
