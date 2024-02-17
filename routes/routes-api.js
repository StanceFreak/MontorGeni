const express = require('express')
const controller = require("../controllers/index")

function routesApi() {
    const router = express.Router()

    router.put("/server/status", controller.serverStatus)
}

module.exports = routesApi