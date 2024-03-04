const express = require('express')
const controller = require('../controllers/index')

function routesApi() {
    const router = express.Router()

    router.get("/server/status", controller.getServerStatus)

    router.get("/server/tes", controller.testExec)

    router.get("/server/average-memory", controller.serverAvgMemory)

    router.get("/server/cpu-util", controller.serverCpuUtil)

    router.get("/server/network-util/receive", controller.getServerNetworkReceive)

    router.get("/server/network-util/transmit", controller.getServerNetworkReceive)

    router.get("/server/disk-util/read", controller.getServerDiskRead)

    router.get("/server/disk-util/write", controller.getServerDiskWrite)

    return router
}

module.exports = routesApi