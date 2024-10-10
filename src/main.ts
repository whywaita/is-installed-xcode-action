import { debug, error, info, setFailed } from "npm:@actions/core@1.10.1";
import { inspect } from "node:util";
import { CheckDefaultVersion } from "./check_default_version.ts";
import { getInputGHA, Input } from "./input.ts";
import { getPlatform, Platform } from "./os.ts";
import {
  GetXcodeVersionsInGitHubHosted,
  XcodeVersionsInGitHubHosted,
} from "./xcode.ts";
import { CheckInstalledVersions } from "./check_installed_version.ts";

const input: Input = getInputGHA();

const main = async () => {
  const plat: Platform = await getPlatform();

  const githubHostedInstalledVersion: XcodeVersionsInGitHubHosted =
    await GetXcodeVersionsInGitHubHosted(plat.version, plat.arch);
  debug(
    `GitHub hosted installed version: ${inspect(githubHostedInstalledVersion)}`,
  );

  if (input.CheckDefaultVersion) {
    CheckDefaultVersion(githubHostedInstalledVersion, input);
  }

  if (input.CheckInstalledVersions) {
    CheckInstalledVersions(githubHostedInstalledVersion);
  }

  debug("Installed Xcode is newest version and required version");
  return;
};

main().catch((e) => {
  if (input.SuccessOnMissing) {
    info("Success on miss is enabled, so this action is success");
    return;
  }
  setFailed(e.message);
  error(e);
});
