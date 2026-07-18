package com.google.gson;

import java.util.ArrayList;
import java.util.List;

public class Gson {
    public Gson() {}

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
