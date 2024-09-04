import {
  GetXcodeReleases,
  GetXcodeReleasesByRelease,
  GetXcodeReleasesCompatibleVersion,
  GetXcodeReleasesSinceDate,
} from "npm:xcodereleases-deno-sdk@0.1.9";
import type { XcodeRelease } from "npm:xcodereleases-deno-sdk@0.1.9";

export async function GetXcodeVersionsInGitHubHosted(
  version: string,
): Promise<XcodeRelease[]> {
  const xr: XcodeRelease[] = await GetXcodeReleases();
  return getXcodeVersionsInGitHubHosted(xr, version);
}

/**
 * Get Xcode versions in GitHub hosted
 * - all OS compatible versions side-by-side
 * - for beta, GM versions - latest beta only
 * - old patch versions are deprecated in 3 months
 *
 * @param xr XcodeReleases all versions
 * @param macOSVersion macOS version that running on this action
 * @returns XcodeRelease[]
 */
function getXcodeVersionsInGitHubHosted(
  xr: XcodeRelease[],
  macOSVersion: string,
): XcodeRelease[] {
  let result: XcodeRelease[] = [];

  // all OS compatible versions side-by-side
  const releasesVersions: XcodeRelease[] = GetXcodeReleasesByRelease(
    xr,
    "release",
  );
  const compatibleVersions: XcodeRelease[] = GetXcodeReleasesCompatibleVersion(
    releasesVersions,
    macOSVersion,
  );
  result = result.concat(compatibleVersions);

  // for beta, GM versions - latest beta only
  const betaVersions: XcodeRelease[] = GetXcodeReleasesByRelease(xr, "beta");
  result = result.concat(betaVersions[0]);
  const gmVersions: XcodeRelease[] = GetXcodeReleasesByRelease(xr, "gm");
  result = result.concat(gmVersions[0]);

  // old patch versions are deprecated in 3 months
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  const oldVersions: XcodeRelease[] = GetXcodeReleasesSinceDate(xr, date);
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

export function getXcodeNewestRelease(xr: XcodeRelease[]): XcodeRelease {
  const releasesVersions: XcodeRelease[] = GetXcodeReleasesByRelease(
    xr,
    "release",
  );
  return releasesVersions[0];
}
