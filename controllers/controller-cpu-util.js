const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function getServerCpuUtilRecord(req, res, next) {
    try {
        var query = ''
        console.log(req.query.interval)
        if (req.query.interval.includes(' day')) {
            query = `SELECT * FROM cpu_util WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM cpu_util WHERE created_at >= CURDATE()`
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

async function getServerCpuUtil(req, res, next) {
    try {
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(
                'select * from cpu_util order by id desc limit 1;',
                function (error, results) {
                    if (error) throw error
                    return res.status(200).json({
                        status: 200,
                        message: "success",
                        data: {
                            value: results[0].value,
                            time: results[0].time
                        }
                    })
                }
            )
            conn.release()
        })
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = {
    getServerCpuUtilRecord,
    getServerCpuUtil
}