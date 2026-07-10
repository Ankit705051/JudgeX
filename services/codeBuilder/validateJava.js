// Java code validation to detect incomplete code before compilation
// This helps provide better error messages to users

/**
 * Check if Java code has balanced braces
 * @param {string} code - The Java code to validate
 * @returns {object} - { valid: boolean, error: string | null }
 */
const validateJavaBraces = (code) => {
    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;
    let inString = false;
    let inChar = false;
    let inLineComment = false;
    let inBlockComment = false;
    
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const nextChar = code[i + 1];
        
        // Handle comments
        if (!inString && !inChar && !inBlockComment) {
            if (char === '/' && nextChar === '/') {
                inLineComment = true;
                i++;
                continue;
            }
            if (char === '/' && nextChar === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
        }
        
        if (inLineComment && char === '\n') {
            inLineComment = false;
            continue;
        }
        
        if (inBlockComment && char === '*' && nextChar === '/') {
            inBlockComment = false;
            i++;
            continue;
        }
        
        if (inLineComment || inBlockComment) {
            continue;
        }
        
        // Handle strings
        if (char === '"' && (i === 0 || code[i-1] !== '\\')) {
            inString = !inString;
            continue;
        }
        
        // Handle character literals
        if (char === "'" && (i === 0 || code[i-1] !== '\\')) {
            inChar = !inChar;
            continue;
        }
        
        if (inString || inChar) {
            continue;
        }
        
        // Count braces, parens, brackets
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
    }
    
    if (braceCount !== 0) {
        return {
            valid: false,
            error: `Unbalanced braces: missing ${braceCount > 0 ? braceCount + ' closing' : Math.abs(braceCount) + ' opening'} brace(s) '}'`
        };
    }
    
    if (parenCount !== 0) {
        return {
            valid: false,
            error: `Unbalanced parentheses: missing ${parenCount > 0 ? parenCount + ' closing' : Math.abs(parenCount) + ' opening'} parenthesis(es ')'`
        };
    }
    
    if (bracketCount !== 0) {
        return {
            valid: false,
            error: `Unbalanced brackets: missing ${bracketCount > 0 ? bracketCount + ' closing' : Math.abs(bracketCount) + ' opening'} bracket(s ']'`
        };
    }
    
    return { valid: true, error: null };
};

/**
 * Check if user code has a valid class or function structure
 * @param {string} code - The Java code to validate
 * @param {string} functionName - The expected function name
 * @returns {object} - { valid: boolean, error: string | null }
 */
const validateJavaStructure = (code, functionName) => {
    // Check for Solution class
    const hasSolutionClass = /\bclass\s+Solution\b/.test(code);
    
    // Check for the function/method
    const functionPattern = new RegExp(`\\b(public\\s+)?[A-Za-z0-9_<>\\[\\]]+\\s+${functionName}\\s*\\(`);
    const hasFunction = functionPattern.test(code);
    
    if (!hasSolutionClass && !hasFunction) {
        return {
            valid: false,
            error: `No 'Solution' class or '${functionName}' method found in code`
        };
    }
    
    return { valid: true, error: null };
};

/**
 * Validate Java user code for common syntax issues
 * @param {string} userCode - The user's Java code
 * @param {object} problem - The problem object with functionName
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validateJavaCode = (userCode, problem) => {
    const errors = [];
    
    // Check brace balance
    const braceResult = validateJavaBraces(userCode);
    if (!braceResult.valid) {
        errors.push(braceResult.error);
    }
    
    // Check structure
    const structureResult = validateJavaStructure(userCode, problem.functionName);
    if (!structureResult.valid) {
        errors.push(structureResult.error);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

export {
    validateJavaBraces,
    validateJavaStructure,
    validateJavaCode
};