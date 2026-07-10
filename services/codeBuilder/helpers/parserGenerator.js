import { normalizeType, isArrayType, is2DArrayType, getLanguageType } from '../typeRegistry.js';

// Generate C++ parser helper functions
const generateCppParsers = (parameters) => {
    let helpers = '';
    
        const needsVectorInt = parameters.some(p => {
            const type = normalizeType(p?.type);
            return type === "int[]" ||
                type === "vector<int>" ||
                type === "array";
        });

        const needsVectorString = parameters.some(p => {
            const type = normalizeType(p?.type);
            return type === "string[]" ||
                type === "vector<string>";
        });

        const needsVectorVector = parameters.some(p => {
            return is2DArrayType(normalizeType(p?.type));
        });
    
    // Node parsers are supplied by structures/linkedList.js and tree.js.  Do
    // not emit a second copy here or C++ submissions fail to compile.
    const needsListNode = false;
    const needsTreeNode = false;
    
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
    
    if (needsVectorString) {
        helpers += `
        vector<string> parseVectorString(string s) {
            vector<string> result;

            if (s.empty() || s == "[]")
                return result;

            if (s.front() == '[' && s.back() == ']')
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

                if (c == '\\') {
                    escaped = true;
                    continue;
                }

                if (c == '"') {
                    inQuotes = !inQuotes;
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

            if (s.front() == '[' && s.back() == ']')
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
    
    return helpers;
};

// Generate Java parser helper methods
const generateJavaParsers = (parameters) => {
    let helpers = '';
    
    const needsIntArray = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === 'int[]' || type === 'array';
    });
    
    const needsStringArray = parameters.some(p => normalizeType(p?.type) === 'string[]');
    const needs2DArray = parameters.some(p => is2DArrayType(p?.type));
    
    const needsListNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === 'listnode' || type === 'ListNode';
    });
    
    const needsTreeNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === 'treenode' || type === 'TreeNode';
    });
    
    if (needsIntArray) {
        helpers += `
 private static int[] parseVectorInt(String s) {
    s = s.trim();

    if (s.isEmpty() || s.equals("[]"))
        return new int[0];

    if (s.startsWith("[") && s.endsWith("]"))
        s = s.substring(1, s.length() - 1);

    if (s.trim().isEmpty())
        return new int[0];

    String[] tokens = s.split(",");
    List<Integer> values = new ArrayList<>();

    for (String token : tokens) {
        token = token.trim();

        if (token.isEmpty())
            continue;

        values.add(Integer.parseInt(token));
    }

    int[] result = new int[values.size()];

    for (int i = 0; i < values.size(); i++)
        result[i] = values.get(i);

    return result;
}
`;
    }
    
    if (needsStringArray) {
        helpers += `
    private static String[] parseVectorString(String s) {
        s = s.trim();

        if (s.isEmpty() || s.equals("[]"))
            return new String[0];

        if (s.startsWith("[") && s.endsWith("]"))
            s = s.substring(1, s.length() - 1);

        List<String> result = new ArrayList<>();

        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        boolean escaped = false;

        for (char c : s.toCharArray()) {

            if (escaped) {
                current.append(c);
                escaped = false;
                continue;
            }

            if (c == '\\') {
                escaped = true;
                continue;
            }

            if (c == '"') {
                inQuotes = !inQuotes;
                continue;
            }

            if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current.setLength(0);
                continue;
            }

            current.append(c);
        }

        if (current.length() > 0)
            result.add(current.toString());

        return result.toArray(new String[0]);
    }
`;
    }
    
    if (needs2DArray) {
        helpers += `
 private static int[][] parseVectorVectorInt(String s) {

    s = s.trim().replaceAll(" ", "");

    if (s.isEmpty() || s.equals("[]"))
        return new int[0][];

    if (s.startsWith("[") && s.endsWith("]"))
        s = s.substring(1, s.length() - 1);

    List<int[]> result = new ArrayList<>();

    StringBuilder current = new StringBuilder();
    int depth = 0;

    for (char c : s.toCharArray()) {

        if (c == '[')
            depth++;

        if (depth > 0)
            current.append(c);

        if (c == ']') {

            depth--;

            if (depth == 0) {

                result.add(parseVectorInt(current.toString()));
                current.setLength(0);

            }
        }
    }

    return result.toArray(new int[0][]);
}
`;
    }
    
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
    
    return helpers;
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
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<vector<int>> ${varName} = parseVectorVectorInt(line${index});
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

// Generate Java input reading code
const generateJavaInputReading = (parameters) => {
    let inputReading = "";
    const paramNames = [];

    parameters.forEach((param, index) => {

        const varName = `param${index}`;
        paramNames.push(varName);

        const type = normalizeType(param.type);

        switch (type) {

            case "int[]":
            case "array":
                inputReading += `        int[] ${varName} = parseVectorInt(sc.nextLine());
`;
                break;

            case "string[]":
                inputReading += `        String[] ${varName} = parseVectorString(sc.nextLine());
`;
                break;

            case "int[][]":
                inputReading += `        int[][] ${varName} = parseVectorVectorInt(sc.nextLine());
`;
                break;

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
            case "float":
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
            case "string[]":
            case "int[][]":
            case "array":
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
    let parsingCode = '';
    let paramNames = [];
    
    // Uses the same parameter-per-line input contract as the other builders.
    parameters.forEach((param, index) => {
            const varName = `param${index}`;
            paramNames.push(varName);
            const type = normalizeType(param?.type);
            
            if (isArrayType(type)) {
                parsingCode += `    const ${varName} = JSON.parse(inputLines[${index}]);\n`;
            } else if (type === 'listnode' || type === 'ListNode') {
                parsingCode += `    const ${varName} = parseList(inputLines[${index}]);\n`;
            } else if (type === 'treenode' || type === 'TreeNode') {
                parsingCode += `    const ${varName} = parseTree(inputLines[${index}]);\n`;
            } else if (type === 'string') {
                parsingCode += `    const ${varName} = inputLines[${index}];\n`;
            } else if (type === 'bool') {
                parsingCode += `    const ${varName} = inputLines[${index}].trim().toLowerCase() === 'true';\n`;
            } else {
                parsingCode += `    const ${varName} = Number(inputLines[${index}]);\n`;
            }
        });
    
    if (paramNames.length === 0) {
        paramNames.push("param0");
        parsingCode += `    const param0 = JSON.parse(inputLines[0]);\n`;
    }
    
    return { parsingCode, paramNames };
};

export {
    generateCppParsers,
    generateJavaParsers,
    generateCppInputReading,
    generateJavaInputReading,
    generatePythonInputParsing,
    generateJavascriptInputParsing
};
