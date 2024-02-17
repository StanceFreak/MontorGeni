const express = require('express');
const app = express();
const {PORT} = require("../utils/options");
const routesApi = require('./routes/routes-api');

app.use(express.json())
app.use(routesApi)

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