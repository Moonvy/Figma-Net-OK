const prompts = require("prompts")
const getBestHosts = require("./lib/getBestHosts")
const sudoCallResetHosts = require("./lib/sudoCallResetHosts")
const sudoCallSetHosts = require("./lib/sudoCallSetHosts")
const loadHostsInfo = require("./lib/loadHostsInfo")
const chalk = require("chalk")
const os = require("os")

// 解析命令行参数
const args = process.argv.slice(2)
const hasArg = (flags) => args.some((arg) => flags.includes(arg))

const isChangeMode = hasArg(["--change", "-C"])
const isChangeAllMode = hasArg(["--change-all", "-CA"])
const isResetMode = hasArg(["--reset", "-R"])
const isHelpMode = hasArg(["--help", "-h"])

// 显示帮助信息
function showHelp() {
    console.log(chalk.green.bold("\n  FigmaNetOK - 命令行参数说明\n"))
    console.log(chalk.white("  用法: figma-net-ok [选项]\n"))
    console.log(chalk.yellow("  选项:"))
    console.log(chalk.gray("    --change, -C      ") + "运行快速测试，并自动设置 hosts")
    console.log(chalk.gray("    --change-all, -CA ") + "运行全部测试，并自动设置 hosts")
    console.log(chalk.gray("    --reset, -R       ") + "重置 hosts（清除 Figma 相关配置）")
    console.log(chalk.gray("    --help, -h        ") + "显示此帮助信息")
    console.log(chalk.gray("\n  不带参数运行时进入交互模式\n"))
}

// 快速模式：测试并设置 hosts
async function runChangeMode(mode) {
    console.log(chalk.green.bold("\n  FigmaNetOK - 自动模式\n"))
    console.log(chalk.blue(` · 测试模式: ${mode === "fast" ? "快速" : "全面"}`))
    console.log(chalk.gray("----------------------------------------------\n"))

    let bestList = await getBestHosts(mode)
    if (bestList && bestList.length > 0) {
        console.log(chalk.green("\n · 测试完成，正在设置 hosts...\n"))
        await sudoCallSetHosts(bestList)
        let isWindow = os.platform() === "win32"
        if (isWindow) process.stdin.resume()
    } else {
        console.log(chalk.red("\n ✗ 测试失败，未找到可用的 hosts\n"))
        process.exit(1)
    }
}

// 重置模式
async function runResetMode() {
    console.log(chalk.green.bold("\n  FigmaNetOK - 重置模式\n"))
    console.log(chalk.yellow(" · 正在重置 Figma hosts 配置..."))
    console.log(chalk.gray("----------------------------------------------\n"))

    await sudoCallResetHosts(["s3-alpha-sig.figma.com", "www.figma.com", "static.figma.com"])
    let isWindow = os.platform() === "win32"
    if (isWindow) process.stdin.resume()
}

// 命令行参数模式
if (isHelpMode) {
    showHelp()
    process.exit(0)
} else if (isChangeMode) {
    runChangeMode("fast")
} else if (isChangeAllMode) {
    runChangeMode("full")
} else if (isResetMode) {
    runResetMode()
} else {
    // 交互模式
    console.clear()

    console.log(chalk.green.bold("                  FigmaNetOK             \n"))
    console.log(chalk.green("       🐌 Figma 网络最佳线路测试 v2.3.0 🐙    "))
    console.log(chalk.whiteBright("                🌕 Moonvy.com      "))
    console.log("    https://github.com/Moonvy/Figma-Net-OK   ")
    console.log(chalk.gray("----------------------------------------------\n"))

    // console.log("Host 编辑工具：https://swh.app/zh/\n")

    console.log(
        chalk.bgYellow.black(" ! "),
        `本工具适用于${chalk.yellow("不使用网络代理工具")}，${chalk.green("直连")} Figma 的场合 \n`,
        `   如果你在使用网络代理，就不适合使用本工具\n`
    )
    console.log(
        chalk.bgYellow.black(" ! "),
        `本工具查找${chalk.yellow("此时最佳")}的服务器地址，具有一定的时效性 \n`,
        `   当你的网络环境变换或者 Figma 服务器调整，就需要重新测速了\n`
    )

    // 检查当前 Figma hosts 配置
    const hostsInfo = loadHostsInfo()
    if (hostsInfo.error) {
        console.log(chalk.bgRed.white(" ✗ "), `读取 hosts 文件失败: ${hostsInfo.error}\n`)
    } else if (hostsInfo.hasFigmaConfig) {
        console.log(chalk.bgGreen.black(" ✓ "), `检测到已有 Figma hosts 配置 (${hostsInfo.figmaEntries.length} 条):\n`)
        hostsInfo.figmaEntries.forEach((entry) => {
            console.log(chalk.gray(`     ${entry.ip.padEnd(18)} ${chalk.cyan(entry.hostname)}`))
        })
        console.log()
    } else {
        console.log(chalk.bgBlue.white(" i "), `当前 hosts 中没有 Figma 相关配置\n`)
    }

    console.log(chalk.green(" · "), "相关问题，可以加 Figma 微信讨论群：" + chalk.bold("sixichacha"))

    console.log(chalk.gray("----------------------------------------------\n"))
    let qs = [
        {
            type: "select",
            name: "selectMode",
            message: "选择测试模式",
            hint: "使用键盘方向键选择一个选项，按回车键确认",
            choices: [
                { title: "全面", description: "尝试全部 DNS 服务商", value: "full" },
                { title: "快速", description: "快速测试常用的 DNS 服务商", value: "fast" },
                { title: "重置", description: "清除 Hosts 中的 Figma 配置", value: "reset" },
            ],
            initial: 1,
        },
    ]

    prompts(qs).then(async function (re) {
        if (re.selectMode === "reset") {
            await sudoCallResetHosts(["s3-alpha-sig.figma.com", "www.figma.com", "static.figma.com"])
            let isWindow = os.platform() === "win32"
            if (isWindow) process.stdin.resume()
        } else {
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
        }
    })
}

// require("./script/test-dns.js")
