import { debug, getInput, warning } from "npm:@actions/core@1.10.1";

export type Input = {
    SuccessOnMissing: boolean;

    CheckDefaultVersion: boolean;
    CheckInstalledVersions: boolean;
};

export function getInputGHA(): Input {
    const isSuccessOnMiss: boolean = getInput("success-on-miss") === "true";
    const input: Input = {
        SuccessOnMissing: isSuccessOnMiss,
        CheckDefaultVersion: false,
        CheckInstalledVersions: false,
    };

    const inputCheck: string = getInput("check-target");
    if (inputCheck === "all") {
        input.CheckDefaultVersion = true;
        input.CheckInstalledVersions = true;
        debug(`input: ${JSON.stringify(input)}`);
        return input;
    }

    // inputCheck separated by comma
    const checks: string[] = inputCheck.split(",");
    let no_check = true;
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

    if (no_check) {
        throw new Error("No check target is specified");
    }

    debug(`input: ${JSON.stringify(input)}`);
    return input;
}
