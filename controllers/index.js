const {getServerStatus, postServerStatus} = require("./controller-status")
const serverAvgMemory = require("./controller-memory")
const {getServerCpuUtilRecord, getServerCpuUtil} = require("./controller-cpu-util")
const {getServerNetworkIo, getServerNetworkRt} = require("./controller-network-io")
const {getServerDiskUtil, getServerDiskRw} = require("./controller-disk-rw")
const {getNetworkPacketLoss, getNetworkLatency} = require("./controller-network-performance")

module.exports = {
    getServerStatus,
    postServerStatus,
    serverAvgMemory,
    getServerCpuUtilRecord,
    getServerCpuUtil,
    getServerNetworkIo,
    getServerNetworkRt,
    getServerDiskUtil,
    getServerDiskRw,
    getNetworkPacketLoss,
    getNetworkLatency
}