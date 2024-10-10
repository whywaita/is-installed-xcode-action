import { debug, getInput, warning } from "npm:@actions/core@1.10.1";

export type Input = {
  SuccessOnMissing: boolean;

  CheckDefaultVersion: boolean;
  CheckInstalledVersions: boolean;

  OverrideXcodeVersion?: string;
};

export function getInputGHA(): Input {
  const isSuccessOnMiss: boolean = getInput("success-on-miss") === "true";
  const input: Input = {
    SuccessOnMissing: isSuccessOnMiss,
    CheckDefaultVersion: false,
    CheckInstalledVersions: false,
  };

  const inputCheck: string = getInput("check-target");
  let no_check = true;
  if (inputCheck === "all") {
    input.CheckDefaultVersion = true;
    input.CheckInstalledVersions = true;
    no_check = false;
  } else {
    // inputCheck separated by comma
    const checks: string[] = inputCheck.split(",");
    for (const check of checks) {
      switch (check) {
        case "default-version":
          input.CheckDefaultVersion = true;
          no_check = false;
          break;
        case "installed-versions":
          input.CheckInstalledVersions = true;
          no_check = false;
          break;
        default:
          warning(`Unknown check target: ${check}`);
          break;
      }
    }
  }

  if (no_check) {
    throw new Error("No check target is specified");
  }

  const inputOverrideDefaultVersion: string = getInput(
    "override-default-version",
  );
  if (inputOverrideDefaultVersion !== "") {
    input.OverrideXcodeVersion = inputOverrideDefaultVersion;

    if (!input.CheckDefaultVersion) {
      warning(
        "Override default version is specified, but check default version is disabled",
      );
    }
  } else {
    input.OverrideXcodeVersion = undefined;
  }

  debug(`input: ${JSON.stringify(input)}`);
  return input;
}
