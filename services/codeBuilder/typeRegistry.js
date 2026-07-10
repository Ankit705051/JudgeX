// Language-specific type mappings
const TYPE_MAPPINGS = {
    cpp: {
        int: "int",
        long: "long long",
        double: "double",
        bool: "bool",
        string: "string",

        "int[]": "vector<int>",
        "long[]": "vector<long long>",
        "double[]": "vector<double>",
        "bool[]": "vector<bool>",
        "string[]": "vector<string>",

        "int[][]": "vector<vector<int>>",
        "string[][]": "vector<vector<string>>",

        ListNode: "ListNode*",
        TreeNode: "TreeNode*",
    },

    java: {
        int: "int",
        long: "long",
        double: "double",
        bool: "boolean",
        string: "String",

        "int[]": "int[]",
        "long[]": "long[]",
        "double[]": "double[]",
        "bool[]": "boolean[]",
        "string[]": "String[]",

        "int[][]": "int[][]",
        "string[][]": "String[][]",

        ListNode: "ListNode",
        TreeNode: "TreeNode",
    },

    python: {
        int: "int",
        long: "int",
        double: "float",
        bool: "bool",
        string: "str",

        "int[]": "List[int]",
        "long[]": "List[int]",
        "double[]": "List[float]",
        "bool[]": "List[bool]",
        "string[]": "List[str]",

        "int[][]": "List[List[int]]",
        "string[][]": "List[List[str]]",

        ListNode: "ListNode",
        TreeNode: "TreeNode",
    },

    javascript: {
        int: "number",
        long: "number",
        double: "number",
        bool: "boolean",
        string: "string",

        "int[]": "number[]",
        "long[]": "number[]",
        "double[]": "number[]",
        "bool[]": "boolean[]",
        "string[]": "string[]",

        "int[][]": "number[][]",
        "string[][]": "string[][]",

        ListNode: "ListNode",
        TreeNode: "TreeNode",
    },
};

const normalizeType = (type) => {
    if (!type) return "int";

    const normalized = type.trim();

    const typeMap = {
        // Primitive
        int: "int",
        integer: "int",

        long: "long",
        "long long": "long",

        float: "double",
        double: "double",

        bool: "bool",
        boolean: "bool",

        string: "string",
        str: "string",

        char: "char",
        "char[]": "string",

        // 1D Arrays
        "int[]": "int[]",
        "integer[]": "int[]",
        array: "int[]",
        "vector<int>": "int[]",
        "list<int>": "int[]",

        "long[]": "long[]",
        "vector<long long>": "long[]",

        "double[]": "double[]",
        "float[]": "double[]",
        "vector<double>": "double[]",

        "bool[]": "bool[]",
        "boolean[]": "bool[]",
        "vector<bool>": "bool[]",

        "string[]": "string[]",
        "str[]": "string[]",
        "vector<string>": "string[]",
        "list<string>": "string[]",

        // 2D Arrays
        "int[][]": "int[][]",
        "vector<vector<int>>": "int[][]",

        "string[][]": "string[][]",
        "vector<vector<string>>": "string[][]",

        // Custom Types
        listnode: "ListNode",
        ListNode: "ListNode",

        treenode: "TreeNode",
        TreeNode: "TreeNode",
    };

    return typeMap[normalized] || normalized;
};

const isArrayType = (type) => {
    return normalizeType(type).endsWith("[]");
};

const is2DArrayType = (type) => {
    return normalizeType(type).endsWith("[][]");
};

const isCustomType = (type) => {
    const normalized = normalizeType(type);
    return normalized === "ListNode" || normalized === "TreeNode";
};

const getLanguageType = (type, language) => {
    const normalized = normalizeType(type);
    return TYPE_MAPPINGS[language]?.[normalized] || normalized;
};

export {
    TYPE_MAPPINGS,
    normalizeType,
    isArrayType,
    is2DArrayType,
    isCustomType,
    getLanguageType,
};