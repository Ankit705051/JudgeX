package com.google.gson;

import java.lang.reflect.Array;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal JSON reader used by the JudgeX sandbox. Supports the subset of
 * Gson's API the generated harness needs:
 *   - fromJson(String, Class)      -> primitive arrays, String, boxed scalars
 *   - fromJson(String, Type)       -> Class types plus List<...>/ArrayList<...>
 *                                     via TypeToken or ParameterizedType
 */
public class Gson {
    public Gson() {}

    // ------------------------------------------------------------------
    // Class-based entry point (backwards compatible)
    // ------------------------------------------------------------------
    public <T> T fromJson(String json, Class<T> classOfT) {
        if (classOfT == int[].class) {
            return classOfT.cast(parseIntArray(json));
        }
        if (classOfT == Integer[].class) {
            return classOfT.cast(parseIntegerArray(json));
        }
        if (classOfT == long[].class) {
            return classOfT.cast(parseLongArray(json));
        }
        if (classOfT == Long[].class) {
            return classOfT.cast(parseLongObjectArray(json));
        }
        if (classOfT == double[].class) {
            return classOfT.cast(parseDoubleArray(json));
        }
        if (classOfT == Double[].class) {
            return classOfT.cast(parseDoubleObjectArray(json));
        }
        if (classOfT == boolean[].class) {
            return classOfT.cast(parseBooleanArray(json));
        }
        if (classOfT == Boolean[].class) {
            return classOfT.cast(parseBooleanObjectArray(json));
        }
        if (classOfT == String[].class) {
            return classOfT.cast(parseStringArray(json));
        }
        if (classOfT == int[][].class) {
            return classOfT.cast(parseIntMatrix(json));
        }
        if (classOfT == Integer[][].class) {
            return classOfT.cast(parseIntegerMatrix(json));
        }
        if (classOfT == Integer.class) {
            return classOfT.cast(Integer.valueOf(stripQuotes(json)));
        }
        if (classOfT == Long.class) {
            return classOfT.cast(Long.valueOf(stripQuotes(json)));
        }
        if (classOfT == Double.class) {
            return classOfT.cast(Double.valueOf(stripQuotes(json)));
        }
        if (classOfT == Boolean.class) {
            return classOfT.cast(Boolean.valueOf(stripQuotes(json)));
        }
        if (classOfT == String.class) {
            return classOfT.cast(unquote(json));
        }

        throw new UnsupportedOperationException(
            "Minimal Gson stub only supports primitive array parsing."
        );
    }

    // ------------------------------------------------------------------
    // Type-based entry point (supports List<Integer>, List<List<Integer>>, ...)
    // ------------------------------------------------------------------
    @SuppressWarnings("unchecked")
    public <T> T fromJson(String json, Type type) {
        if (type instanceof Class) {
            return fromJson(json, (Class<T>) type);
        }
        Object tree = new Parser(json).parse();
        return (T) convert(tree, type);
    }

    @SuppressWarnings("unchecked")
    private Object convert(Object value, Type type) {
        if (type instanceof Class) {
            Class<?> cls = (Class<?>) type;
            if (cls == int.class || cls == Integer.class) return toInt(value);
            if (cls == long.class || cls == Long.class) return toLong(value);
            if (cls == double.class || cls == Double.class) return toDouble(value);
            if (cls == float.class || cls == Float.class) return toFloat(value);
            if (cls == boolean.class || cls == Boolean.class) return toBool(value);
            if (cls == String.class) return toStr(value);
            if (cls.isArray()) return toArray(value, cls);
            return value;
        }

        if (type instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType) type;
            Type arg = pt.getActualTypeArguments()[0];
            List<Object> src = value instanceof List
                ? (List<Object>) value
                : new ArrayList<>();
            List<Object> out = new ArrayList<>();
            for (Object e : src) {
                out.add(convert(e, arg));
            }
            Class<?> raw = (Class<?>) pt.getRawType();
            if (raw == ArrayList.class) {
                return new ArrayList<>(out);
            }
            return out;
        }

