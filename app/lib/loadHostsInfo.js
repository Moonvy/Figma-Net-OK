const fs = require("fs")
const os = require("os")
const path = require("path")

/**
 * 获取系统 hosts 文件路径
 * @returns {string} hosts 文件路径
 */
function getHostsPath() {
    if (os.platform() === "win32") {
        return path.join(process.env.SystemRoot || "C:\\Windows", "System32", "drivers", "etc", "hosts")
    }
    return "/etc/hosts"
}

/**
 * 解析 hosts 文件内容
 * @param {string} content hosts 文件内容
 * @returns {Array<{ip: string, hostname: string, line: number, raw: string}>} 解析后的条目
 */
function parseHostsContent(content) {
    const lines = content.split(/\r?\n/)
    const entries = []

    lines.forEach((line, index) => {
        // 去除注释和空白
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) {
            return
        }

        // 解析 IP 和主机名
        const parts = trimmed.split(/\s+/)
        if (parts.length >= 2) {
            const ip = parts[0]
            // 一行可能有多个主机名
            for (let i = 1; i < parts.length; i++) {
                const hostname = parts[i]
                // 遇到注释就停止
                if (hostname.startsWith("#")) break
                entries.push({
                    ip,
                    hostname,
                    line: index + 1,
                    raw: line,
                })
            }
        }
    })

    return entries
}

/**
 * 读取并检查系统 hosts 文件中的 Figma 相关配置
 * @returns {{
 *   hostsPath: string,
 *   figmaEntries: Array<{ip: string, hostname: string, line: number, raw: string}>,
 *   hasFigmaConfig: boolean,
 *   error: string | null
 * }}
 */
function loadHostsInfo() {
    const hostsPath = getHostsPath()
    const result = {
        hostsPath,
        figmaEntries: [],
        hasFigmaConfig: false,
        error: null,
    }

    try {
        const content = fs.readFileSync(hostsPath, "utf-8")
        const allEntries = parseHostsContent(content)

        // 过滤 Figma 相关条目 (域名包含 figma)
        result.figmaEntries = allEntries.filter((entry) => 
            entry.hostname.toLowerCase().includes("figma")
        )
        result.hasFigmaConfig = result.figmaEntries.length > 0
    } catch (err) {
        result.error = err.message
    }

    return result
}

module.exports = loadHostsInfo
module.exports.getHostsPath = getHostsPath
module.exports.parseHostsContent = parseHostsContent