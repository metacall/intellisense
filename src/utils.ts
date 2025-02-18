import { execSync } from "child_process";

export function isMetacallInstalled(command: string): boolean {
    try {
        execSync(`${command} --version`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

export function typeMappingForLanguage(language: 'TS' | 'PY'): { [key: string]: string } {
    switch (language) {
        case 'TS':
            return {
                number: "int",
                string: "str",
                boolean: "bool",
                unknown: "object"
            };
        case 'PY':
            return {
                number: "int",
                string: "str",
                boolean: "bool",
                object: "dict",
                any: "object"
            };
        default:
            throw new Error("Invalid language");
    }
}