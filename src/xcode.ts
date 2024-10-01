type Root = {
  xcode: Xcode;
};

type Xcode = {
  default: string;
  x64: X64;
  arm64: Arm64;
};

interface X64 {
  versions: XcodeVersion[];
}

interface Arm64 {
  versions: XcodeVersion[];
}

export type XcodeVersion = {
  link: string;
  version: string;
  symlinks: string[];
  install_runtimes: boolean;
  runtimes: string[];
  sha256: string;
};

export type XcodeVersionsInGitHubHosted = {
  defaultVersion: string;
  versions: XcodeVersion[];
};

export async function GetXcodeVersionsInGitHubHosted(
  macOSVersion: string,
  architecture: "x64" | "arm64",
): Promise<XcodeVersionsInGitHubHosted> {
  const majorVersion = getMacOSMajorVersion(macOSVersion);
  let toolset: Root;
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/actions/runner-images/main/images/macos/toolsets/toolset-${majorVersion}.json`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch toolset JSON: ${response.status} ${response.statusText}`,
      );
    }
    toolset = (await response.json()) as Root;
  } catch (error) {
    throw new Error(`Failed to fetch toolset JSON: ${error}`);
  }

  const defaultVersion = toolset.xcode.default;
  const archData = toolset.xcode[architecture];
  if (!archData) {
    throw new Error(`No data available for architecture: ${architecture}`);
  }
  const versions = archData.versions;
  return { defaultVersion, versions };
}

function getMacOSMajorVersion(macOSVersion: string) {
  return macOSVersion.split(".")[0];
}
