var sudo = require("sudo-prompt")
var os = require("os")
var fs = require("fs")
const chalk = require("chalk")
const { resolve } = require("path")

function sudoCallResetHosts(hosts) {
    let nodePath
    let scriptPath = __dirname + "/resetHosts.js"

    nodePath = resolve(__dirname + "/../node")
    if (!fs.existsSync(nodePath)) {
        nodePath = resolve(__dirname + "/../node.exe")
        if (!fs.existsSync(nodePath)) {
            nodePath = "node"
        }
    }

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
