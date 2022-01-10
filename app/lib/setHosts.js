const hostile = require("hostile")
const chalk = require("chalk")
const { promisify } = require("util")

async function setHosts(hosts) {
    console.log("Hosts 文件位置 :", chalk.greenBright(hostile.HOSTS))

    let setHost = await promisify(hostile.set)
    let removeHost = await promisify(hostile.remove)

    try {
        for (const host of hosts) {
            if (host.remove) {
                console.log("清除", chalk.greenBright(host.ip))
                await removeHost(host.ip)
            } else {
                console.log("设置", chalk.greenBright(host.ip), host.hostname)
                await setHost(host.ip, host.hostname)
            }
        }
        console.log("设置完成")
    } catch (e) {
        if (e.message.includes("EACCES")) {
            console.error(chalk.yellow("没有权限。修改 Hosts 需要管理员权限，请以管理员权限运行本程序"))
        }
    }
}

// console.log(process.argv)
let cmd = process.argv[2]

try {
    let hosts = JSON.parse(Buffer.from(cmd, "base64").toString())
    setHosts(hosts)
} catch (e) {
    console.error(chalk.yellow("调用 setHosts 参数错误。"), process.argv, e)
}

// setHosts([{ ip: "127.0.0.1", hostname: "peercdn.com" }])

module.exports = setHosts
