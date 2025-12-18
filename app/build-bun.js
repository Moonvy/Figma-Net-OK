import { rmSync, mkdirSync } from "fs";
import { $ } from "bun";

// 清空 dist 目录
const distDir = "./dist";
const outputDir = "../dist";

rmSync(distDir, { recursive: true, force: true });
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

// 定义目标平台
const targets = [
    { name: "macos-x64", target: "bun-darwin-x64" },
    { name: "windows-x64", target: "bun-windows-x64" },
];

// 使用 Bun 打包成二进制文件
for (const { name, target } of targets) {
    const isWindows = name.startsWith("windows");
    const outputPath = `${outputDir}/${name}/FigmaNetOK${isWindows ? ".exe" : ""}`;
    
    console.log(`\n📦 Building for ${name}...`);
    
    try {
        await $`bun build ./index.js --compile --target=${target} --outfile=${outputPath} --minify`;
        console.log(`✅ Built: ${outputPath}`);
        
        // 对 Windows 可执行文件使用 UPX 压缩
        if (isWindows) {
            console.log(`🗜️  Compressing ${name} with UPX...`);
            try {
                await $`upx --best --lzma ${outputPath}`;
                console.log(`✅ Compressed: ${outputPath}`);
            } catch (upxError) {
                console.warn(`⚠️  UPX compression failed (make sure UPX is installed): ${upxError.message}`);
            }
        }
    } catch (error) {
        console.error(`❌ Failed to build for ${name}:`, error.message);
    }
}

console.log("\n🎉 Build completed!");
