
export const LANGUAGE_MAP = {
   cpp:54,
   python:71,
   javascript:63,
   java:62
};
export function getLanguageId(language) {

    if (!LANGUAGE_MAP[language]) {
        throw new Error(`Unsupported language: ${language}`);
    }
    return LANGUAGE_MAP[language];

}