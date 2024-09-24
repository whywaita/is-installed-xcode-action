import {
  debug,
  error,
  getInput,
  info,
  setFailed,
  warning,
} from "npm:@actions/core@1.10.1";
import { getXcodeNewestRelease } from "./xcodereleases.ts";
import {
  getInstalledXcodeVersions,
  getMacOSVersion,
  getSymbolicXcodeVersion,
} from "./os.ts";
import {
  GetXcodeReleases,
  GetXcodeVersionsInGitHubHosted,
  type XcodeRelease,
} from "npm:xcodereleases-deno-sdk@0.2.1";

const main = async () => {
  const platform: string = Deno.build.os;
  if (platform !== "darwin") {
    throw new Error("This action is only supported on macOS");
  }

  const isSuccessOnMiss: boolean = getInput("success-on-miss") === "true";
  debug(`success-on-miss: ${isSuccessOnMiss}`);

  const version: string = await getMacOSVersion();
  debug(`macOS version: ${version}`);
  const xr: XcodeRelease[] = await GetXcodeReleases();
  const githubHostedInstalledVersion: XcodeRelease[] =
    GetXcodeVersionsInGitHubHosted(
      xr,
      version,
    );

  // 1. Check installed Xcode is newest version
  // And "/Applications/Xcode.app" is symbolic link to newest version
  const newestVersion: XcodeRelease = getXcodeNewestRelease(
    githubHostedInstalledVersion,
  );
  const isInstalledNewestVersion: boolean =
    await isApplicationXcodeIsNewestVersion(
      newestVersion,
    );
  if (isInstalledNewestVersion === false) {
    const symbolicVersion: string = await getSymbolicXcodeVersion();
    warning("Installed Xcode is not newest version");
    warning(`Installed Xcode: ${symbolicVersion}`);
    warning(`Newest Xcode: ${newestVersion.version.number}`);
    if (isSuccessOnMiss) {
      info("Success on miss is enabled, so this action is success");
      return;
    }
    setFailed("Installed Xcode is not newest version");
    return;
  }

  // 2. Check installed Xcode is required version
  const diff: string[] = await getDiffInstalledVersion(
    githubHostedInstalledVersion,
  );
  if (diff.length > 0) {
    warning("Installed Xcode is not required version");
    const installed: string[] | undefined = await getInstalledXcodeVersions();
    if (installed === undefined) {
      throw new Error("Installed Xcode is not found");
    }
    warning(`Installed Xcode: ${installed.join(", ")}`);
    warning(
      `Required Xcode: ${
        githubHostedInstalledVersion.map((v) => v.version.number).join(", ")
      }`,
    );
    warning(`Diff: ${diff.join(", ")}`);
    throw new Error(
      "Installed Xcode is not required version. installed: " +
        installed.join(", ") + " required: " +
        githubHostedInstalledVersion.map((v) => v.version.number).join(", "),
    );
  }

  debug("Installed Xcode is newest version and required version");
  return;
};

async function isApplicationXcodeIsNewestVersion(
  requiredNewestVersion: XcodeRelease,
): Promise<boolean> {
  const symbolicVersion: string = await getSymbolicXcodeVersion();

  debug(`Symbolic link version: ${symbolicVersion}`);
  debug(`Required newest: ${requiredNewestVersion}`);
  debug(`Required newest version: ${requiredNewestVersion.version.number}`);

  return symbolicVersion === requiredNewestVersion.version.number;
}

async function getDiffInstalledVersion(
  githubHostedInstalledVersion: XcodeRelease[],
): Promise<string[]> {
  const requiredVersion: string[] = githubHostedInstalledVersion.map(
    (v) => v.version.number,
  );
  requiredVersion.sort();

  debug(`Required version: ${requiredVersion.join(", ")}`);

  const installed: string[] | undefined = await getInstalledXcodeVersions();
  if (installed === undefined) {
    throw new Error("Installed Xcode is not found");
  }
  installed.sort();

  debug(`Installed version: ${installed.join(", ")}`);

  // Compare installed and required version
  const diff: string[] = requiredVersion.filter((v) => !installed.includes(v));

  debug(`Diff: ${diff.join(", ")}`);

  return diff;
}

main().catch((e) => {
  const isSuccessOnMiss: boolean = getInput("success-on-miss") === "true";
  if (isSuccessOnMiss) {
    info("Success on miss is enabled, so this action is success");
    return;
  }
  setFailed(e.message);
  error(e);
});
