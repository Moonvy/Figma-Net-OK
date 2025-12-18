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
    // 开发时：__dirname 是 lib/，node 在上级
    let nodePath = resolve(__dirname, "../node")
    if (fs.existsSync(nodePath)) return nodePath
    nodePath = resolve(__dirname, "../node.exe")
    if (fs.existsSync(nodePath)) return nodePath
    return "node"
}

function sudoCallResetHosts(hosts) {
    let nodePath = getNodePath()
    let scriptPath = getScriptPath("resetHosts.js")

    let cmd = Buffer.from(JSON.stringify(hosts)).toString("base64")

    console.log(chalk.yellow("\n 请求管理员权限 \n "))

    nodePath = nodePath
    scriptPath = resolve(scriptPath)

    let sudoCmd = `"${nodePath}" "${scriptPath}" ${cmd}`
    sudo.exec(sudoCmd, { name: "FigmaNetOK" }, function (error, stdout, stderr) {
        if (error) {
            if (error.message.indexOf("EPERM") > -1) {
                let isMac = os.platform() === "darwin"
                if (isMac) {
                    console.error(
                        chalk.red(`\n 无法获取权限，可以尝试手动复制以下命令在「终端」粘贴后中执行：\n\n`),
                        chalk.blue.green("sudo " + sudoCmd),
                        "\n\n"
                    )
                } else {
                    console.error(chalk.red("\n 无法获取权限，请手动修改 Hosts 文件 \n "))
                }
            }
            console.error(error)
            console.error(chalk.red("\n 无法获取权限，请手动修改 Hosts 文件 \n "), error.message)
        }
        console.log(stdout)
    })
}
module.exports = sudoCallResetHosts
