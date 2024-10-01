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
  const majorVersion = getMacOSMajorVersion(macOSVersion);
  let toolset;
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/actions/runner-images/main/images/macos/toolsets/toolset-${majorVersion}.json`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch toolset JSON: ${response.status} ${response.statusText}`
      );
    }
    toolset = await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch toolset JSON: ${error}`);
  }
  const defaultVersion = toolset.xcode.default;
  const archData = toolset.xcode[architecture];
  if (!archData) {
    throw new Error(`No data available for architecture: ${architecture}`);
  }
  const versions = archData.versions;
  return { defaultVersion, versions };
}
function getMacOSMajorVersion(macOSVersion) {
  return macOSVersion.split(".")[0];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetXcodeVersionsInGitHubHosted
});
