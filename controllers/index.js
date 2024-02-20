const serverStatus = require("./controller-status")
const serverAvgMemory = require("./controller-memory")
const serverCpuUtil = require("./controller-cpu-util")

module.exports = {
    serverStatus,
    serverAvgMemory,
    serverCpuUtil
}