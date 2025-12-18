const { testUrl, testUrlNative } = require("./testUrl")
const axios = require("axios")

/** 测速多个 ip */
module.exports = async function reacIps(url, ips, { concurrency = 10, timeout = 5500, trials = 3 } = {}) {
    const uniqueIps = Array.from(new Set(ips))
    if (!uniqueIps.length) {
        return { ip: null, time: null, ipInfo: "无可用服务器" }
    }

    const shuffledIps = shuffle(uniqueIps)
    spinner.start(`🐌 对 ${shuffledIps.length} 个服务器进行并行测速... `)

    const total = shuffledIps.length
    let completed = 0
    const tasks = shuffledIps.map((ip) => async () => {
        const times = []
        for (let i = 0; i < trials; i += 1) {
            times.push(await testUrlNative(url, ip, timeout))
        }

        const time = averageFinite(times)
        completed += 1
        spinner.start(`🐌 [${completed}/${total}] ${ip}  \t ${Math.round(time)}ms`)
        return { ip, time }
    })

    const results = await runWithConcurrency(tasks, concurrency)
    const bestIp = results
        .filter((x) => Number.isFinite(x.time))
        .reduce((best, cur) => (!best || cur.time < best.time ? cur : best), null)

    if (!bestIp || !bestIp.ip) {
        return { ip: null, time: null, ipInfo: "无可用服务器" }
    }

    bestIp.ipInfo = await getIpInfo(bestIp.ip)
    return bestIp
}

function shuffle(arr) {
    const res = arr.slice()
    for (let i = res.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[res[i], res[j]] = [res[j], res[i]]
    }
    return res
}

function averageFinite(arr) {
    const finite = arr.filter((x) => Number.isFinite(x))
    if (!finite.length) return Infinity
    const sum = finite.reduce((s, v) => s + v, 0)
    return sum / finite.length
}

async function runWithConcurrency(tasks, concurrency) {
    const results = []
    let index = 0

    const worker = async () => {
        while (index < tasks.length) {
            const current = tasks[index]
            index += 1
            results.push(await current())
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker)
    await Promise.all(workers)
    return results
}

async function getIpInfo(ip) {
    try {
        let re = await axios.get(`https://api.ip.sb/geoip/${ip}`, {
            timeout: 2000,
        })
        let data = re.data
        return translateLocation(data?.country, data?.city)
    } catch (e) {
        // console.error("ipInfo", e, e.response?.data)
        return `未知地区`
    }
}

// -----------
// 常见国家/地区英文名转中文映射表
const countryMap = {
    "United States": "美国",
    USA: "美国",
    China: "中国",
    "Hong Kong": "香港",
    Taiwan: "台湾",
    Japan: "日本",
    "South Korea": "韩国",
    Korea: "韩国",
    Singapore: "新加坡",
    Germany: "德国",
    France: "法国",
    "United Kingdom": "英国",
    UK: "英国",
    Netherlands: "荷兰",
    Australia: "澳大利亚",
    Canada: "加拿大",
    Russia: "俄罗斯",
    India: "印度",
    Brazil: "巴西",
    Ireland: "爱尔兰",
    Sweden: "瑞典",
    Finland: "芬兰",
    Norway: "挪威",
    Denmark: "丹麦",
    Switzerland: "瑞士",
    Italy: "意大利",
    Spain: "西班牙",
    Poland: "波兰",
    Belgium: "比利时",
    Austria: "奥地利",
    "Czech Republic": "捷克",
    Romania: "罗马尼亚",
    Hungary: "匈牙利",
    Ukraine: "乌克兰",
    Turkey: "土耳其",
    Israel: "以色列",
    Thailand: "泰国",
    Vietnam: "越南",
    Malaysia: "马来西亚",
    Indonesia: "印度尼西亚",
    Philippines: "菲律宾",
    "New Zealand": "新西兰",
    "South Africa": "南非",
    Mexico: "墨西哥",
    Argentina: "阿根廷",
    Chile: "智利",
    Colombia: "哥伦比亚",
}

// 常见城市英文名转中文映射表
const cityMap = {
    Beijing: "北京",
    Shanghai: "上海",
    Guangzhou: "广州",
    Shenzhen: "深圳",
    Hangzhou: "杭州",
    Tokyo: "东京",
    Osaka: "大阪",
    Seoul: "首尔",
    Busan: "釜山",
    London: "伦敦",
    Paris: "巴黎",
    Berlin: "柏林",
    Frankfurt: "法兰克福",
    Amsterdam: "阿姆斯特丹",
    Sydney: "悉尼",
    Melbourne: "墨尔本",
    Toronto: "多伦多",
    Vancouver: "温哥华",
    Moscow: "莫斯科",
    Mumbai: "孟买",
    "New Delhi": "新德里",
    Bangkok: "曼谷",
    "Ho Chi Minh City": "胡志明市",
    "Kuala Lumpur": "吉隆坡",
    Jakarta: "雅加达",
    Manila: "马尼拉",
    "Los Angeles": "洛杉矶",
    "San Francisco": "旧金山",
    "New York": "纽约",
    Chicago: "芝加哥",
    Seattle: "西雅图",
    Dallas: "达拉斯",
    Miami: "迈阿密",
    Atlanta: "亚特兰大",
    "San Jose": "圣何塞",
    Phoenix: "凤凰城",
    Denver: "丹佛",
    Boston: "波士顿",
    Washington: "华盛顿",
    Ashburn: "阿什本",
    Dublin: "都柏林",
    Stockholm: "斯德哥尔摩",
    Helsinki: "赫尔辛基",
    Oslo: "奥斯陆",
    Copenhagen: "哥本哈根",
    Zurich: "苏黎世",
    Geneva: "日内瓦",
    Milan: "米兰",
    Rome: "罗马",
    Madrid: "马德里",
    Barcelona: "巴塞罗那",
    Warsaw: "华沙",
    Brussels: "布鲁塞尔",
    Vienna: "维也纳",
    Prague: "布拉格",
    Bucharest: "布加勒斯特",
    Budapest: "布达佩斯",
    Kyiv: "基辅",
    Istanbul: "伊斯坦布尔",
    "Tel Aviv": "特拉维夫",
    "Cape Town": "开普敦",
    Johannesburg: "约翰内斯堡",
    "Mexico City": "墨西哥城",
    "São Paulo": "圣保罗",
    "Sao Paulo": "圣保罗",
    "Rio de Janeiro": "里约热内卢",
    "Buenos Aires": "布宜诺斯艾利斯",
    Santiago: "圣地亚哥",
    Bogotá: "波哥大",
    Bogota: "波哥大",
    Auckland: "奥克兰",
}

function translateLocation(country, city) {
    const cnCountry = countryMap[country] || country || ""
    const cnCity = cityMap[city] || city || ""

    return [cnCountry, cnCity].filter(Boolean).join("/")
}
