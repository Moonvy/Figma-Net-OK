const prompts = require("prompts")
const getBestHosts = require("./lib/getBestHosts")
const sudoCallSetHosts = require("./lib/sudoCallSetHosts")
const chalk = require("chalk")
const os = require("os")

console.clear()
console.log(chalk.gray("\n----------------------------------------------"))
console.log(chalk.green.bold("                  FigmaNetOK             \n"))
console.log(chalk.green("       🐌 Figma 网络最佳线路测试 v2.0 🐙    "))
console.log(chalk.whiteBright("                🌕 Moonvy.com      "))
console.log("    https://github.com/Moonvy/Figma-Net-OK   ")
console.log(chalk.gray("----------------------------------------------\n"))
// console.log("Host 编辑工具：https://swh.app/zh/\n")
console.log(
    chalk.italic(
        "！本工具查找「此时」最佳的 Hosts 配置，具有一定的时效性 \n 当你的网络环境变换或者 Figma 服务器调整，就需要重新测速了\n"
    )
)

console.log(chalk.italic("相关问题，可以加 Figma 微信讨论群：" + chalk.bold("sixichacha")), "\n")
console.log(chalk.gray("----------------------------------------------\n"))
let qs = [
    {
        type: "select",
        name: "selectMode",
        message: "选择测试模式",
        hint: "使用键盘方向键选择一个选项，按回车键确认",
        initial: 2,
        choices: [
            { title: "全面", description: "尝试全部 DNS 服务商", value: "full" },
            { title: "快速", description: "快速测试常用的 DNS 服务商", value: "fast" },
        ],
        initial: 1,
    },
]

prompts(qs).then(async function (re) {
    let bestLest = await getBestHosts(re.selectMode)

    prompts([
        {
            type: "select",
            name: "selectMode",
            message: "是否自动设置 Hosts 文件？",
            hint: "使用键盘方向键选择一个选项，按回车键确认",
            initial: 0,
            choices: [
                { title: "设置 Hosts", description: "通过本程序自动设置 Hosts ", value: "set" },
                { title: "不了", description: "退出。你可以手动去修改 Hosts 文件", value: "exit" },
            ],
        },
    ]).then(async function (re) {
        if (re.selectMode === "set") {
            await sudoCallSetHosts(bestLest)
            let isWindow = os.platform() === "win32"
            if (isWindow) process.stdin.resume()
        } else {
            process.exit(0)
        }
    })
})

// require("./script/test-dns.js")
