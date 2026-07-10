// Linked list structure definitions and helper code generators for LeetCode-style problems

// C++ ListNode definition
const cppListNodeDef = `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
`;

// C++ linked list parser
const cppListParser = `
ListNode* parseList(string s) {
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

    ListNode dummy(0);
    ListNode* curr = &dummy;

    for (const string& node : nodes) {
        if (node != "null") {
            curr->next = new ListNode(stoi(node));
            curr = curr->next;
        }
    }

    return dummy.next;
}
`;

// C++ linked list serializer
const cppListSerializer = `
string serializeList(ListNode* head) {
    if (!head) return "[]";
    
    vector<string> nodes;
    ListNode* current = head;
    
    while (current) {
        nodes.push_back(to_string(current->val));
        current = current->next;
    }
    
    string result = "[";
    for (int i = 0; i < nodes.size(); i++) {
        if (i > 0) result += ",";
        result += nodes[i];
    }
    result += "]";
    return result;
}
`;

// Java ListNode definition
const javaListNodeDef = `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
`;

// Java linked list parser
const javaListParser = `
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

// Java linked list serializer
const javaListSerializer = `
    private static String serializeList(ListNode head) {
        if (head == null) return "[]";
        
        List<String> nodes = new ArrayList<>();
        ListNode current = head;
        
        while (current != null) {
            nodes.add(String.valueOf(current.val));
            current = current.next;
        }
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < nodes.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(nodes.get(i));
        }
        sb.append("]");
        return sb.toString();
    }
`;

// Python ListNode definition
const pythonListNodeDef = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
`;

// Python linked list parser
const pythonListParser = `
def parse_list(s):
    if not s or s == "[]":
        return None
    s = s.replace(" ", "")
    if s.startswith("["):
        s = s[1:-1]
    
    nodes = s.split(",")
    if not nodes:
        return None
    
    dummy = ListNode(0)
    current = dummy
    
    for node_str in nodes:
        if node_str != "null":
            current.next = ListNode(int(node_str))
            current = current.next
    
    return dummy.next
`;

// Python linked list serializer
const pythonListSerializer = `
def serialize_list(head):
    if not head:
        return "[]"
    
    nodes = []
    current = head
    
    while current:
        nodes.append(str(current.val))
        current = current.next
    
    return "[" + ",".join(nodes) + "]"
`;

// JavaScript ListNode definition
const javascriptListNodeDef = `
class ListNode {
    constructor(val, next) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
    }
}
`;

// JavaScript linked list parser
const javascriptListParser = `
function parseList(s) {
    if (!s || s === "[]") return null;
    s = s.replace(/ /g, "");
    if (s.startsWith("[")) s = s.slice(1, -1);
    
    const nodes = s.split(",");
    if (!nodes.length) return null;
    
    const dummy = new ListNode(0);
    let current = dummy;
    
    for (const nodeStr of nodes) {
        if (nodeStr !== "null") {
            current.next = new ListNode(parseInt(nodeStr));
            current = current.next;
        }
    }
    
    return dummy.next;
}
`;

// JavaScript linked list serializer
const javascriptListSerializer = `
function serializeList(head) {
    if (!head) return "[]";
    
    const nodes = [];
    let current = head;
    
    while (current) {
        nodes.push(String(current.val));
        current = current.next;
    }
    
    return "[" + nodes.join(",") + "]";
}
`;

export {
    // C++
    cppListNodeDef,
    cppListParser,
    cppListSerializer,
    // Java
    javaListNodeDef,
    javaListParser,
    javaListSerializer,
    // Python
    pythonListNodeDef,
    pythonListParser,
    pythonListSerializer,
    // JavaScript
    javascriptListNodeDef,
    javascriptListParser,
    javascriptListSerializer
};
