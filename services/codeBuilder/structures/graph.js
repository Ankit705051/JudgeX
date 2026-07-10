// Graph structure definitions and helper code generators for LeetCode-style problems

// C++ graph parser (adjacency list format)
const cppGraphParser = `
vector<vector<int>> parseGraph(string s) {
    vector<vector<int>> graph;
    if (s.empty() || s == "[]") return graph;
    s.erase(remove(s.begin(), s.end(), ' '), s.end());
    if (s[0] == '[') s = s.substr(1, s.length() - 2);
    
    int depth = 0;
    string current;
    vector<string> edges;
    
    for (char c : s) {
        if (c == '[') depth++;
        else if (c == ']') depth--;
        current += c;
        if (depth == 0 && (c == ']' || c == ',')) {
            if (!current.empty() && current != ",") {
                edges.push_back(current);
            }
            current = "";
        }
    }
    
    for (const string& edge : edges) {
        vector<int> neighbors;
        string edgeStr = edge;
        if (edgeStr[0] == '[') edgeStr = edgeStr.substr(1, edgeStr.length() - 1);
        
        stringstream ss(edgeStr);
        string token;
        while (getline(ss, token, ',')) {
            if (!token.empty()) {
                neighbors.push_back(stoi(token));
            }
        }
        graph.push_back(neighbors);
    }
    
    return graph;
}
`;

// C++ graph serializer
const cppGraphSerializer = `
string serializeGraph(const vector<vector<int>>& graph) {
    if (graph.empty()) return "[]";
    
    string result = "[";
    for (size_t i = 0; i < graph.size(); i++) {
        if (i > 0) result += ",";
        result += "[";
        for (size_t j = 0; j < graph [i].size(); j++) {
            if (j > 0) result += ",";
            result += to_string(graph[i][j]);
        }
        result += "]";
    }
    result += "]";
    return result;
}
`;

// Java graph parser
const javaGraphParser = `
    private static List<List<Integer>> parseGraph(String s) {
        List<List<Integer>> graph = new ArrayList<>();
        if (s == null || s.isEmpty() || s.equals("[]")) return graph;
        s = s.replaceAll(" ", "");
        if (s.startsWith("[[")) s = s.substring(2, s.length() - 2);
        
        String[] edges = s.split("\\],\\[");
        for (String edge : edges) {
            List<Integer> neighbors = new ArrayList<>();
            String edgeStr = edge.replaceAll("[\\[\\]]", "");
            
            if (!edgeStr.isEmpty()) {
                String[] tokens = edgeStr.split(",");
                for (String token : tokens) {
                    if (!token.isEmpty()) {
                        neighbors.add(Integer.parseInt(token.trim()));
                    }
                }
            }
            graph.add(neighbors);
        }
        
        return graph;
    }
`;

// Java graph serializer
const javaGraphSerializer = `
    private static String serializeGraph(List<List<Integer>> graph) {
        if (graph == null || graph.isEmpty()) return "[]";
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < graph.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("[");
            List<Integer> neighbors = graph.get(i);
            for (int j = 0; j < neighbors.size(); j++) {
                if (j > 0) sb.append(",");
                sb.append(neighbors.get(j));
            }
            sb.append("]");
        }
        sb.append("]");
        return sb.toString();
    }
`;

// Python graph parser
const pythonGraphParser = `
def parse_graph(s):
    if not s or s == "[]":
        return []
    s = s.replace(" ", "")
    if s.startswith("[["):
        s = s[2:-2]
    
    edges = s.split("],[")
    graph = []
    
    for edge in edges:
        neighbors = []
        edge_str = edge.replace("[", "").replace("]", "")
        
        if edge_str:
            tokens = edge_str.split(",")
            for token in tokens:
                if token:
                    neighbors.append(int(token))
        
        graph.append(neighbors)
    
    return graph
`;

// Python graph serializer
const pythonGraphSerializer = `
def serialize_graph(graph):
    if not graph:
        return "[]"
    
    edges = []
    for neighbors in graph:
        edge_str = "[" + ",".join(map(str, neighbors)) + "]"
        edges.append(edge_str)
    
    return "[" + ",".join(edges) + "]"
`;

// JavaScript graph parser
const javascriptGraphParser = `
function parseGraph(s) {
    if (!s || s === "[]") return [];
    s = s.replace(/ /g, "");
    if (s.startsWith("[[")) s = s.slice(2, -2);
    
    const edges = s.split("],[");
    const graph = [];
    
    for (const edge of edges) {
        const neighbors = [];
        const edgeStr = edge.replace(/[\[\]]/g, "");
        
        if (edgeStr) {
            const tokens = edgeStr.split(",");
            for (const token of tokens) {
                if (token) {
                    neighbors.push(parseInt(token));
                }
            }
        }
        
        graph.push(neighbors);
    }
    
    return graph;
}
`;

// JavaScript graph serializer
const javascriptGraphSerializer = `
function serializeGraph(graph) {
    if (!graph || graph.length === 0) return "[]";
    
    const edges = graph.map(neighbors => 
        "[" + neighbors.map(n => String(n)).join(",") + "]"
    );
    
    return "[" + edges.join(",") + "]";
}
`;

export {
    // C++
    cppGraphParser,
    cppGraphSerializer,
    // Java
    javaGraphParser,
    javaGraphSerializer,
    // Python
    pythonGraphParser,
    pythonGraphSerializer,
    // JavaScript
    javascriptGraphParser,
    javascriptGraphSerializer
};
