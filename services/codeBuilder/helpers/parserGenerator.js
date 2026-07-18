import { normalizeType, isArrayType, is2DArrayType, getLanguageType } from '../typeRegistry.js';
import * as linkedList from "../structures/linkedList.js";
import * as tree from "../structures/tree.js";

const generateCppParsers = (parameters) => {
    let helpers = '';
    let includes = '';

    const needsListNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === "ListNode" || type === "listnode";
    });
    const needsTreeNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === "TreeNode" || type === "treenode";
    });

    // Standard helpers (always include standard built-in parsers for completeness)
    helpers += `
string parseString(string s) {
    s.erase(0, s.find_first_not_of(" \\t\\r\\n"));
    s.erase(s.find_last_not_of(" \\t\\r\\n") + 1);
    if (s.size() >= 2 && s.front() == '"' && s.back() == '"') {
        return s.substr(1, s.size() - 2);
    }
    return s;
}

vector<int> parseIntArray(string s) {
    vector<int> res;
    s.erase(0, s.find_first_not_of(" \\t\\r\\n"));
    s.erase(s.find_last_not_of(" \\t\\r\\n") + 1);
    if (s.empty() || s == "[]") return res;
    if (s.front() == '[') s = s.substr(1);
    if (s.back() == ']') s = s.substr(0, s.size() - 1);
    stringstream ss(s);
    string token;
    while (getline(ss, token, ',')) {
        token.erase(0, token.find_first_not_of(" \\t\\r\\n"));
        token.erase(token.find_last_not_of(" \\t\\r\\n") + 1);
        if (!token.empty()) res.push_back(stoi(token));
    }
    return res;
}

vector<long long> parseLongArray(string s) {
    vector<long long> res;
    s.erase(0, s.find_first_not_of(" \\t\\r\\n"));
    s.erase(s.find_last_not_of(" \\t\\r\\n") + 1);
    if (s.empty() || s == "[]") return res;
    if (s.front() == '[') s = s.substr(1);
    if (s.back() == ']') s = s.substr(0, s.size() - 1);
    stringstream ss(s);
    string token;
    while (getline(ss, token, ',')) {
        token.erase(0, token.find_first_not_of(" \\t\\r\\n"));
        token.erase(token.find_last_not_of(" \\t\\r\\n") + 1);
        if (!token.empty()) res.push_back(stoll(token));
    }
    return res;
}

vector<double> parseDoubleArray(string s) {
    vector<double> res;
    s.erase(0, s.find_first_not_of(" \\t\\r\\n"));
    s.erase(s.find_last_not_of(" \\t\\r\\n") + 1);
    if (s.empty() || s == "[]") return res;
    if (s.front() == '[') s = s.substr(1);
    if (s.back() == ']') s = s.substr(0, s.size() - 1);
    stringstream ss(s);
    string token;
    while (getline(ss, token, ',')) {
        token.erase(0, token.find_first_not_of(" \\t\\r\\n"));
        token.erase(token.find_last_not_of(" \\t\\r\\n") + 1);
        if (!token.empty()) res.push_back(stod(token));
    }
    return res;
}

vector<bool> parseBoolArray(string s) {
    vector<bool> res;
    s.erase(0, s.find_first_not_of(" \\t\\r\\n"));
    s.erase(s.find_last_not_of(" \\t\\r\\n") + 1);
    if (s.empty() || s == "[]") return res;
    if (s.front() == '[') s = s.substr(1);
    if (s.back() == ']') s = s.substr(0, s.size() - 1);
    stringstream ss(s);
    string token;
    while (getline(ss, token, ',')) {
        token.erase(0, token.find_first_not_of(" \\t\\r\\n"));
        token.erase(token.find_last_not_of(" \\t\\r\\n") + 1);
        transform(token.begin(), token.end(), token.begin(), ::tolower);
        res.push_back(token == "true");
    }
    return res;
}

vector<string> parseStringArray(string s) {
    vector<string> res;
    s.erase(0, s.find_first_not_of(" \\t\\r\\n"));
    s.erase(s.find_last_not_of(" \\t\\r\\n") + 1);
    if (s.empty() || s == "[]") return res;
    if (s.front() == '[') s = s.substr(1);
    if (s.back() == ']') s = s.substr(0, s.size() - 1);
    bool inQuotes = false;
    string current = "";
    for (size_t i = 0; i < s.size(); i++) {
        char c = s[i];
        if (c == '"') {
            inQuotes = !inQuotes;
        } else if (c == ',' && !inQuotes) {
            res.push_back(parseString(current));
            current = "";
        } else {
            current += c;
        }
    }
    res.push_back(parseString(current));
    return res;
}

vector<vector<int>> parseIntMatrix(string s) {
    vector<vector<int>> res;
    s.erase(0, s.find_first_not_of(" \\t\\r\\n"));
    s.erase(s.find_last_not_of(" \\t\\r\\n") + 1);
    if (s.empty() || s == "[]" || s == "[[]]") return res;
    if (s.front() == '[') s = s.substr(1);
    if (s.back() == ']') s = s.substr(0, s.size() - 1);
    int depth = 0;
    string current = "";
    for (size_t i = 0; i < s.size(); i++) {
        char c = s[i];
        if (c == '[') {
            depth++;
            current += c;
        } else if (c == ']') {
            depth--;
            current += c;
            if (depth == 0) {
                res.push_back(parseIntArray(current));
                current = "";
            }
        } else {
            if (depth > 0) current += c;
        }
    }
    return res;
}

vector<vector<string>> parseStringMatrix(string s) {
    vector<vector<string>> res;
    s.erase(0, s.find_first_not_of(" \\t\\r\\n"));
    s.erase(s.find_last_not_of(" \\t\\r\\n") + 1);
    if (s.empty() || s == "[]" || s == "[[]]") return res;
    if (s.front() == '[') s = s.substr(1);
    if (s.back() == ']') s = s.substr(0, s.size() - 1);
    int depth = 0;
    string current = "";
    for (size_t i = 0; i < s.size(); i++) {
        char c = s[i];
        if (c == '[') {
            depth++;
            current += c;
        } else if (c == ']') {
            depth--;
            current += c;
            if (depth == 0) {
                res.push_back(parseStringArray(current));
                current = "";
            }
        } else {
            if (depth > 0) current += c;
        }
    }
    return res;
}
`;

    if (needsListNode) {
        helpers += linkedList.cppListParser + "\n";
    }

    if (needsTreeNode) {
        helpers += tree.cppTreeParser + "\n";
    }

    return {
        includes,
        helpers,
    };
};

