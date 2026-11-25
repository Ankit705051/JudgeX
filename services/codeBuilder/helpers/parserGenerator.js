import { normalizeType, isArrayType, is2DArrayType, getLanguageType } from '../typeRegistry.js';
import { cppGraphParser } from '../structures/graph.js';



// Generate C++ parser helper functions
const generateCppParsers = (parameters) => {
    let helpers = '';

    const needsVectorVector = parameters.some(p => {
        const type = normalizeType(p?.type);
        return is2DArrayType(type) || type === "List<List<Integer>>";
    });

    const needsVectorInt = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === "int[]" ||
            type === "vector<int>" ||
            type === "array" ||
            type === "List<Integer>" ||
            type === "ArrayList<Integer>" ||
            // parseVectorVectorInt delegates each row to parseVectorInt
            is2DArrayType(type) ||
            type === "List<List<Integer>>" ||
            type === "graph";
    });

    const needsVectorString = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === "string[]" ||
            type === "vector<string>" ||
            type === "List<String>" ||
            type === "ArrayList<String>";
    });

    // Node parsers are supplied by structures/linkedList.js and tree.js.  Do
    // not emit a second copy here or C++ submissions fail to compile.
    const needsListNode = false;
    const needsTreeNode = false;

    const needsGraph = parameters.some(
        (p) => normalizeType(p?.type) === "graph"
    );

    const needsVectorLong = parameters.some((p) => {
        const type = normalizeType(p?.type);
        return type === "List<Long>" || type === "long[]";
    });

    const needsVectorDouble = parameters.some((p) => {
        const type = normalizeType(p?.type);
        return type === "List<Double>" || type === "double[]";
    });

    const needsVectorBool = parameters.some((p) => {
        const type = normalizeType(p?.type);
        return type === "List<Boolean>" || type === "bool[]";
    });

    if (needsVectorInt) {
        helpers += `
    vector<int> parseVectorInt(string s) {
        vector<int> result;
        s.erase(remove(s.begin(), s.end(), ' '), s.end());
        if (s.empty() || s == "[]")
            return result;
        if (s.front() == '[' && s.back() == ']')
            s = s.substr(1, s.size() - 2);
        if (s.empty())
            return result;
        stringstream ss(s);
        string token;

        while (getline(ss, token, ',')) {
            if (token.empty())
                continue;

            result.push_back(stoi(token));
        }

        return result;
    }
`;
    }

    if (needsVectorLong) {
        helpers += `
    vector<long long> parseVectorLong(string s) {
        vector<long long> result;
        s.erase(remove(s.begin(), s.end(), ' '), s.end());
        if (s.empty() || s == "[]")
            return result;
        if (s.front() == '[' && s.back() == ']')
            s = s.substr(1, s.size() - 2);
        if (s.empty())
            return result;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (token.empty())
                continue;
            result.push_back(stoll(token));
        }
        return result;
    }
`;
    }

    if (needsVectorDouble) {
        helpers += `
    vector<double> parseVectorDouble(string s) {
        vector<double> result;
        s.erase(remove(s.begin(), s.end(), ' '), s.end());
        if (s.empty() || s == "[]")
            return result;
        if (s.front() == '[' && s.back() == ']')
            s = s.substr(1, s.size() - 2);
        if (s.empty())
            return result;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (token.empty())
                continue;
            result.push_back(stod(token));
        }
        return result;
    }
`;
    }

    if (needsVectorBool) {
        helpers += `
    vector<bool> parseVectorBool(string s) {
        vector<bool> result;
        s.erase(remove(s.begin(), s.end(), ' '), s.end());
        if (s.empty() || s == "[]")
            return result;
        if (s.front() == '[' && s.back() == ']')
            s = s.substr(1, s.size() - 2);
        if (s.empty())
            return result;
        stringstream ss(s);
        string token;
        while (getline(ss, token, ',')) {
            if (token.empty())
                continue;
            result.push_back(token == "true" || token == "1");
        }
        return result;
    }
`;
    }

    if (needsGraph) {
        helpers += cppGraphParser + "\n";
    }

    if (needsVectorString) {
        helpers += `
    vector<string> parseVectorString(string s) {
        vector<string> result;

        if (s.empty() || s == "[]")
            return result;

        if (s.size() >= 2 && s.front() == '[' && s.back() == ']')
            s = s.substr(1, s.size() - 2);

        string current;
        bool inQuotes = false;
        bool escaped = false;

        for (char c : s) {
            if (escaped) {
                current += c;
                escaped = false;
                continue;
            }

            if (c == '\\\\') {
                escaped = true;
                continue;
            }
            if (c == '\\n') {
                current += '\\n';
                escaped = false;
                continue;
            }
            if (c == '"') {
                inQuotes = !inQuotes;
                continue;
            }

            if (!inQuotes && isspace(static_cast<unsigned char>(c))) {
                continue;
            }

            if (c == ',' && !inQuotes) {
                result.push_back(current);
                current.clear();
                continue;
            }

            current += c;
        }

        if (!current.empty())
            result.push_back(current);

        return result;
    }
`;
    }

    if (needsVectorVector) {
        helpers += `
    vector<vector<int>> parseVectorVectorInt(string s) {
        vector<vector<int>> result;

        if (s.empty() || s == "[]")
            return result;

        s.erase(remove(s.begin(), s.end(), ' '), s.end());

        if (s.size() >= 2 && s.front() == '[' && s.back() == ']')
            s = s.substr(1, s.size() - 2);

        string current;
        int depth = 0;

        for (char c : s) {
            if (c == '[') {
                depth++;
            }

            if (depth > 0)
                current += c;

            if (c == ']') {
                depth--;

                if (depth == 0) {
                    result.push_back(parseVectorInt(current));
                    current.clear();
                }
            }
        }

        return result;
    }
`;
    }

    if (needsListNode) {
        helpers += `
ListNode* parseList(string s) {
    if (s.empty() || s == "[]") return nullptr;
    s.erase(remove(s.begin(), s.end(), ' '), s.end());
    if (s[0] == '[') s = s.substr(1, s.length() - 1);

    vector<string> nodes;
    string current;
    for (char c : s) {
        if (c == ',') {
            nodes.push_back(current);
            current = "";
        } else {
            current += c;
        }
    }
    if (!current.empty()) nodes.push_back(current);

    if (nodes.empty()) return nullptr;

    ListNode* dummy = new ListNode(0);
    ListNode* current = dummy;

    for (const string& nodeStr : nodes) {
        if (nodeStr != "null") {
            current->next = new ListNode(stoi(nodeStr));
            current = current->next;
        }
    }

    ListNode* head = dummy->next;
    delete dummy;
    return head;
}
`;
    }

    if (needsTreeNode) {
        helpers += `
TreeNode* parseTree(string s) {
    if (s.empty() || s == "[]") return nullptr;
    s.erase(remove(s.begin(), s.end(), ' '), s.end());
    if (s[0] == '[') s = s.substr(1, s.length() - 1);

    vector<string> nodes;
    string current;
    for (char c : s) {
        if (c == ',') {
            nodes.push_back(current);
            current = "";
        } else {
            current += c;
        }
    }
    if (!current.empty()) nodes.push_back(current);

    if (nodes.empty() || nodes[0] == "null") return nullptr;

    TreeNode* root = new TreeNode(stoi(nodes[0]));
    queue<TreeNode*> q;
    q.push(root);

    int i = 1;
    while (!q.empty() && i < nodes.size()) {
        TreeNode* node = q.front();
        q.pop();

        if (i < nodes.size() && nodes[i] != "null") {
            node->left = new TreeNode(stoi(nodes[i]));
            q.push(node->left);
        }
        i++;

        if (i < nodes.size() && nodes[i] != "null") {
            node->right = new TreeNode(stoi(nodes[i]));
            q.push(node->right);
        }
        i++;
    }

    return root;
}
`;
    }

    return { includes: "", helpers };
};

