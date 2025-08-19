// @ts-check

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const dirname = __dirname;

const DLITESCRIPT_REPO = path.join(dirname, "..", "dlitescript");
const PLATFORMS = {
  "darwin-x64": { os: "darwin", arch: "amd64" },
  "darwin-arm64": { os: "darwin", arch: "arm64" },
  "linux-x64": { os: "linux", arch: "amd64" },
  "linux-arm": { os: "linux", arch: "arm" },
  "linux-arm64": { os: "linux", arch: "arm64" },
  "win32-x64": { os: "windows", arch: "amd64" },
  "win32-arm": { os: "windows", arch: "arm" },
  "win32-arm64": { os: "windows", arch: "arm64" },
};

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}

function main() {
  console.info("Checking if DLiteScript repository exists");

  if (!fs.existsSync(DLITESCRIPT_REPO)) {
    console.error(`DLiteScript repository not found at: ${DLITESCRIPT_REPO}`);
    process.exit(1);
  }

  console.info("Updating DLiteScript Git submodule");
  execSync("git submodule update --init --recursive", {
    cwd: path.join(dirname, ".."),
  });

  console.info("Checking if Go is installed");

  try {
    execSync("go version");
  } catch (error) {
    console.error("Go executable not found");
    process.exit(1);
  }

  clearResourcesDirectory();

  console.info("Compiling binaries");

  for (const [platformKey] of Object.entries(PLATFORMS)) {
    const [p, a] = platformKey.split("-");

    compileBinary(p, a);
  }

  console.info("All binaries have been compiled");
}

function clearResourcesDirectory() {
  console.info("Clearing old binaries");

  const resourcesDir = path.join(dirname, "..", "resources");

  if (fs.existsSync(resourcesDir)) {
    const files = fs.readdirSync(resourcesDir);

    for (const file of files) {
      if (!file.startsWith("dlitescript-")) {
        continue;
      }

      const filePath = path.join(resourcesDir, file);
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * @param {string} platform
 * @param {string} arch
 */
function compileBinary(platform, arch) {
  const platformKey = `${platform}-${arch}`;
  const platformInfo = PLATFORMS[platformKey];

  if (!platformInfo) {
    console.info(`Skipping unsupported platform: ${platformKey}`);

    return;
  }

  const resourcesDir = path.join(dirname, "..", "resources");
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
  }

  const outputName = `dlitescript-${platformKey}`;
  const binaryPath = path.join(resourcesDir, outputName);

  try {
    const env = {
      ...process.env,
      GOOS: platformInfo.os,
      GOARCH: platformInfo.arch,
      CGO_ENABLED: "0",
    };

    console.info(`Compiling ${outputName}`);

    execSync(`go build -ldflags="-s -w" -o "${binaryPath}"`, {
      cwd: DLITESCRIPT_REPO,
      env: env,
    });

    console.info("Validating binary");
    const fileStats = fs.statSync(binaryPath);

    if (fileStats.size < 1000) {
      console.error(`${outputName} is empty`);
      fs.unlinkSync(binaryPath);

      process.exit(1);
    }

    if (platformInfo.os !== "windows") {
      console.info(`Setting executable permissions for ${outputName}`);
      fs.chmodSync(binaryPath, 0o755);
    }
  } catch (error) {
    console.error(`Could not compile ${outputName}:`, error.message);

    process.exit(1);
  }
}
