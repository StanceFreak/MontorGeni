const {getServerStatus, postServerStatus} = require("./controller-status")
const {getServerAvgMemory, getServerMemUtilRecord} = require("./controller-memory")
const {getServerCpuUtilRecord, getServerCpuUtil} = require("./controller-cpu-util")
const {getServerNetworkIo, getServerNetworkRt} = require("./controller-network-io")
const {getServerDiskUtil, getServerDiskRw, getServerDiskUsage} = require("./controller-disk-rw")
const {getNetworkPacketLoss, getNetworkLatencyRecord} = require("./controller-network-performance")
const getNotifRecord = require("./controller-notif")

module.exports = {
    getServerStatus,
    postServerStatus,
    getServerAvgMemory,
    getServerMemUtilRecord,
    getServerCpuUtilRecord,
    getServerCpuUtil,
    getServerNetworkIo,
    getServerNetworkRt,
    getServerDiskUtil,
    getServerDiskRw,
    getServerDiskUsage,
    getNetworkPacketLoss,
    getNetworkLatencyRecord,
    getNotifRecord
}