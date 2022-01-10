var sudo = require("sudo-prompt")
var fs = require("fs")
const chalk = require("chalk")
const { resolve } = require("path")

function sudoCallSetHosts(hosts) {
    let nodePath
    let scriptPath = __dirname + "/setHosts.js"

    nodePath = __dirname + "/../node"
    if (!fs.existsSync(nodePath)) {
        nodePath = __dirname + "/../node.exe"
        if (!fs.existsSync(nodePath)) {
            nodePath = "node"
        }
    }

    let cmd = Buffer.from(JSON.stringify(hosts)).toString("base64")

    console.log(chalk.yellow("\n 请求管理员权限 \n "))

    nodePath = resolve(nodePath)
    scriptPath = resolve(scriptPath)

    sudo.exec(`"${nodePath}" "${scriptPath}" ${cmd}`, { name: "FigmaNetOK" }, function (error, stdout, stderr) {
        if (error) {
            if (error.message.indexOf("EPERM") > -1) {
                console.error(chalk.red("\n 无法获取权限，请手动修改 Hosts 文件 \n "))
            }

            throw error
        }
        console.log(stdout)
    })
}
// sudoCallSetHosts([{ ip: "127.0.0.1", hostname: "peercdn.com" }])
module.exports = sudoCallSetHosts
