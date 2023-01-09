const hostile = require("hostile")
const chalk = require("chalk")
const { promisify } = require("util")

/**
 * 重置 hosts
 * @param {string[]} hosts
 */
async function resetHosts(hosts) {
    console.log("Hosts 文件位置 :", chalk.greenBright(hostile.HOSTS))
    let removeHost = await promisify(hostile.remove)
    let getHost = await promisify(hostile.get)

    try {
        for (const host of hosts) {
            await remove(host)
        }
        console.log(chalk.green("重置完成"))
    } catch (e) {
        if (e.message.includes("EACCES")) {
            console.error(chalk.yellow("没有权限。修改 Hosts 需要管理员权限，请以管理员权限运行本程序"))
        }
    }

    async function remove(host) {
        var lines = await getHost(false)
        for (const item of lines) {
            if (item[1] === host) {
                await removeHost(item[0], host)
                console.log("清除", chalk.greenBright(`${host} (${item[0]})`))
            }
        }
    }
}


let cmd = process.argv[2]

try {
    let hosts = JSON.parse(Buffer.from(cmd, "base64").toString())
    resetHosts(hosts)
} catch (e) {
    console.error(chalk.yellow("调用 resetHosts 参数错误。"), process.argv, e)
}


module.exports = resetHosts