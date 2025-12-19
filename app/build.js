import { rmSync, mkdirSync, readFileSync } from "fs";
import { build } from "esbuild";

// 读取 package.json 中的版本号
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const VERSION = pkg.version;

console.log(`Building version: ${VERSION}`);

// 清空 dist 目录
const distDir = "./dist";
const outputDir = "../dist";

rmSync(distDir, { recursive: true, force: true });
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

// 打包主入口
await build({
    entryPoints: ["./index.js"],
    outfile: "./dist/index.js",
    bundle: true,
    platform: "node",
    target: "node12",
    format: "cjs",
    minify: true,
    inject: ["./shims/performance.js"],
    define: {
        __VERSION__: JSON.stringify(VERSION),
    },
});

// 打包需要单独调用的脚本（用于 sudo 提权执行）
// 输出到 dist/lib 目录，保持与源码目录结构一致
await build({
    entryPoints: ["./lib/setHosts.js", "./lib/resetHosts.js"],
    outdir: "./dist/lib",
    bundle: true,
    platform: "node",
    target: "node12",
    format: "cjs",
    minify: true,
    inject: ["./shims/performance.js"],
});

console.log("Build completed!");
