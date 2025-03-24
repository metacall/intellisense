
// Handle
/*
{
      name: 'gnu/store/yraph1nmn9z51zvbvjk13lcw8pmc6q56-profile/lib/plugins/cli/internal/cli_cmd_plugin/cli_cmd_plugin.js',
      scope: {
        name: 'global_namespace',
        funcs: [
          {
            name: 'command_register',
            signature: {
              ret: { type: { name: '', id: 20 } },
              args: [
                { name: 'cmd', type: { name: '', id: 20 } },
                { name: '_arg1', type: { name: '', id: 20 } }
              ]
            },
            async: false
          },
          {
            name: 'command_initialize',
            signature: {
              ret: { type: { name: '', id: 20 } },
              args: [ { name: 'plugin_path', type: { name: '', id: 20 } } ]
            },
            async: false
          },
          {
            name: 'command_function',
            signature: {
              ret: { type: { name: '', id: 20 } },
              args: [ { name: 'cmd', type: { name: '', id: 20 } } ]
            },
            async: false
          },
          {
            name: 'command_destroy',
            signature: { ret: { type: { name: '', id: 20 } }, args: [] },
            async: false
          },
          {
            name: 'command_parse',
            signature: { ret: { type: { name: '', id: 20 } }, args: [] },
            async: false
          }
        ],
        classes: [],
        objects: []
      }
    },
*/

import { languages } from "vscode";

interface Language {
    // int -> METACALL_INT
    defineTypes(typeName: string, typeId: ValueId) // store also the Python internal representation of the type

    // def yeet() -> int:
    async readFile(path: string): Promise<Handle>;

    // This will generate the stubs in our language
    async writeStub(Handle): Promise<void>;
}

class Python extends Language {
    Record<string, ValueId> types;

    constructor() {
        this.defineTypes('int', 3);
        this.defineTypes('str', 7);
        // ...
    }

    defineTypes(typeName: string, typeId: ValueId) {
        types[typeName] = typeId;
    }
    
    async readFile(path: string): Promise<Handle> {
        // parse the python file into python ast
        // convert the python ast into the json Handle
        return handle;
    }

    async writeStub(handle: Handle, outputDir: string): Promise<void> {
        // you get the Handle and you produce a python stub from it
        // then you wirte it into outputDir
    }
}

class TypeScript extends Language {
    // ...
}

// How to use this? We have a project like
/*
    file1.ts
    file2.ts
    ...
    main.py
*/

// Now we should do this for all files, but I will show only one

const typeScript = new TypeScript();
const python = new Python();

const handle = await typeScript.readFile('file1.ts');
await python.writeStub(handle, 'out/file1.py');

// Later on we can generalize this by using the extensions of the files to index the languages, for example:
Record<string, Language> languages;

languages['ts'] = new TypeScript();
languages['py'] = new Python();
// ...


// Then when we do foreach file, we just do:

const handle = await languages[ext(importedFile)].readfile(importedFile);
await languages[ext(targetFile)].writeStub(handle)
