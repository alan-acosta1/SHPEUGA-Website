import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);

// Load route/proxy code with an isolated auth client; Next.js responses remain real.
export default function loadTypescript(relativePath, mocks) {
    const filename = fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
        fileName: filename,
    });
    const loadedModule = { exports: {} };
    vm.runInNewContext(outputText, {
        module: loadedModule,
        exports: loadedModule.exports,
        require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
        URL,
        process,
    }, { filename });
    return loadedModule.exports;
}
