import { exec } from "node:child_process";
import { promisify } from "node:util";

export async function getInstalledXcodeVersions(): Promise<
  string[] | undefined
> {
  // Xcode PATH: /Applications/Xcode_${XCODE_VERSION}.app
  const installed: string[] = [];

  // Get versioned Xcode
  // Xcode PATH: /Applications/Xcode_${XCODE_VERSION}.app
  for await (const entry of Deno.readDir("/Applications")) {
    if (entry.name.startsWith("Xcode_")) {
      installed.push(getXcodeVersionFromPath(entry.name));
    }
  }
  return installed;
}

function getXcodeVersionFromPath(absPath: string): string {
  return absPath.replace("Xcode_", "").replace(".app", "");
}

// Get symbolic link Xcode, where is /Applications/Xcode.app
export async function getSymbolicXcodeVersion(): Promise<string> {
  const fileInfo = await Deno.lstat("/Applications/Xcode.app");

  if (fileInfo.isSymlink === false) {
    throw new Error(
      "/Applications/Xcode.app is not symbolic link, fileinfo: " +
        JSON.stringify(fileInfo),
    );
  }

  const realPath = await Deno.realPath("/Applications/Xcode.app");
  return getXcodeVersionFromPath(realPath);
}

const execAsync = promisify(exec);

// Get MacOS version
export async function getMacOSVersion(): Promise<string> {
  // execute sw_vers -productVersion
  try {
    const { stdout, stderr } = await execAsync("sw_vers -productVersion");
    if (stderr) {
      throw new Error(`Failed to get macOS version: ${stderr}`);
    }
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get macOS version: ${error}`);
  }
}
