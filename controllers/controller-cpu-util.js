const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function getServerCpuUtil(req, res, next) {
    try {
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(
                // get data from db with interval of hours, minutes, seconds
                `SELECT * FROM cpu_util WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${req.body.interval})`,
                // get data from db with interval of days
                // `SELECT * FROM cpu_util WHERE created_at BETWEEN CURDATE() - INTERVAL 2 DAY AND CURDATE() - INTERVAL 1 SECOND`,
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

module.exports = getServerCpuUtil