// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

import { mono_wasm_imports, mono_wasm_threads_imports } from "./exports-binding";
import gitHash from "consts:gitHash";

const JSImportSignatures: Record<string, string> = {
    mono_wasm_console_clear: "v",
    mono_wasm_release_cs_owned_object: "vi",
    mono_wasm_bind_js_import_ST: "pp",
    mono_wasm_invoke_js_function: "vip",
    mono_wasm_invoke_jsimport_ST: "vip",
    mono_wasm_resolve_or_reject_promise: "vp",
    mono_wasm_cancel_promise: "vi",
    mono_wasm_get_locale_info: "ppipipip",
    mono_wasm_pthread_on_pthread_registered: "vi",
    mono_wasm_pthread_on_pthread_attached: "viiiiii",
    mono_wasm_pthread_on_pthread_unregistered: "vi",
    mono_wasm_pthread_set_name: "vi",
    mono_wasm_start_deputy_thread_async: "v",
    mono_wasm_start_io_thread_async: "v",
    mono_wasm_schedule_synchronization_context: "v",
    mono_wasm_dump_threads: "v",
    mono_wasm_install_js_worker_interop: "vi",
    mono_wasm_uninstall_js_worker_interop: "v",
    mono_wasm_invoke_jsimport_MT: "vpp",
    mono_wasm_warn_about_blocking_wait: "vpi",
};

function append_linker_signatures (lines: string[], imports: readonly Function[]): void {
    for (const import_ of imports) {
        const sig = JSImportSignatures[import_.name];
        if (sig !== undefined) {
            lines.push(`DotnetSupportLib["${import_.name}__sig"] = "${sig}";`);
        }
    }
}

export function export_linker_indexes_as_code (): string {
    const indexByName: any = {
        mono_wasm_imports: {},
        mono_wasm_threads_imports: {},
    };
    let idx = 0;
    for (const wi of mono_wasm_imports) {
        indexByName.mono_wasm_imports[wi.name] = idx;
        idx++;
    }
    for (const wi of mono_wasm_threads_imports) {
        indexByName.mono_wasm_threads_imports[wi.name] = idx;
        idx++;
    }

    const sigLines: string[] = [];
    append_linker_signatures(sigLines, mono_wasm_imports);
    append_linker_signatures(sigLines, mono_wasm_threads_imports);

    return `
    var gitHash = "${gitHash}";
    var methodIndexByName = ${JSON.stringify(indexByName, null, 2)};
    ${sigLines.join("\n    ")}
    injectDependencies();
    `;
}

// this is running during runtime compile time inside rollup process.
(globalThis as any).export_linker_indexes_as_code = export_linker_indexes_as_code;
