import { debug, warning } from "npm:@actions/core@1.10.1";
import { XcodeVersionsInGitHubHosted } from "./xcode.ts";
import { Input } from "./input.ts";
import { getSymbolicXcodeVersion } from "./os.ts";

export async function CheckDefaultVersion(
    githubInstalled: XcodeVersionsInGitHubHosted,
    input: Input,
): Promise<void> {
    // 1. Check installed Xcode is default version
    // And "/Applications/Xcode.app" is symbolic link to default version
    const defaultVersion: string = input.OverrideXcodeVersion ||
        githubInstalled.defaultVersion;

    debug(`Default version: ${defaultVersion}`);
    const isInstalledDefaultVersion: boolean =
        await isApplicationXcodeIsDefaultVersion(
            defaultVersion,
        );
    if (isInstalledDefaultVersion === false) {
        const symbolicVersion: string = await getSymbolicXcodeVersion();
        warning("Installed Xcode is not the default version");
        warning(`Installed Xcode: ${symbolicVersion}`);
        warning(
            `Default Xcode: ${defaultVersion}`,
        );
        throw new Error(
            `Installed Xcode is not the default version. Installed: ${symbolicVersion}, Default: ${defaultVersion}`,
        );
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
