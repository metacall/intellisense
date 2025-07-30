import {languages} from 'vscode';

type Handle = {
    fileName: string;
}

export interface Language {
    typeMapping: { [key: string]: string };
    defineType: (typeName: string, typeId: number) => string;

    readFile(path: string): Promise<string>;
    writeStub(handle: Handle): Promise<void>;
    getStubFilePath(fileName: string): string;
    getStubFileContent(fileName: string): Promise<string>;
    getStubFileName(fileName: string): string;
    getStubFilePathFromHandle(handle: Handle): string;
}