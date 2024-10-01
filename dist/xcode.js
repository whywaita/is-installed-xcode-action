var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// npm/src/xcode.ts
var xcode_exports = {};
__export(xcode_exports, {
  GetXcodeVersionsInGitHubHosted: () => GetXcodeVersionsInGitHubHosted
});
module.exports = __toCommonJS(xcode_exports);
async function GetXcodeVersionsInGitHubHosted(macOSVersion, architecture) {
  if (!isValidArchitecture(architecture)) {
    throw new Error(`Invalid architecture: ${architecture}`);
  }
  const majorVersion = getMacOSMajorVersion(macOSVersion);
  const toolsetJson = await fetch(
    `https://raw.githubusercontent.com/actions/runner-images/refs/heads/main/images/macos/toolsets/toolset-${majorVersion}.json`
  ).catch((error) => {
    throw new Error(`Failed to fetch toolset json: ${error}`);
  });
  const toolset = await toolsetJson.json();
  const defaultVersion = toolset.xcode.default;
  const versions = toolset.xcode[architecture].versions;
  return { defaultVersion, versions };
}
function getMacOSMajorVersion(macOSVersion) {
  return macOSVersion.split(".")[0];
}
function isValidArchitecture(architecture) {
  return ["x64", "arm64"].includes(architecture);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetXcodeVersionsInGitHubHosted
});
