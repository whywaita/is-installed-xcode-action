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

// npm/src/xcodereleases.ts
var xcodereleases_exports = {};
__export(xcodereleases_exports, {
  getXcodeNewestRelease: () => getXcodeNewestRelease
});
module.exports = __toCommonJS(xcodereleases_exports);

// npm/node_modules/xcodereleases-deno-sdk/esm/mod.js
function GetXcodeReleasesByRelease(releases, releaseType) {
  switch (releaseType) {
    case "release":
      return releases.filter((release) => release.version.release.release);
    case "beta":
      return releases.filter((release) => release.version.release.beta !== void 0);
    case "rc":
      return releases.filter((release) => release.version.release.rc !== void 0);
    case "gm":
      return releases.filter((release) => release.version.release.gm);
    case "gmSeed":
      return releases.filter((release) => release.version.release.gmSeed !== void 0);
    case "dp":
      return releases.filter((release) => release.version.release.dp !== void 0);
  }
}

// npm/src/xcodereleases.ts
function getXcodeNewestRelease(xr) {
  const releasesVersions = GetXcodeReleasesByRelease(
    xr,
    "release"
  );
  return releasesVersions[0];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getXcodeNewestRelease
});
