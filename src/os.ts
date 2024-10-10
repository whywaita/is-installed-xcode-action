import { debug } from "npm:@actions/core@1.10.1";
import { basename } from "https://deno.land/std@0.182.0/path/mod.ts";
import { exec } from "node:child_process";
import process from "node:process";
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

  const p = await Deno.realPath("/Applications/Xcode.app");
  return getXcodeVersionFromPath(basename(p));
}

export type Platform = {
  version: string;
  arch: "x64" | "arm64";
};

// Get Platform
export async function getPlatform(): Promise<Platform> {
  const platform: string = Deno.build.os;
  if (platform !== "darwin") {
    throw new Error(`This action is only supported on macOS: ${platform}`);
  }
  const rawArch: string = process.arch;
  const arch = ConvertArchitectures(rawArch);

  const version: string = await getMacOSVersion();
  debug(`macOS version: ${version}`);
  debug(`architecture: ${arch}`);

  return {
    version: version,
    arch: arch,
  };
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

export function ConvertArchitectures(architecture: string): "x64" | "arm64" {
  switch (architecture) {
    case "x86_64": {
      return "x64";
    }
    case "x64": {
      return "x64";
    }
    case "aarch64": {
      return "arm64";
    }
    case "arm64": {
      return "arm64";
    }
    default:
      throw new Error(`Invalid architecture: ${architecture}`);
  }
}
