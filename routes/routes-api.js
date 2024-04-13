const express = require('express')
const controller = require('../controllers/index')

function routesApi() {
    const router = express.Router()

    router.get("/server/status", controller.getServerStatus)

    router.post("/server/change-status", controller.postServerStatus)

    router.get("/server/average-memory", controller.serverAvgMemory)

    router.get("/server/cpu-util/record", controller.getServerCpuUtilRecord)

    router.get("/server/cpu-util", controller.getServerCpuUtil)

    router.get("/server/network-util", controller.getServerNetworkIo)

    router.get("/server/network-util/total", controller.getServerNetworkRt)

    router.get("/server/disk-util", controller.getServerDiskUtil)

    router.get("/server/disk-util/total", controller.getServerDiskRw)

    router.get("/server/network/performance/packet-loss", controller.getNetworkPacketLoss)

    router.get("/server/network/performance/latency", controller.getNetworkLatency)

    return router
}

module.exports = routesApi