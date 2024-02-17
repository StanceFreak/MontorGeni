const express = require('express')
const controller = require("../controllers/index")

function routesApi() {
    const router = express.Router()

    router.put("/server/status", controller.serverStatus)

    return router
}

module.exports = routesApi