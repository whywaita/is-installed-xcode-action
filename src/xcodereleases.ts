import { GetXcodeReleasesByRelease } from "npm:xcodereleases-deno-sdk@0.2.1";
import type { XcodeRelease } from "npm:xcodereleases-deno-sdk@0.2.1";

export function getXcodeNewestRelease(xr: XcodeRelease[]): XcodeRelease {
  const releasesVersions: XcodeRelease[] = GetXcodeReleasesByRelease(
    xr,
    "release",
  );
  return releasesVersions[0];
}