// Generate Java parser helper methods.
// Array/List/graph params are parsed with Gson (already built into gson.jar
// on the classpath) via TypeToken — hand-rolled parsers could not handle
// nested generics, escapes, or null elements correctly.
const generateJavaParsers = (parameters) => {
    const imports = `
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
`;

    let helpers = `
    private static final Gson GSON = new Gson();

    private static <T> T parseJson(String s, java.lang.reflect.Type type) {
        return GSON.fromJson(s, type);
    }
`;

    const needsListNode = parameters.some((p) => {
        const type = normalizeType(p?.type);
        return type === 'listnode' || type === 'ListNode';
    });

    const needsTreeNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === 'treenode' || type === 'TreeNode';
    });

    if (needsListNode) {
        helpers += `
    private static ListNode parseList(String s) {
        if (s == null || s.isEmpty() || s.equals("[]")) return null;
        s = s.replaceAll(" ", "");
        if (s.startsWith("[")) s = s.substring(1, s.length() - 1);

        String[] nodes = s.split(",");
        if (nodes.length == 0) return null;

        ListNode dummy = new ListNode(0);
        ListNode current = dummy;

        for (String nodeStr : nodes) {
            if (!nodeStr.equals("null")) {
                current.next = new ListNode(Integer.parseInt(nodeStr));
                current = current.next;
            }
        }

        return dummy.next;
    }
`;
    }

    if (needsTreeNode) {
        helpers += `
    private static TreeNode parseTree(String s) {
        if (s == null || s.isEmpty() || s.equals("[]")) return null;
        s = s.replaceAll(" ", "");
        if (s.startsWith("[")) s = s.substring(1, s.length() - 1);

        String[] nodes = s.split(",");
        if (nodes.length == 0 || nodes[0].equals("null")) return null;

        TreeNode root = new TreeNode(Integer.parseInt(nodes[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        int i = 1;
        while (!queue.isEmpty() && i < nodes.length) {
            TreeNode node = queue.poll();

            if (i < nodes.length && !nodes[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(nodes[i]));
                queue.offer(node.left);
            }
            i++;

            if (i < nodes.length && !nodes[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(nodes[i]));
                queue.offer(node.right);
            }
            i++;
        }

        return root;
    }
`;
    }

    return { imports, helpers };
};

