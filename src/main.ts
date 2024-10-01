import {
  debug,
  error,
  getInput,
  info,
  setFailed,
  warning,
} from "npm:@actions/core@1.10.1";
import { inspect } from "node:util";
import process from "node:process";
import {
  GetXcodeVersionsInGitHubHosted,
  XcodeVersionsInGitHubHosted,
} from "./xcode.ts";
import {
  ConvertArchitectures,
  getInstalledXcodeVersions,
  getMacOSVersion,
  getSymbolicXcodeVersion,
} from "./os.ts";

const isSuccessOnMiss: boolean = getInput("success-on-miss") === "true";

const main = async () => {
  const platform: string = Deno.build.os;
  if (platform !== "darwin") {
    setFailed("This action is only supported on macOS");
    return;
  }
  const rawArch: string = process.arch;
  const arch = ConvertArchitectures(rawArch);

  debug(`success-on-miss: ${isSuccessOnMiss}`);

  const version: string = await getMacOSVersion();
  debug(`macOS version: ${version}`);
  debug(`architecture: ${arch}`);

  const githubHostedInstalledVersion: XcodeVersionsInGitHubHosted =
    await GetXcodeVersionsInGitHubHosted(version, arch);
  debug(
    `GitHub hosted installed version: ${inspect(githubHostedInstalledVersion)}`,
  );

  // 1. Check installed Xcode is default version
  // And "/Applications/Xcode.app" is symbolic link to default version
  debug(`Default version: ${githubHostedInstalledVersion.defaultVersion}`);
  const isInstalledDefaultVersion: boolean =
    await isApplicationXcodeIsDefaultVersion(
      githubHostedInstalledVersion.defaultVersion,
    );
  if (isInstalledDefaultVersion === false) {
    const symbolicVersion: string = await getSymbolicXcodeVersion();
    warning("Installed Xcode is not newest version");
    warning(`Installed Xcode: ${symbolicVersion}`);
    warning(`Default Xcode: ${githubHostedInstalledVersion.defaultVersion}`);
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
      throw new Error("Cannot get installed Xcode versions");
    }
    warning(`Installed Xcode: ${installed.join(", ")}`);
    warning(
      `Required Xcode: ${
        githubHostedInstalledVersion.versions.map((v) => v.link).join(", ")
      }`,
    );
    warning(`Diff: ${diff.join(", ")}`);
    throw new Error(
      `Installed Xcode is not the required version. Installed: ${
        installed.join(", ")
      }, Required: ${
        githubHostedInstalledVersion.versions.map((v) => v.link).join(", ")
      }`,
    );
  }

  debug("Installed Xcode is newest version and required version");
  return;
};

async function isApplicationXcodeIsDefaultVersion(
  requiredDefaultVersion: string,
): Promise<boolean> {
  const symbolicVersion: string = await getSymbolicXcodeVersion();
  const normalizedSymbolicVersion = symbolicVersion.trim();
  const normalizedRequiredVersion = requiredDefaultVersion.trim();

  debug(`Symbolic link version: ${normalizedSymbolicVersion}`);
  debug(`Required default version: ${normalizedRequiredVersion}`);

  return normalizedSymbolicVersion === normalizedRequiredVersion;
}

async function getDiffInstalledVersion(
  githubHostedInstalledVersion: XcodeVersionsInGitHubHosted,
): Promise<string[]> {
  if (
    !githubHostedInstalledVersion.versions ||
    !Array.isArray(githubHostedInstalledVersion.versions)
  ) {
    throw new Error("No versions found in GitHub hosted installed versions");
  }
  const requiredVersion: string[] = githubHostedInstalledVersion.versions.map(
    (v) => v.link,
  );
  requiredVersion.sort();

  debug(`Required version: ${requiredVersion.join(", ")}`);

  const installed: string[] | undefined = await getInstalledXcodeVersions();
  if (installed === undefined) {
    throw new Error("Connot get installed Xcode versions");
  }
  installed.sort();

  debug(`Installed version: ${installed.join(", ")}`);

  // Compare installed and required version
  const diff: string[] = requiredVersion.filter((v) => !installed.includes(v));

  debug(
    `requiredVersion.filter((v) => !installed.includes(v)): ${diff.join(", ")}`,
  );

  return diff;
}

main().catch((e) => {
  if (isSuccessOnMiss) {
    info("Success on miss is enabled, so this action is success");
    return;
  }
  setFailed(e.message);
  error(e);
});