const generateJavaParsers = (parameters) => {
    let helpers = '';
    let imports = '';

    const needsListNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === 'listnode' || type === 'ListNode';
    });

    const needsTreeNode = parameters.some(p => {
        const type = normalizeType(p?.type);
        return type === 'treenode' || type === 'TreeNode';
    });

    // Standard Java helpers without using Gson
    helpers += `
    private static String parseString(String s) {
        if (s == null) return "";
        s = s.trim();
        if (s.startsWith("\\"") && s.endsWith("\\"") && s.length() >= 2) {
            return s.substring(1, s.length() - 1);
        }
        return s;
    }

    private static int[] parseIntArray(String s) {
        if (s == null || s.trim().isEmpty() || s.trim().equals("[]")) return new int[0];
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        if (s.trim().isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] res = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            res[i] = Integer.parseInt(parts[i].trim());
        }
        return res;
    }

    private static long[] parseLongArray(String s) {
        if (s == null || s.trim().isEmpty() || s.trim().equals("[]")) return new long[0];
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        if (s.trim().isEmpty()) return new long[0];
        String[] parts = s.split(",");
        long[] res = new long[parts.length];
        for (int i = 0; i < parts.length; i++) {
            res[i] = Long.parseLong(parts[i].trim());
        }
        return res;
    }

    private static double[] parseDoubleArray(String s) {
        if (s == null || s.trim().isEmpty() || s.trim().equals("[]")) return new double[0];
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        if (s.trim().isEmpty()) return new double[0];
        String[] parts = s.split(",");
        double[] res = new double[parts.length];
        for (int i = 0; i < parts.length; i++) {
            res[i] = Double.parseDouble(parts[i].trim());
        }
        return res;
    }

    private static boolean[] parseBoolArray(String s) {
        if (s == null || s.trim().isEmpty() || s.trim().equals("[]")) return new boolean[0];
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        if (s.trim().isEmpty()) return new boolean[0];
        String[] parts = s.split(",");
        boolean[] res = new boolean[parts.length];
        for (int i = 0; i < parts.length; i++) {
            res[i] = Boolean.parseBoolean(parts[i].trim());
        }
        return res;
    }

    private static String[] parseStringArray(String s) {
        if (s == null || s.trim().isEmpty() || s.trim().equals("[]")) return new String[0];
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        if (s.trim().isEmpty()) return new String[0];
        List<String> list = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                list.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        list.add(current.toString());
        String[] res = new String[list.size()];
        for (int i = 0; i < list.size(); i++) {
            res[i] = parseString(list.get(i));
        }
        return res;
    }

    private static List<Integer> parseIntegerList(String s) {
        List<Integer> list = new ArrayList<>();
        for (int val : parseIntArray(s)) list.add(val);
        return list;
    }

    private static List<Long> parseLongList(String s) {
        List<Long> list = new ArrayList<>();
        for (long val : parseLongArray(s)) list.add(val);
        return list;
    }

    private static List<Double> parseDoubleList(String s) {
        List<Double> list = new ArrayList<>();
        for (double val : parseDoubleArray(s)) list.add(val);
        return list;
    }

    private static List<Boolean> parseBooleanList(String s) {
        List<Boolean> list = new ArrayList<>();
        for (boolean val : parseBoolArray(s)) list.add(val);
        return list;
    }

    private static List<String> parseStringList(String s) {
        List<String> list = new ArrayList<>();
        for (String val : parseStringArray(s)) list.add(val);
        return list;
    }

    private static int[][] parseIntMatrix(String s) {
        if (s == null || s.trim().isEmpty() || s.trim().equals("[]") || s.trim().equals("[[]]")) return new int[0][0];
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        List<int[]> matrix = new ArrayList<>();
        int depth = 0;
        StringBuilder current = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '[') {
                depth++;
                current.append(c);
            } else if (c == ']') {
                depth--;
                current.append(c);
                if (depth == 0) {
                    matrix.add(parseIntArray(current.toString()));
                    current.setLength(0);
                }
            } else {
                if (depth > 0) {
                    current.append(c);
                }
            }
        }
        return matrix.toArray(new int[0][]);
    }

    private static List<List<Integer>> parseIntegerMatrixList(String s) {
        List<List<Integer>> matrix = new ArrayList<>();
        for (int[] row : parseIntMatrix(s)) {
            List<Integer> r = new ArrayList<>();
            for (int v : row) r.add(v);
            matrix.add(r);
        }
        return matrix;
    }

    private static String[][] parseStringMatrix(String s) {
        if (s == null || s.trim().isEmpty() || s.trim().equals("[]") || s.trim().equals("[[]]")) return new String[0][0];
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        List<String[]> matrix = new ArrayList<>();
        int depth = 0;
        StringBuilder current = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '[') {
                depth++;
                current.append(c);
            } else if (c == ']') {
                depth--;
                current.append(c);
                if (depth == 0) {
                    matrix.add(parseStringArray(current.toString()));
                    current.setLength(0);
                }
            } else {
                if (depth > 0) {
                    current.append(c);
                }
            }
        }
        return matrix.toArray(new String[0][]);
    }
`;

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

    return {
        imports,
        helpers,
    };
};

