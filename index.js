const express = require('express');
const app = express();
const {PORT} = require("./utils/options");
const routesApi = require('./routes/routes-api');
const scrapers = require('./scrapers/scrapers-api');

app.use(express.json())
app.use(routesApi())

app.get("/", (req, res) => {
    res.status(200).send({
        date: new Date().toLocaleString(),
        message: "Server is running"
    })
})

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

scrapeInterval(scrapers.storeCpuUtils, 60)
scrapeInterval(scrapers.storeMemUtils, 60)
scrapeInterval(scrapers.storeNetLatency, 10)

function scrapeInterval(scrape, seconds) {
    let d = new Date()
    let epoch = d.getTime() / 1000

    let secLastTrigger = epoch % 60
    let secNextTrigger = 60 - secLastTrigger
    setTimeout(() => {
        setInterval(scrape, seconds*1000)
        scrape
    }, secNextTrigger*1000);
}