        return value;
    }

    private Object toArray(Object value, Class<?> arrayClass) {
        List<Object> list = value instanceof List
            ? (List<Object>) value
            : new ArrayList<>();
        Class<?> component = arrayClass.getComponentType();
        Object array = Array.newInstance(component, list.size());
        for (int i = 0; i < list.size(); i++) {
            Array.set(array, i, convert(list.get(i), component));
        }
        return array;
    }

    private Integer toInt(Object v) {
        if (v == null) return 0;
        if (v instanceof Number) return ((Number) v).intValue();
        return Integer.parseInt(v.toString());
    }

    private Long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(v.toString());
    }

    private Double toDouble(Object v) {
        if (v == null) return 0.0;
        if (v instanceof Number) return ((Number) v).doubleValue();
        return Double.parseDouble(v.toString());
    }

    private Float toFloat(Object v) {
        if (v == null) return 0f;
        if (v instanceof Number) return ((Number) v).floatValue();
        return Float.parseFloat(v.toString());
    }

    private Boolean toBool(Object v) {
        if (v == null) return false;
        if (v instanceof Boolean) return (Boolean) v;
        String s = v.toString().trim().toLowerCase();
        return s.equals("true") || s.equals("1");
    }

    private String toStr(Object v) {
        if (v == null) return null;
        return v.toString();
    }

    // ------------------------------------------------------------------
    // JSON parser: produces ArrayList / LinkedHashMap / String / BigDecimal /
    // Boolean / null
    // ------------------------------------------------------------------
    private static final class Parser {
        private final String s;
        private int i;

        Parser(String s) {
            this.s = s == null ? "" : s.trim();
        }

        Object parse() {
            Object v = value();
            ws();
            return v;
        }

        private void ws() {
            while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++;
        }

        private Object value() {
            ws();
            if (i >= s.length()) return null;
            char c = s.charAt(i);

            if (c == '[') {
                i++;
                ArrayList<Object> arr = new ArrayList<>();
                ws();
                if (i < s.length() && s.charAt(i) == ']') {
                    i++;
                    return arr;
                }
                while (i < s.length()) {
                    arr.add(value());
                    ws();
                    if (i < s.length() && s.charAt(i) == ',') {
                        i++;
                        continue;
                    }
                    if (i < s.length() && s.charAt(i) == ']') {
                        i++;
                    }
                    break;
                }
                return arr;
            }

            if (c == '{') {
                i++;
                Map<String, Object> map = new LinkedHashMap<>();
                ws();
                if (i < s.length() && s.charAt(i) == '}') {
                    i++;
                    return map;
                }
                while (i < s.length()) {
                    ws();
                    String key = string();
                    ws();
                    if (i < s.length() && s.charAt(i) == ':') i++;
                    map.put(key, value());
                    ws();
                    if (i < s.length() && s.charAt(i) == ',') {
                        i++;
                        continue;
                    }
                    if (i < s.length() && s.charAt(i) == '}') {
                        i++;
                    }
                    break;
                }
                return map;
            }

            if (c == '"') {
                return string();
            }

            if (c == 't') {
                i += 4;
                return Boolean.TRUE;
            }
            if (c == 'f') {
                i += 5;
                return Boolean.FALSE;
            }
            if (c == 'n') {
                i += 4;
                return null;
            }

            int start = i;
            while (i < s.length()
                    && "-+0123456789.eE".indexOf(s.charAt(i)) >= 0) {
                i++;
            }
            String num = s.substring(start, i);
            try {
                return new BigDecimal(num);
            } catch (NumberFormatException e) {
                return num;
            }
        }

        private String string() {
            StringBuilder b = new StringBuilder();
            if (i < s.length() && s.charAt(i) == '"') i++;
            while (i < s.length()) {
                char c = s.charAt(i++);
                if (c == '"') break;
                if (c == '\\' && i < s.length()) {
                    char e = s.charAt(i++);
                    switch (e) {
                        case 'n': b.append('\n'); break;
                        case 't': b.append('\t'); break;
                        case 'r': b.append('\r'); break;
                        case 'b': b.append('\b'); break;
                        case 'f': b.append('\f'); break;
                        case 'u':
                            b.append((char) Integer.parseInt(
                                s.substring(i, Math.min(i + 4, s.length())), 16));
                            i = Math.min(i + 4, s.length());
                            break;
                        default: b.append(e);
                    }
                } else {
                    b.append(c);
                }
            }
            return b.toString();
        }
    }

    // ------------------------------------------------------------------
    // Legacy string-based helpers (used by the Class-based entry point)
    // ------------------------------------------------------------------
    private static String trimBrackets(String json) {
        if (json == null) return "";
        String s = json.trim();
        if (s.startsWith("[") && s.endsWith("]")) {
            return s.substring(1, s.length() - 1).trim();
        }
        return s;
    }

    private static String stripQuotes(String json) {
        if (json == null) return "";
        String s = json.trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            return s.substring(1, s.length() - 1);
        }
        return s;
    }

    private static String unquote(String json) {
        String s = stripQuotes(json);
        return s.replace("\\\"", "\"").replace("\\\\", "\\");
    }

    private static List<String> splitTopLevel(String json) {
        String s = trimBrackets(json);
        List<String> out = new ArrayList<>();
        if (s.isEmpty()) return out;

        StringBuilder current = new StringBuilder();
        int depth = 0;
        boolean inQuotes = false;
        boolean escaped = false;

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);

            if (escaped) {
                current.append(c);
                escaped = false;
                continue;
            }

            if (c == '\\') {
                escaped = true;
                current.append(c);
                continue;
            }

            if (c == '"') {
                inQuotes = !inQuotes;
                current.append(c);
                continue;
            }

            if (!inQuotes) {
                if (c == '[') depth++;
                if (c == ']') depth--;
                if (c == ',' && depth == 0) {
                    out.add(current.toString().trim());
                    current.setLength(0);
                    continue;
                }
            }

            current.append(c);
        }

        String last = current.toString().trim();
        if (!last.isEmpty()) out.add(last);
        return out;
    }

    private static int[] parseIntArray(String json) {
        List<String> tokens = splitTopLevel(json);
        int[] result = new int[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            result[i] = Integer.parseInt(tokens.get(i));
        }
        return result;
    }

    private static Integer[] parseIntegerArray(String json) {
        List<String> tokens = splitTopLevel(json);
        Integer[] result = new Integer[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            result[i] = Integer.valueOf(tokens.get(i));
        }
        return result;
    }

    private static long[] parseLongArray(String json) {
        List<String> tokens = splitTopLevel(json);
        long[] result = new long[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            result[i] = Long.parseLong(tokens.get(i));
        }
        return result;
    }

    private static Long[] parseLongObjectArray(String json) {
        List<String> tokens = splitTopLevel(json);
        Long[] result = new Long[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            result[i] = Long.valueOf(tokens.get(i));
        }
        return result;
    }

    private static double[] parseDoubleArray(String json) {
        List<String> tokens = splitTopLevel(json);
        double[] result = new double[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            result[i] = Double.parseDouble(tokens.get(i));
        }
        return result;
    }

    private static Double[] parseDoubleObjectArray(String json) {
        List<String> tokens = splitTopLevel(json);
        Double[] result = new Double[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            result[i] = Double.valueOf(tokens.get(i));
        }
        return result;
    }

    private static boolean[] parseBooleanArray(String json) {
        List<String> tokens = splitTopLevel(json);
        boolean[] result = new boolean[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            String token = tokens.get(i).trim().toLowerCase();
            result[i] = token.equals("true") || token.equals("1");
        }
        return result;
    }

    private static Boolean[] parseBooleanObjectArray(String json) {
        List<String> tokens = splitTopLevel(json);
        Boolean[] result = new Boolean[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            String token = tokens.get(i).trim().toLowerCase();
            result[i] = token.equals("true") || token.equals("1");
        }
        return result;
    }

    private static String[] parseStringArray(String json) {
        List<String> tokens = splitTopLevel(json);
        String[] result = new String[tokens.size()];
        for (int i = 0; i < tokens.size(); i++) {
            String token = tokens.get(i).trim();
            if (token.startsWith("\"") && token.endsWith("\"")) {
                token = token.substring(1, token.length() - 1);
            }
            result[i] = token.replace("\\\"", "\"").replace("\\\\", "\\");
        }
        return result;
    }

    private static int[][] parseIntMatrix(String json) {
        List<String> rows = splitTopLevel(json);
        int[][] result = new int[rows.size()][];
        for (int i = 0; i < rows.size(); i++) {
            result[i] = parseIntArray(rows.get(i));
        }
        return result;
    }

    private static Integer[][] parseIntegerMatrix(String json) {
        List<String> rows = splitTopLevel(json);
        Integer[][] result = new Integer[rows.size()][];
        for (int i = 0; i < rows.size(); i++) {
            result[i] = parseIntegerArray(rows.get(i));
        }
        return result;
    }
}
