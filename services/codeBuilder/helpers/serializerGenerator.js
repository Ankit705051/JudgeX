import { normalizeType, getLanguageType } from '../typeRegistry.js';

// Generate C++ output writing code
const generateCppOutputWriting = (returnType) => {
    const type = normalizeType(returnType);

    switch (type) {

        case "ListNode":
            return `    cout << serializeList(result) << endl;`;

        case "TreeNode":
            return `    cout << serializeTree(result) << endl;`;

        case "graph":
        case "Graph":
            return `    cout << serializeGraph(result) << endl;`;

        case "int[]":
        case "List<Integer>":
        case "ArrayList<Integer>":
            return `    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << result[i];
    }
    cout << "]" << endl;`;

        case "string[]":
        case "List<String>":
        case "ArrayList<String>":
            return `    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << char(34) << result[i] << char(34);
    }
    cout << "]" << endl;`;

        case "bool[]":
        case "List<Boolean>":
            return `    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << (result[i] ? "true" : "false");
    }
    cout << "]" << endl;`;

        case "double[]":
        case "List<Double>":
            return `    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << result[i];
    }
    cout << "]" << endl;`;

        case "long[]":
        case "List<Long>":
            return `    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << result[i];
    }
    cout << "]" << endl;`;

        case "int[][]":
        case "List<List<Integer>>":
            return `    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << "[";
        for (size_t j = 0; j < result[i].size(); j++) {
            if (j > 0) cout << ",";
            cout << result[i][j];
        }
        cout << "]";
    }
    cout << "]" << endl;`;

        case "string[][]":
            return `    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << "[";
        for (size_t j = 0; j < result[i].size(); j++) {
            if (j > 0) cout << ",";
            cout << char(34) << result[i][j] << char(34);
        }
        cout << "]";
    }
    cout << "]" << endl;`;

        case "bool":
            return `    cout << (result ? "true" : "false") << endl;`;

        case "string":
            return `    cout << result << endl;`;

        case "char":
            return `    cout << result << endl;`;

        case "int":
        case "long":
        case "double":
        default:
            return `    cout << result << endl;`;
    }
};

// Generate Java output writing code
const generateJavaOutputWriting = (returnType) => {
    const type = normalizeType(returnType);

    switch (type) {

        case "ListNode":
            return `        System.out.println(serializeList(result));`;

        case "TreeNode":
            return `        System.out.println(serializeTree(result));`;

        case "graph":
        case "Graph":
            return `        System.out.println(serializeGraph(result));`;

        case "List<Integer>":
        case "ArrayList<Integer>":
        case "List<Long>":
        case "List<Double>":
        case "List<Boolean>":
            return `        System.out.println(result.toString().replace(" ", ""));`;

        case "List<String>":
        case "ArrayList<String>":
            return `        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\\"").append(result.get(i)).append("\\"");
        }
        sb.append("]");
        System.out.println(sb.toString());`;

        case "List<List<Integer>>":
            return `        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            List<Integer> row = result.get(i);
            for (int j = 0; j < row.size(); j++) {
                if (j > 0) sb.append(",");
                sb.append(row.get(j));
            }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());`;

        case "int[]":
        case "long[]":
        case "double[]":
            return `        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(result[i]);
        }
        sb.append("]");
        System.out.println(sb.toString());`;

        case "bool[]":
            return `        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(result[i] ? "true" : "false");
        }
        sb.append("]");
        System.out.println(sb.toString());`;

        case "string[]":
            return `        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(",");
            sb.append("\\"").append(result[i]).append("\\"");
        }
        sb.append("]");
        System.out.println(sb.toString());`;

        case "int[][]":
            return `        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            for (int j = 0; j < result[i].length; j++) {
                if (j > 0) sb.append(",");
                sb.append(result[i][j]);
            }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());`;

        case "string[][]":
            return `        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            for (int j = 0; j < result[i].length; j++) {
                if (j > 0) sb.append(",");
                sb.append("\\"").append(result[i][j]).append("\\"");
            }
            sb.append("]");
        }
        sb.append("]");
        System.out.println(sb.toString());`;

        case "string":
        case "char":
            return `        System.out.println(result);`;

        case "int":
        case "long":
        case "double":
        default:
            return `        System.out.println(result);`;
    }
};
// Generate JavaScript output writing code
const generateJavascriptOutputWriting = (returnType) => {
    const type = normalizeType(returnType);

    switch (type) {

        case "ListNode":
            return `    console.log(serializeList(result));`;

        case "TreeNode":
            return `    console.log(serializeTree(result));`;

        default:
            return `    if (result === null || result === undefined) {
        console.log("null");
    } else if (typeof result === "boolean") {
        console.log(result ? "true" : "false");
    } else if (Array.isArray(result) || typeof result === "object") {
        console.log(JSON.stringify(result));
    } else {
        console.log(String(result));
    }`;
    }
};
const generatePythonOutputWriting = (returnType) => {
    const type = normalizeType(returnType);

    switch (type) {

        case "ListNode":
            return `    print(serialize_list(result))`;

        case "TreeNode":
            return `    print(serialize_tree(result))`;

        default:
            return `    if result is None:
        print("null")
    elif isinstance(result, bool):
        print("true" if result else "false")
    elif isinstance(result, (list, dict)):
        print(json.dumps(result, separators=(",", ":")))
    else:
        print(result)`;
    }
};

// Generate function call code
const generateFunctionCall = (
    userCode,
    functionName,
    paramNames,
    language,
    returnType
) => {

    const hasSolutionClass = /\bclass\s+Solution\b/.test(userCode);
    const args = paramNames.length ? paramNames.join(", ") : "";

    switch (language) {

        case "cpp":
            return hasSolutionClass
                ? `    Solution solver;
    auto result = solver.${functionName}(${args});`
                : `    auto result = ${functionName}(${args});`;

        case "java": {
            const javaType = getLanguageType(returnType, "java");

            return hasSolutionClass
                ? `        Solution solver = new Solution();
        ${javaType} result = solver.${functionName}(${args});`
                : `        ${javaType} result = ${functionName}(${args});`;
        }

        case "python":
            return hasSolutionClass
                ? `    solver = Solution()
    result = solver.${functionName}(${args})`
                : `    result = ${functionName}(${args})`;

        case "javascript":
            return hasSolutionClass
                ? `    const solver = new Solution();
    const result = solver.${functionName}(${args});`
                : `    const result = ${functionName}(${args});`;

        default:
            throw new Error(`Unsupported language: ${language}`);
    }
};


export {
    generateCppOutputWriting,
    generateJavaOutputWriting,
    generatePythonOutputWriting,
    generateJavascriptOutputWriting,
    generateFunctionCall
};
