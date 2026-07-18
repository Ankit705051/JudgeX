#pragma once

#include <cctype>
#include <cstdlib>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace nlohmann {

class json {
public:
    json() = default;

    static json parse(const std::string& text) {
        json value;
        value.text_ = text;
        return value;
    }

    template <typename T>
    T get() const;

private:
    std::string text_;

    static std::string trim(const std::string& s) {
        size_t start = 0;
        while (start < s.size() && std::isspace(static_cast<unsigned char>(s[start]))) {
            ++start;
        }

        size_t end = s.size();
        while (end > start && std::isspace(static_cast<unsigned char>(s[end - 1]))) {
            --end;
        }

        return s.substr(start, end - start);
    }

    static std::string unquote(const std::string& s) {
        if (s.size() >= 2 && s.front() == '"' && s.back() == '"') {
            std::string out;
            bool escaped = false;
            for (size_t i = 1; i + 1 < s.size(); ++i) {
                char c = s[i];
                if (escaped) {
                    out.push_back(c);
                    escaped = false;
                    continue;
                }
                if (c == '\\') {
                    escaped = true;
                    continue;
                }
                out.push_back(c);
            }
            return out;
        }
        return s;
    }

    static std::vector<std::string> splitTopLevel(const std::string& s) {
        std::vector<std::string> tokens;
        std::string current;
        int depth = 0;
        bool inQuotes = false;
        bool escaped = false;

        for (char c : s) {
            if (escaped) {
                current.push_back(c);
                escaped = false;
                continue;
            }
            if (c == '\\') {
                escaped = true;
                current.push_back(c);
                continue;
            }
            if (c == '"') {
                inQuotes = !inQuotes;
                current.push_back(c);
                continue;
            }
            if (!inQuotes) {
                if (c == '[') depth++;
                if (c == ']') depth--;
                if (c == ',' && depth == 0) {
                    if (!current.empty()) tokens.push_back(trim(current));
                    current.clear();
                    continue;
                }
            }
            current.push_back(c);
        }

        if (!current.empty()) {
            tokens.push_back(trim(current));
        }

        return tokens;
    }

    template <typename T>
    static T parseNumber(const std::string& s) {
        std::stringstream ss(trim(s));
        T value{};
        ss >> value;
        return value;
    }
};

template <>
inline std::vector<int> json::get<std::vector<int>>() const {
    std::string s = trim(text_);
    if (s.empty() || s == "[]") return {};
    if (s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2);
    if (trim(s).empty()) return {};

    std::vector<int> out;
    for (const std::string& token : splitTopLevel(s)) {
        if (!token.empty()) out.push_back(parseNumber<int>(token));
    }
    return out;
}

template <>
inline std::vector<long long> json::get<std::vector<long long>>() const {
    std::string s = trim(text_);
    if (s.empty() || s == "[]") return {};
    if (s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2);
    if (trim(s).empty()) return {};

    std::vector<long long> out;
    for (const std::string& token : splitTopLevel(s)) {
        if (!token.empty()) out.push_back(parseNumber<long long>(token));
    }
    return out;
}

template <>
inline std::vector<double> json::get<std::vector<double>>() const {
    std::string s = trim(text_);
    if (s.empty() || s == "[]") return {};
    if (s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2);
    if (trim(s).empty()) return {};

    std::vector<double> out;
    for (const std::string& token : splitTopLevel(s)) {
        if (!token.empty()) out.push_back(parseNumber<double>(token));
    }
    return out;
}

template <>
inline std::vector<bool> json::get<std::vector<bool>>() const {
    std::string s = trim(text_);
    if (s.empty() || s == "[]") return {};
    if (s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2);
    if (trim(s).empty()) return {};

    std::vector<bool> out;
    for (const std::string& token : splitTopLevel(s)) {
        std::string value = trim(token);
        for (char& c : value) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
        out.push_back(value == "true" || value == "1");
    }
    return out;
}

template <>
inline std::vector<std::string> json::get<std::vector<std::string>>() const {
    std::string s = trim(text_);
    if (s.empty() || s == "[]") return {};
    if (s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2);
    if (trim(s).empty()) return {};

    std::vector<std::string> out;
    for (const std::string& token : splitTopLevel(s)) {
        if (!token.empty()) out.push_back(unquote(trim(token)));
    }
    return out;
}

template <>
inline std::vector<std::vector<int>> json::get<std::vector<std::vector<int>>>() const {
    std::string s = trim(text_);
    if (s.empty() || s == "[]") return {};
    if (s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2);
    if (trim(s).empty()) return {};

    std::vector<std::vector<int>> out;
    for (const std::string& token : splitTopLevel(s)) {
        if (!token.empty()) out.push_back(json::parse(token).get<std::vector<int>>());
    }
    return out;
}

template <>
inline std::vector<std::vector<std::string>> json::get<std::vector<std::vector<std::string>>>() const {
    std::string s = trim(text_);
    if (s.empty() || s == "[]") return {};
    if (s.front() == '[' && s.back() == ']') s = s.substr(1, s.size() - 2);
    if (trim(s).empty()) return {};

    std::vector<std::vector<std::string>> out;
    for (const std::string& token : splitTopLevel(s)) {
        if (!token.empty()) out.push_back(json::parse(token).get<std::vector<std::string>>());
    }
    return out;
}

} // namespace nlohmann
