// Tree structure definitions and helper code generators for LeetCode-style problems

// C++ TreeNode definition
const cppTreeNodeDef = `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
`;

// C++ tree parser
const cppTreeParser = `
TreeNode* parseTree(string s) {
    s.erase(remove(s.begin(), s.end(), ' '), s.end());

    if (s.empty() || s == "[]")
        return nullptr;

    if (s.front() == '[' && s.back() == ']')
        s = s.substr(1, s.size() - 2);

    if (s.empty())
        return nullptr;

    vector<string> nodes;
    string token;

    for (char c : s) {
        if (c == ',') {
            nodes.push_back(token);
            token.clear();
        } else {
            token += c;
        }
    }

    if (!token.empty())
        nodes.push_back(token);

    if (nodes.empty() || nodes[0] == "null")
        return nullptr;

    TreeNode* root = new TreeNode(stoi(nodes[0]));
    queue<TreeNode*> q;
    q.push(root);

    size_t i = 1;

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
// C++ tree serializer
const cppTreeSerializer = `
string serializeTree(TreeNode* root) {
    if (!root)
        return "[]";

    vector<string> nodes;
    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();

        if (node) {
            nodes.push_back(to_string(node->val));
            q.push(node->left);
            q.push(node->right);
        } else {
            nodes.push_back("null");
        }
    }

    while (!nodes.empty() && nodes.back() == "null") {
        nodes.pop_back();
    }

    string result = "[";

    for (size_t i = 0; i < nodes.size(); i++) {
        if (i > 0)
            result += ",";

        result += nodes[i];
    }

    result += "]";
    return result;
}
`;

// Java TreeNode definition
const javaTreeNodeDef = `
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
`;

// Java tree parser
const javaTreeParser = `
    private static TreeNode parseTree(String s) {
        if (s == null)
            return null;

        s = s.trim().replace(" ", "");

        if (s.isEmpty() || s.equals("[]"))
            return null;

        if (s.startsWith("[") && s.endsWith("]")) {
            s = s.substring(1, s.length() - 1);
        }

        if (s.isEmpty())
            return null;

        String[] nodes = s.split(",");

        if (nodes.length == 0 || nodes[0].equals("null"))
            return null;

        TreeNode root = new TreeNode(Integer.parseInt(nodes[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        int i = 1;

        while (!queue.isEmpty() && i < nodes.length) {
            TreeNode current = queue.poll();

            if (i < nodes.length && !nodes[i].equals("null")) {
                current.left = new TreeNode(Integer.parseInt(nodes[i]));
                queue.offer(current.left);
            }
            i++;

            if (i < nodes.length && !nodes[i].equals("null")) {
                current.right = new TreeNode(Integer.parseInt(nodes[i]));
                queue.offer(current.right);
            }
            i++;
        }

        return root;
    }
`;

// Java tree serializer
const javaTreeSerializer = `
    private static String serializeTree(TreeNode root) {
        if (root == null)
            return "[]";

        List<String> nodes = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            TreeNode current = queue.poll();

            if (current != null) {
                nodes.add(String.valueOf(current.val));
                queue.offer(current.left);
                queue.offer(current.right);
            } else {
                nodes.add("null");
            }
        }

        while (!nodes.isEmpty() && nodes.get(nodes.size() - 1).equals("null")) {
            nodes.remove(nodes.size() - 1);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("[");

        for (int i = 0; i < nodes.size(); i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append(nodes.get(i));
        }

        sb.append("]");
        return sb.toString();
    }
`;

// Python TreeNode definition
const pythonTreeNodeDef = `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
`;

// Python tree parser
const pythonTreeParser = `
from collections import deque

def parse_tree(s):
    if s is None:
        return None

    s = s.strip().replace(" ", "")

    if not s or s == "[]":
        return None

    if s.startswith("[") and s.endswith("]"):
        s = s[1:-1]

    if not s:
        return None

    nodes = s.split(",")

    if not nodes or nodes[0] == "null":
        return None

    root = TreeNode(int(nodes[0]))
    queue = deque([root])

    i = 1

    while queue and i < len(nodes):
        current = queue.popleft()

        if i < len(nodes) and nodes[i] != "null":
            current.left = TreeNode(int(nodes[i]))
            queue.append(current.left)
        i += 1

        if i < len(nodes) and nodes[i] != "null":
            current.right = TreeNode(int(nodes[i]))
            queue.append(current.right)
        i += 1

    return root
`;
// Python tree serializer
const pythonTreeSerializer = `
from collections import deque

def serialize_tree(root):
    if root is None:
        return "[]"

    nodes = []
    queue = deque([root])

    while queue:
        current = queue.popleft()

        if current is not None:
            nodes.append(str(current.val))
            queue.append(current.left)
            queue.append(current.right)
        else:
            nodes.append("null")

    while nodes and nodes[-1] == "null":
        nodes.pop()

    return "[" + ",".join(nodes) + "]"
`;

const javascriptTreeNodeDef = `
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
`;

// JavaScript tree parser
const javascriptTreeParser = `
function parseTree(s) {
    if (!s) return null;

    s = s.trim();

    if (s === "[]" || s === "") return null;

    // Remove brackets
    if (s[0] === "[" && s[s.length - 1] === "]") {
        s = s.substring(1, s.length - 1);
    }

    // Split values
    const values = s.split(",").map(x => x.trim());

    if (values.length === 0 || values[0] === "null") {
        return null;
    }

    const root = new TreeNode(Number(values[0]));

    const queue = [root];
    let index = 1;

    while (queue.length > 0 && index < values.length) {

        const current = queue.shift();

        // Left child
        if (index < values.length && values[index] !== "null") {
            current.left = new TreeNode(Number(values[index]));
            queue.push(current.left);
        }

        index++;

        // Right child
        if (index < values.length && values[index] !== "null") {
            current.right = new TreeNode(Number(values[index]));
            queue.push(current.right);
        }

        index++;
    }

    return root;
}
`;

// JavaScript tree serializer
const javascriptTreeSerializer = `
function serializeTree(root) {
    if (!root) return "[]";

    const result = [];
    const queue = [root];

    while (queue.length > 0) {

        const node = queue.shift();

        if (node === null) {
            result.push("null");
            continue;
        }

        result.push(String(node.val));

        queue.push(node.left);
        queue.push(node.right);
    }


    // Remove unnecessary nulls at the end
    while (
        result.length > 0 &&
        result[result.length - 1] === "null"
    ) {
        result.pop();
    }


    return "[" + result.join(",") + "]";
}
`;
export {
    // C++
    cppTreeNodeDef,
    cppTreeParser,
    cppTreeSerializer,
    // Java
    javaTreeNodeDef,
    javaTreeParser,
    javaTreeSerializer,
    // Python
    pythonTreeNodeDef,
    pythonTreeParser,
    pythonTreeSerializer,
    // JavaScript
    javascriptTreeNodeDef,
    javascriptTreeParser,
    javascriptTreeSerializer
};