const generateCppInputReading = (parameters) => {
    let inputReading = "";
    const paramNames = [];

    parameters.forEach((param, index) => {
        const varName = `param${index}`;
        paramNames.push(varName);

        const type = normalizeType(param.type);

        switch (type) {
            case "int[]":
            case "array":
            case "List<Integer>":
            case "ArrayList<Integer>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<int> ${varName} = parseIntArray(line${index});
`;
                break;

            case "long[]":
            case "List<Long>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<long long> ${varName} = parseLongArray(line${index});
`;
                break;

            case "double[]":
            case "List<Double>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<double> ${varName} = parseDoubleArray(line${index});
`;
                break;

            case "bool[]":
            case "List<Boolean>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<bool> ${varName} = parseBoolArray(line${index});
`;
                break;

            case "string[]":
            case "vector<string>":
            case "List<String>":
            case "ArrayList<String>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<string> ${varName} = parseStringArray(line${index});
`;
                break;

            case "int[][]":
            case "List<List<Integer>>":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<vector<int>> ${varName} = parseIntMatrix(line${index});
`;
                break;

            case "string[][]":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<vector<string>> ${varName} = parseStringMatrix(line${index});
`;
                break;

            case "graph":
            case "Graph":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    vector<vector<int>> ${varName} = parseIntMatrix(line${index});
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
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    string ${varName} = parseString(line${index});
`;
                break;

            case "bool":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    line${index}.erase(0, line${index}.find_first_not_of(" \\t\\r\\n"));
    line${index}.erase(line${index}.find_last_not_of(" \\t\\r\\n") + 1);
    transform(line${index}.begin(), line${index}.end(), line${index}.begin(), ::tolower);
    bool ${varName} = (line${index} == "true");
`;
                break;

            case "long":
            case "long long":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    long long ${varName} = stoll(line${index});
`;
                break;

            case "double":
            case "float":
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    double ${varName} = stod(line${index});
`;
                break;

            case "int":
            default:
                inputReading += `    string line${index};
    if (!getline(cin, line${index})) return 0;
    int ${varName} = stoi(line${index});
`;
                break;
        }
    });

    return {
        inputReading,
        paramNames,
    };
};

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
                inputReading += `        int[] ${varName} = parseIntArray(sc.nextLine());\n`;
                break;

            case "long[]":
                inputReading += `        long[] ${varName} = parseLongArray(sc.nextLine());\n`;
                break;

            case "double[]":
                inputReading += `        double[] ${varName} = parseDoubleArray(sc.nextLine());\n`;
                break;

            case "bool[]":
                inputReading += `        boolean[] ${varName} = parseBoolArray(sc.nextLine());\n`;
                break;

            case "string[]":
                inputReading += `        String[] ${varName} = parseStringArray(sc.nextLine());\n`;
                break;

            case "List<Integer>":
            case "ArrayList<Integer>":
                inputReading += `        List<Integer> ${varName} = parseIntegerList(sc.nextLine());\n`;
                break;

            case "List<Long>":
                inputReading += `        List<Long> ${varName} = parseLongList(sc.nextLine());\n`;
                break;

            case "List<Double>":
                inputReading += `        List<Double> ${varName} = parseDoubleList(sc.nextLine());\n`;
                break;

            case "List<Boolean>":
                inputReading += `        List<Boolean> ${varName} = parseBooleanList(sc.nextLine());\n`;
                break;

            case "List<String>":
            case "ArrayList<String>":
                inputReading += `        List<String> ${varName} = parseStringList(sc.nextLine());\n`;
                break;

            case "List<List<Integer>>":
                inputReading += `        List<List<Integer>> ${varName} = parseIntegerMatrixList(sc.nextLine());\n`;
                break;

            case "int[][]":
                inputReading += `        int[][] ${varName} = parseIntMatrix(sc.nextLine());\n`;
                break;

            case "string[][]":
                inputReading += `        String[][] ${varName} = parseStringMatrix(sc.nextLine());\n`;
                break;

            case "graph":
            case "Graph":
                inputReading += `        List<List<Integer>> ${varName} = parseIntegerMatrixList(sc.nextLine());\n`;
                break;

            case "ListNode":
            case "listnode":
                inputReading += `        ListNode ${varName} = parseList(sc.nextLine());\n`;
                break;

            case "TreeNode":
            case "treenode":
                inputReading += `        TreeNode ${varName} = parseTree(sc.nextLine());\n`;
                break;

            case "string":
                inputReading += `        String ${varName} = parseString(sc.nextLine());\n`;
                break;

            case "bool":
                inputReading += `        boolean ${varName} = Boolean.parseBoolean(sc.nextLine().trim());\n`;
                break;

            case "long":
                inputReading += `        long ${varName} = Long.parseLong(sc.nextLine().trim());\n`;
                break;

            case "double":
            case "float":
                inputReading += `        double ${varName} = Double.parseDouble(sc.nextLine().trim());\n`;
                break;

            case "int":
            default:
                inputReading += `        int ${varName} = Integer.parseInt(sc.nextLine().trim());\n`;
                break;
        }
    });

    return {
        inputReading,
        paramNames,
    };
};

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
                parsingCode += `    ${varName} = json.loads(inputLines[${index}].strip())\n`;
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

const generateJavascriptInputParsing = (parameters) => {
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
                parsingCode += `    const ${varName} = JSON.parse(inputLines[${index}].trim());\n`;
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
