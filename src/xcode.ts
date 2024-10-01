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
  if (!isValidArchitecture(architecture)) {
    throw new Error(`Invalid architecture: ${architecture}`);
  }

  const majorVersion = getMacOSMajorVersion(macOSVersion);
  const toolsetJson = await fetch(
    `https://raw.githubusercontent.com/actions/runner-images/refs/heads/main/images/macos/toolsets/toolset-${majorVersion}.json`,
  ).catch((error) => {
    throw new Error(`Failed to fetch toolset json: ${error}`);
  });
  const toolset = await toolsetJson.json() as Root;

  const defaultVersion = toolset.xcode.default;
  const versions = toolset.xcode[architecture].versions;
  return { defaultVersion, versions };
}

function getMacOSMajorVersion(macOSVersion: string) {
  return macOSVersion.split(".")[0];
}

function isValidArchitecture(architecture: string) {
  return ["x64", "arm64"].includes(architecture);
}
