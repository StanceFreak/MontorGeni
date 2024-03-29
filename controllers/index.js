const {getServerStatus, testExec} = require("./controller-status")
const serverAvgMemory = require("./controller-memory")
const serverCpuUtil = require("./controller-cpu-util")
const {getServerNetworkReceive, getServerNetworkTransmit} = require("./controller-network-io")
const {getServerDiskWrite, getServerDiskRead} = require("./controller-disk-rw")
const {getNetworkPacketLoss, getNetworkLatency} = require("./controller-network-performance")

module.exports = {
    getServerStatus,
    testExec,
    serverAvgMemory,
    serverCpuUtil,
    getServerNetworkReceive,
    getServerNetworkTransmit,
    getServerDiskRead,
    getServerDiskWrite,
    getNetworkPacketLoss,
    getNetworkLatency
}