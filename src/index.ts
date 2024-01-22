import { Client } from "@transia/xrpl";
import { HookDefinition } from "@transia/xrpl/dist/npm/models/ledger";
import wabt from "wabt";

const client = new Client("wss://xahau.org");

const getHookCodeFromHookHash = async (hookhash: string) => {
  await client.connect();
  const response = await client.request({
    command: "ledger_entry",
    hook_definition: hookhash,
  });
  await client.disconnect();
  const code = (response.result.node as HookDefinition).CreateCode;
  if (!code) throw new Error("No HookDefinition found");
  return code;
};

const wasmToWast = async (wasmBinary: Buffer) => {
  // https://github.com/AssemblyScript/wabt.js
  const wasm = await wabt();
  const module = wasm.readWasm(wasmBinary, { readDebugNames: true });
  module.applyNames();
  const wast = module.toText({ foldExprs: false, inlineExport: false });
  return wast;
};

const main = async () => {
  const code = await getHookCodeFromHookHash("C820233A5F9D204907EAF43E6CD57D6D60DAA7DAFE3D2F8741CFAE9D873DA910");

  const buffer = Buffer.from(code, "hex");

  const wast = await wasmToWast(buffer);

  console.log(wast);
};

main();
