const express = require('express');
const path = require('path');
const app = express();
const {PORT} = require("./utils/options");
const routesApi = require('./routes/routes-api');
const scrapers = require('./scrapers/scrapers-api');
const schedule = require('node-schedule');
const scraperNotif = require('./scrapers/scrapers-notification')

app.use(express.json())
app.use(routesApi())

app.get("/", (req, res) => {
    res.status(200).send({
        date: new Date().toLocaleString(),
        message: "Server is running"
    })
})

app.use("/records", express.static(path.join(__dirname, "./file/")))

app.use((req, res, next) => {
    res.status(404)
    next(Error(`There is no endpoint such as ${req.url} and method ${req.method}`))
})

app.use((error, req, res, next) => {
    const status = res.statusCode || 500
    res.status(status).json({
        error: error.message,
        stack: error.stack
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})
schedule.scheduleJob(`* * * * 0-6`, async () => {
    await scrapers.storeNetLatency(1),
    await scrapers.storeMemUtils(1),
    await scrapers.storeCpuUtils(1)
    await scraperNotif.getCpuAlert(),
    await scraperNotif.getMemoryAlert(),
    await scraperNotif.getServiceAlert(),
    await scraperNotif.getLatencyAlert()
})

schedule.scheduleJob(`*/30 * * * 0-6`, async () => {
    await scraperNotif.getDiskAlert()
})