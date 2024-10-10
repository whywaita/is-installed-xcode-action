import { debug, info, setFailed, warning } from "npm:@actions/core@1.10.1";
import { XcodeVersionsInGitHubHosted } from "./xcode.ts";
import { Input } from "./input.ts";
import { getSymbolicXcodeVersion } from "./os.ts";

export async function CheckDefaultVersion(
    githubInstalled: XcodeVersionsInGitHubHosted,
    input: Input,
): Promise<void> {
    // 1. Check installed Xcode is default version
    // And "/Applications/Xcode.app" is symbolic link to default version
    debug(`Default version: ${githubInstalled.defaultVersion}`);
    const isInstalledDefaultVersion: boolean =
        await isApplicationXcodeIsDefaultVersion(
            githubInstalled.defaultVersion,
        );
    if (isInstalledDefaultVersion === false) {
        const symbolicVersion: string = await getSymbolicXcodeVersion();
        warning("Installed Xcode is not the default version");
        warning(`Installed Xcode: ${symbolicVersion}`);
        warning(
            `Default Xcode: ${githubInstalled.defaultVersion}`,
        );
        if (input.SuccessOnMissing) {
            info("Success on miss is enabled, so this action is success");
            return;
        }
        setFailed("Installed Xcode is not the default version");
        return;
    }
    return;
}

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
