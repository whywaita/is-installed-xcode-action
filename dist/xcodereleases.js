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
  GetXcodeVersionsInGitHubHosted: () => GetXcodeVersionsInGitHubHosted,
  getXcodeNewestRelease: () => getXcodeNewestRelease
});
module.exports = __toCommonJS(xcodereleases_exports);

// npm/node_modules/xcodereleases-deno-sdk/esm/mod.js
var APIEndpoint = "https://xcodereleases.com/data.json";
async function GetXcodeReleases() {
  return await GetXcodeReleasesWithURL(APIEndpoint);
}
async function GetXcodeReleasesWithURL(url) {
  const response = await fetch(url);
  const data = await response.json();
  const releases = parseXcodeReleases(data);
  return releases.sort((a, b) => a._versionOrder - b._versionOrder);
}
function parseXcodeReleases(data) {
  return JSON.parse(data);
}
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
function GetXcodeReleasesSinceDate(releases, date) {
  return releases.filter((release) => {
    const releaseDate = new Date(release.date.year, release.date.month - 1, release.date.day);
    return releaseDate >= date;
  });
}
function GetXcodeReleasesCompatibleVersion(releases, macOSVersion) {
  const [major, minor] = macOSVersion.split(".");
  const majorVersion = parseInt(major);
  const minorVersion = parseInt(minor);
  return releases.filter((release) => {
    const [requiredMajor, requiredMinor] = release.requires.split(".");
    const requiredMajorVersion = parseInt(requiredMajor);
    const requiredMinorVersion = parseInt(requiredMinor);
    return majorVersion > requiredMajorVersion || majorVersion === requiredMajorVersion && minorVersion >= requiredMinorVersion;
  });
}

// npm/src/xcodereleases.ts
async function GetXcodeVersionsInGitHubHosted(version) {
  const xr = await GetXcodeReleases();
  return getXcodeVersionsInGitHubHosted(xr, version);
}
function getXcodeVersionsInGitHubHosted(xr, macOSVersion) {
  let result = [];
  const releasesVersions = GetXcodeReleasesByRelease(
    xr,
    "release"
  );
  const compatibleVersions = GetXcodeReleasesCompatibleVersion(
    releasesVersions,
    macOSVersion
  );
  result = result.concat(compatibleVersions);
  const betaVersions = GetXcodeReleasesByRelease(xr, "beta");
  result = result.concat(betaVersions[0]);
  const gmVersions = GetXcodeReleasesByRelease(xr, "gm");
  result = result.concat(gmVersions[0]);
  const date = /* @__PURE__ */ new Date();
  date.setMonth(date.getMonth() - 3);
  const oldVersions = GetXcodeReleasesSinceDate(xr, date);
  result = result.concat(oldVersions);
  result.sort((a, b) => {
    if (a._versionOrder > b._versionOrder) {
      return -1;
    }
    if (a._versionOrder < b._versionOrder) {
      return 1;
    }
    return 0;
  });
  return result;
}
function getXcodeNewestRelease(xr) {
  const releasesVersions = GetXcodeReleasesByRelease(
    xr,
    "release"
  );
  return releasesVersions[0];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetXcodeVersionsInGitHubHosted,
  getXcodeNewestRelease
});
