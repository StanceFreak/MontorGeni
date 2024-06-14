const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const db = require('../utils/config-db')
const mysql = require('mysql')
const csvWriter = require('csv-writer')
const dateFormat = require('date-and-time')
const pool = mysql.createPool(db)
const fs = require('fs')
const { default: id } = require('date-and-time/locale/id')

pool.on("error", (err) => {
    console.error(err)
})

async function getServerCpuUtilRecord(req, res, next) {
    try {
        var query = ''
        if (req.query.interval.includes('1')) {
            query = `SELECT * FROM cpu_util WHERE created_at BETWEEN CURDATE() - INTERVAL 1 DAY AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM cpu_util WHERE created_at >= CURDATE()`
        }
        else {
            query = `SELECT * FROM cpu_util WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} day AND CURDATE() - INTERVAL ${req.query.interval - 1} day`
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

async function downloadCpuRecords(req, res, next) {
    try {
        var query = ''
        if (req.query.interval.includes('1')) {
            query = `SELECT * FROM cpu_util WHERE created_at BETWEEN CURDATE() - INTERVAL 1 DAY AND CURDATE() - INTERVAL 1 SECOND`
        } else if (req.query.interval.includes('today')) {
            query = `SELECT * FROM cpu_util WHERE created_at >= CURDATE()`
        }
        else {
            query = `SELECT * FROM cpu_util WHERE created_at BETWEEN CURDATE() - INTERVAL ${req.query.interval} day AND CURDATE() - INTERVAL ${req.query.interval - 1} day`
        }
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(
                query,
                function (error, results) {
                    if (error) throw error
                    const date = new Date()
                    const currentTime = dateFormat.format(date, "DDMMYYYY_HHmm")
                    // const currentDate = dateFormat.format(date.toLocaleTimeString('en-GB'), "DDMMYYYY")
                    // const currentTime = dateFormat.format(date.toLocaleDateString('en-GB'), "HHmm")
                    const filePath = `./file/CPU_RECORD_${currentTime}.csv`
                    const csvCreate = csvWriter.createObjectCsvWriter({
                        path: filePath,
                        header: [
                            {id: "id", name: "Id"}, 
                            {id: "value", name: "Value"}, 
                            {id: "time", name: "Time"}, 
                            {id: "created_at", name: "Created At"}, 
                            {id: "date", name: "Date"}
                        ]
                    })
                    try {
                        fs.mkdirSync("./file/", true)
                        csvCreate.writeRecords(results)
                        .then(() => {
                            return res.status(200).json(
                                {
                                    status: 200,
                                    message: "success",
                                    // testing
                                    data: `http://localhost:80/file/CPU_RECORD_${currentTime}.csv`
                                    // prod
                                    // data: `146.190.99.85/records/CPU_RECORD_${currentTime}.csv`
                                }
                            )
                        })
                    } catch (error) {
                        next(res.status(400).json({
                            status: 400,
                            message: "failed to download the file",
                            error: error.message
                        }))
                    }
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
    getServerCpuUtil,
    downloadCpuRecords
}