function normalizeOutput(output) {
    return output
        .trim()
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map(line => line.trim())
        .join("\n");
}

export function compareOutputs(expected, actual) {
    expected = normalizeOutput(expected);
    actual = normalizeOutput(actual);

    try {
        const expectedJson = JSON.parse(expected);
        const actualJson = JSON.parse(actual);

        return compareJson(expectedJson, actualJson);
    } catch {
        return expected === actual;
    }
}

function compareJson(expected, actual) {
    if (typeof expected === "number" && typeof actual === "number") {
        // Floating-point solutions should not fail due to language-specific
        // formatting/rounding in an otherwise correct answer.
        return Math.abs(expected - actual) <= 1e-6 * Math.max(1, Math.abs(expected));
    }
    if (Array.isArray(expected) && Array.isArray(actual)) {
        return expected.length === actual.length && expected.every(
            (value, index) => compareJson(value, actual[index])
        );
    }
    if (expected && actual && typeof expected === "object" && typeof actual === "object") {
        const expectedKeys = Object.keys(expected);
        const actualKeys = Object.keys(actual);
        return expectedKeys.length === actualKeys.length && expectedKeys.every(
            key => Object.hasOwn(actual, key) && compareJson(expected[key], actual[key])
        );
    }
    return expected === actual;
}