// Generate C++ input reading code
const generateCppInputReading = (parameters) => {
    let inputReading = "";
    const paramNames = [];

    parameters.forEach((param, index) => {
        const varName = `param${index}`;
        paramNames.push(varName);

        const type = normalizeType(param.type);

        switch (type) {

            case "int[]":
            case "vector<int>":
            case "array":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<int> ${varName} = parseVectorInt(line${index});
`;
                break;

            case "string[]":
            case "vector<string>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<string> ${varName} = parseVectorString(line${index});
`;
                break;

            case "int[][]":
            case "List<List<Integer>>":
            case "graph":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<vector<int>> ${varName} = ${type === "graph" ? "parseGraph" : "parseVectorVectorInt"}(line${index});
`;
                break;

            case "List<Integer>":
            case "ArrayList<Integer>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<int> ${varName} = parseVectorInt(line${index});
`;
                break;

            case "List<String>":
            case "ArrayList<String>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<string> ${varName} = parseVectorString(line${index});
`;
                break;

            case "long[]":
            case "List<Long>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<long long> ${varName} = parseVectorLong(line${index});
`;
                break;

            case "double[]":
            case "List<Double>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<double> ${varName} = parseVectorDouble(line${index});
`;
                break;

            case "bool[]":
            case "List<Boolean>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<bool> ${varName} = parseVectorBool(line${index});
`;
                break;

            case "ListNode":
            case "listnode":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    ListNode* ${varName} = parseList(line${index});
`;
                break;

            case "TreeNode":
            case "treenode":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    TreeNode* ${varName} = parseTree(line${index});
`;
                break;

            case "string":
                inputReading += `    string ${varName};
    if (!getline(cin, ${varName})) return 0;
`;
                break;

            case "bool":
                inputReading += `    string boolStr${index};
    if (!getline(cin, boolStr${index})) return 0;
    transform(boolStr${index}.begin(), boolStr${index}.end(), boolStr${index}.begin(), ::tolower);
    bool ${varName} = (boolStr${index} == "true");
`;
                break;

            case "long":
            case "long long":
                inputReading += `    long long ${varName};
    if (!(cin >> ${varName})) return 0;
    cin.ignore(numeric_limits<streamsize>::max(), '\\n');
`;
                break;

            case "double":
            case "float":
                inputReading += `    double ${varName};
    if (!(cin >> ${varName})) return 0;
    cin.ignore(numeric_limits<streamsize>::max(), '\\n');
`;
                break;

            case "int":
            default:
                inputReading += `    int ${varName};
    if (!(cin >> ${varName})) return 0;
    cin.ignore(numeric_limits<streamsize>::max(), '\\n');
`;
                break;
        }
    });

    return {
        inputReading,
        paramNames,
    };
};

