const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function getServerAvgMemory(req, res, next) {
    try {
        // get root endpoint from options.js file and merge it with the additional /query for api calls
        const url = `${ROOT_URL}/query`
        // create new object for storing the object values from api response
        const objValues = {}
        // http request using axios library with query params for the api calls to prometheus api
        const avgMemTotal = await axios.get(url, {params: {query: 'avg_over_time(node_memory_MemTotal_bytes[1m])'}})
        avgMemTotal.data.data.result.map((data) => {
            const calc = parseFloat(data.value[1]).toFixed(1)
            pool.getConnection(function (err, conn) {
                if (err) throw err
                conn.query(
                    'select * from mem_util order by id desc limit 1;',
                    function (error, results) {
                        if (error) throw error
                        const memAvail = (calc * (1 - (results[0].value/100)))
                        return res.status(200).json({
                            status: 200,
                            message: "success",
                            data: {
                                memoryUsage: results[0].value,
                                memoryTotal: calc,
                                memoryAvailable: memAvail,
                                time: results[0].time
                            }
                        })
                    }
                )
                conn.release()
            })
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getServerMemUtilRecord(req, res, next) {
    try {
        var query = ''
        if (req.query.interval.includes('1')) {
            query = `SELECT * FROM mem_util WHERE created_at BETWEEN CURDATE() - INTERVAL 1 DAY AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM mem_util WHERE created_at >= CURDATE()`
        }
        else {
            query = `SELECT * FROM mem_util WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} day AND CURDATE() - INTERVAL ${req.query.interval - 1} day`
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(
                query,
                function (error, results) {
                    if (error) throw error
                    res.status(200).json(
                        {
                            status: 200,
                            message: "success",
                            data: results
                        }
                    )
                }
            )
            conn.release()
        })
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

module.exports = {
    getServerAvgMemory,
    getServerMemUtilRecord
}