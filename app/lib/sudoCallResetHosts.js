const { sudoExecScript } = require("./sudoUtils")

function sudoCallResetHosts(hosts) {
    sudoExecScript("resetHosts.js", hosts)
}

module.exports = sudoCallResetHosts
