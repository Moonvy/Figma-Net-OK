var sudo = require("sudo-prompt")
var os = require("os")
var fs = require("fs")
const chalk = require("chalk")
const { resolve } = require("path")

// 智能获取脚本路径（兼容开发和打包环境）
function getScriptPath(scriptName) {
    // 开发时：__dirname 是 lib/，脚本在同目录
    let scriptPath = resolve(__dirname, scriptName)
    if (fs.existsSync(scriptPath)) {
        return scriptPath
    }
    // 打包后：__dirname 是 res/，脚本在 lib/ 子目录
    scriptPath = resolve(__dirname, "lib", scriptName)
    if (fs.existsSync(scriptPath)) {
        return scriptPath
    }
    // 回退
    return resolve(__dirname, scriptName)
}

// 智能获取 node 可执行文件路径
function getNodePath() {
    const paths = ["./node", "./node.exe", "../node", "../node.exe"]
    for (const p of paths) {
        const nodePath = resolve(__dirname, p)
        if (fs.existsSync(nodePath)) return nodePath
    }
    return "node"
}

// 检测是否在受限目录中运行
function checkRestrictedDir() {
    const isMac = os.platform() === "darwin"
    const isWin = os.platform() === "win32"

    if (isMac) {
        const sandboxPatterns = ["com.tencent.xinWeChat", "com.tencent.qq", "WeChat", "Library/Containers"]
        if (sandboxPatterns.some((p) => __dirname.includes(p))) {
            return "微信/QQ 下载目录"
        }
    } else if (isWin) {
        const tempPatterns = ["\\Temp\\", "\\AppData\\Local\\Temp", "\\Temporary"]
        if (tempPatterns.some((p) => __dirname.includes(p))) {
            return "临时目录（可能是从压缩包直接运行）"
        }
    }
    return null
}

// 处理 sudo 执行错误
function handleSudoError(error, sudoCmd) {
    const isMac = os.platform() === "darwin"
    const restrictedReason = checkRestrictedDir()

    // 先输出原始错误，再显示用户友好提示
    console.error(error)

    if (restrictedReason) {
        console.error(chalk.red(`\n ⚠️  检测到程序在受限目录中运行（${restrictedReason}）\n`))
        console.error(chalk.yellow(" 程序无法在此位置正常获取权限。\n"))
        console.error(chalk.green(" 解决方法：请将整个程序文件夹移动到以下位置后重新运行："))
        console.error(chalk.cyan("   • 桌面 (Desktop)"))
        console.error(chalk.cyan("   • 下载 (Downloads)"))
        console.error(chalk.cyan("   • 或其他普通目录\n"))
    } else if (error.message.includes("EPERM")) {
        if (isMac) {
            console.error(
                chalk.red(`\n 无法获取权限，可以尝试手动复制以下命令在「终端」粘贴后中执行：\n\n`),
                chalk.green("sudo " + sudoCmd),
                "\n\n"
            )
        } else {
            console.error(chalk.red("\n 无法获取权限，请手动修改 Hosts 文件 \n "))
        }
    } else {
        console.error(chalk.red("\n 无法获取权限，请手动修改 Hosts 文件 \n "))
    }
}

// 执行需要管理员权限的脚本
function sudoExecScript(scriptName, data, callback) {
    const nodePath = getNodePath()
    const scriptPath = resolve(getScriptPath(scriptName))
    const cmd = Buffer.from(JSON.stringify(data)).toString("base64")

    console.log(chalk.yellow("\n 请求管理员权限 \n "))

    const sudoCmd = `"${nodePath}" "${scriptPath}" ${cmd}`
    sudo.exec(sudoCmd, { name: "FigmaNetOK" }, function (error, stdout, stderr) {
        if (error) {
            handleSudoError(error, sudoCmd)
        }
        console.log(stdout)
        if (callback) callback(error, stdout, stderr)
    })
}

module.exports = {
    getScriptPath,
    getNodePath,
    checkRestrictedDir,
    handleSudoError,
    sudoExecScript,
}
