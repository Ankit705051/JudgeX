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

        "List<Integer>": "vector<int>",
        "List<Long>": "vector<long long>",
        "List<Double>": "vector<double>",
        "List<Boolean>": "vector<bool>",
        "List<String>": "vector<string>",
        "List<List<Integer>>": "vector<vector<int>>",
        "ArrayList<Integer>": "vector<int>",
        "ArrayList<String>": "vector<string>",

        ListNode: "ListNode*",
        TreeNode: "TreeNode*",
    },

    java: {
        int: "int",
        long: "long",
        double: "double",
        bool: "boolean",
        string: "String",
        "List<Integer>": "List<Integer>",
        "List<Long>": "List<Long>",
        "List<Double>": "List<Double>",
        "List<Boolean>": "List<Boolean>",
        "List<String>": "List<String>",
        "List<List<Integer>>": "List<List<Integer>>",
        "ArrayList<Integer>": "ArrayList<Integer>",
        "ArrayList<String>": "ArrayList<String>",

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

        "List<Integer>": "List[int]",
        "List<Long>": "List[int]",
        "List<Double>": "List[float]",
        "List<Boolean>": "List[bool]",
        "List<String>": "List[str]",
        "List<List<Integer>>": "List[List[int]]",
        "ArrayList<Integer>": "List[int]",
        "ArrayList<String>": "List[str]",

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

        "List<Integer>": "number[]",
        "List<Long>": "number[]",
        "List<Double>": "number[]",
        "List<Boolean>": "boolean[]",
        "List<String>": "string[]",
        "List<List<Integer>>": "number[][]",
        "ArrayList<Integer>": "number[]",
        "ArrayList<String>": "string[]",

        ListNode: "ListNode",
        TreeNode: "TreeNode",
    },
};

const normalizeType = (type) => {
    if (!type) return "int";

    const normalized = type
        .trim()
        .replace(/^std::/g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([<>,\[\]])\s*/g, "$1")
        .replace(/[&*]+$/g, "")
        .trim();

    const typeMap = {
        // Primitive
        int: "int",
        integer: "int",
        Integer: "int",

        long: "long",
        Long: "long",
        "long long": "long",

        float: "double",
        double: "double",
        Float: "double",
        Double: "double",

        bool: "bool",
        boolean: "bool",
        Boolean: "bool",

        string: "string",
        String: "string",
        str: "string",

        "List<Integer>": "List<Integer>",
        "List<Long>": "List<Long>",
        "List<Double>": "List<Double>",
        "List<Boolean>": "List<Boolean>",
        "List<String>": "List<String>",
        "List<List<Integer>>": "List<List<Integer>>",
        "ArrayList<Integer>": "ArrayList<Integer>",
        "ArrayList<String>": "ArrayList<String>",

        "list<int>": "List<Integer>",
        "list<long>": "List<Long>",
        "list<double>": "List<Double>",
        "list<bool>": "List<Boolean>",
        "list<string>": "List<String>",
        "list<list<int>>": "List<List<Integer>>",

        char: "char",
        "char[]": "string",

        // 1D Arrays
        "int[]": "int[]",
        "integer[]": "int[]",
        array: "int[]",
        "vector<int>": "int[]",

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

        // 2D Arrays
        "int[][]": "int[][]",
        "vector<vector<int>>": "int[][]",

        "string[][]": "string[][]",
        "vector<vector<string>>": "string[][]",

        graph: "graph",
        Graph: "graph",

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
    return normalized === "ListNode" || normalized === "TreeNode" || normalized === "graph" || normalized === "Graph";
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