// Generate Java input reading code.
// JSON-shaped params (arrays, Lists, graphs) go through Gson + TypeToken so
// nested generics, quoted strings and nulls are handled correctly.
const JAVA_JSON_TYPES = {
    "int[]": ["int[]", "int[].class"],
    "array": ["int[]", "int[].class"],
    "long[]": ["long[]", "long[].class"],
    "double[]": ["double[]", "double[].class"],
    "bool[]": ["boolean[]", "boolean[].class"],
    "string[]": ["String[]", "String[].class"],
    "int[][]": ["int[][]", "int[][].class"],
    "string[][]": ["String[][]", "String[][].class"],
    "List<Integer>": ["List<Integer>", "new TypeToken<List<Integer>>(){}.getType()"],
    "ArrayList<Integer>": ["ArrayList<Integer>", "new TypeToken<ArrayList<Integer>>(){}.getType()"],
    "List<Long>": ["List<Long>", "new TypeToken<List<Long>>(){}.getType()"],
    "List<Double>": ["List<Double>", "new TypeToken<List<Double>>(){}.getType()"],
    "List<Boolean>": ["List<Boolean>", "new TypeToken<List<Boolean>>(){}.getType()"],
    "List<String>": ["List<String>", "new TypeToken<List<String>>(){}.getType()"],
    "ArrayList<String>": ["ArrayList<String>", "new TypeToken<ArrayList<String>>(){}.getType()"],
    "List<List<Integer>>": ["List<List<Integer>>", "new TypeToken<List<List<Integer>>>(){}.getType()"],
    "graph": ["List<List<Integer>>", "new TypeToken<List<List<Integer>>>(){}.getType()"],
};

const generateJavaInputReading = (parameters) => {
    let inputReading = "";
    const paramNames = [];

    parameters.forEach((param, index) => {

        const varName = `param${index}`;
        paramNames.push(varName);

        const type = normalizeType(param.type);

        if (JAVA_JSON_TYPES[type]) {
            const [declType, gsonType] = JAVA_JSON_TYPES[type];
            inputReading += `        ${declType} ${varName} = parseJson(sc.nextLine(), ${gsonType});
`;
            return;
        }

        switch (type) {

            case "ListNode":
            case "listnode":
                inputReading += `        ListNode ${varName} = parseList(sc.nextLine());
`;
                break;

            case "TreeNode":
            case "treenode":
                inputReading += `        TreeNode ${varName} = parseTree(sc.nextLine());
`;
                break;

            case "string":
                inputReading += `        String ${varName} = sc.nextLine();
`;
                break;

            case "bool":
                inputReading += `        boolean ${varName} = Boolean.parseBoolean(sc.nextLine().trim());
`;
                break;

            case "long":
                inputReading += `        long ${varName} = Long.parseLong(sc.nextLine().trim());
`;
                break;

            case "double":
                inputReading += `        double ${varName} = Double.parseDouble(sc.nextLine().trim());
`;
                break;

            case "int":
            default:
                inputReading += `        int ${varName} = Integer.parseInt(sc.nextLine().trim());
`;
                break;
        }

    });

    return {
        inputReading,
        paramNames,
    };
};
// Generate Python input parsing code
const generatePythonInputParsing = (parameters) => {
    let parsingCode = "";
    const paramNames = [];

    parameters.forEach((param, index) => {

        const varName = `param${index}`;
        paramNames.push(varName);

        const type = normalizeType(param.type);

        switch (type) {

            case "int[]":
            case "long[]":
            case "double[]":
            case "bool[]":
            case "string[]":
            case "string[][]":
            case "int[][]":
            case "array":
            case "List<Integer>":
            case "List<Long>":
            case "List<Double>":
            case "List<Boolean>":
            case "List<String>":
            case "List<List<Integer>>":
            case "ArrayList<Integer>":
            case "ArrayList<String>":
            case "graph":
                parsingCode += `    ${varName} = json.loads(inputLines[${index}].strip())\n`;
                break;

            case "ListNode":
            case "listnode":
                parsingCode += `    ${varName} = parse_list(inputLines[${index}].strip())\n`;
                break;

            case "TreeNode":
            case "treenode":
                parsingCode += `    ${varName} = parse_tree(inputLines[${index}].strip())\n`;
                break;

            case "string":
                parsingCode += `    ${varName} = inputLines[${index}]\n`;
                break;

            case "bool":
                parsingCode += `    ${varName} = inputLines[${index}].strip().lower() == "true"\n`;
                break;

            case "float":
            case "double":
                parsingCode += `    ${varName} = float(inputLines[${index}].strip())\n`;
                break;

            case "long":
            case "int":
            default:
                parsingCode += `    ${varName} = int(inputLines[${index}].strip())\n`;
                break;
        }

    });

    return {
        parsingCode,
        paramNames,
    };
};

// Generate JavaScript input parsing code
const generateJavascriptInputParsing = (parameters) => {
    let parsingCode = "";
    const paramNames = [];

    parameters.forEach((param, index) => {

        const varName = `param${index}`;
        paramNames.push(varName);

        const type = normalizeType(param.type);

        switch (type) {

            case "int[]":
            case "long[]":
            case "double[]":
            case "bool[]":
            case "string[]":
            case "string[][]":
            case "int[][]":
            case "array":
            case "List<Integer>":
            case "List<Long>":
            case "List<Double>":
            case "List<Boolean>":
            case "List<String>":
            case "List<List<Integer>>":
            case "ArrayList<Integer>":
            case "ArrayList<String>":
            case "graph":
                parsingCode += `    const ${varName} = JSON.parse(inputLines[${index}].trim());\n`;
                break;

            case "ListNode":
            case "listnode":
                parsingCode += `    const ${varName} = parseList(inputLines[${index}].trim());\n`;
                break;

            case "TreeNode":
            case "treenode":
                parsingCode += `    const ${varName} = parseTree(inputLines[${index}].trim());\n`;
                break;

            case "string":
                parsingCode += `    const ${varName} = inputLines[${index}];\n`;
                break;

            case "bool":
                parsingCode += `    const ${varName} = inputLines[${index}].trim().toLowerCase() === "true";\n`;
                break;

            case "double":
            case "float":
            case "long":
            case "int":
            default:
                parsingCode += `    const ${varName} = Number(inputLines[${index}].trim());\n`;
                break;
        }

    });

    return {
        parsingCode,
        paramNames,
    };
};

export {
    generateCppParsers,
    generateJavaParsers,
    generateCppInputReading,
    generateJavaInputReading,
    generatePythonInputParsing,
    generateJavascriptInputParsing
};