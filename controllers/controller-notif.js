const db = require('../utils/config-db')
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on("error", (err) => {
    console.error(err)
})

async function registerDevice(req, res, next) {
    try {
        if (req.body.token) {
            pool.getConnection(function (err, conn) {
                if (err) throw err
                conn.query(
                    `SELECT * FROM device_tokens WHERE token = '${req.body.token}';`,
                    function (error, results) {
                        if (error) throw error
                        let tokenData = {
                            token: req.body.token
                        }
                        if (results.length == 0) {
                            conn.query(
                                `INSERT INTO device_tokens SET ?;`, [tokenData],
                                function (errorChild, resultsChild) {
                                    if (!errorChild) {
                                        res.status(200).json(
                                            {
                                                status: 200,
                                                message: "Device has been succesfully registered!",
                                            }
                                        )
                                    } 
                                    else {
                                        throw errorChild
                                    }                              
                                }
                            ),
                            conn.release()
                        }
                        else {
                            res.status(200).json(
                                {
                                    status: 200,
                                    message: "Device already registered!",
                                }
                            )
                        }
                    }
                )
            })
        }
        else {
            res.status(400).json(
                {
                    status: 400,
                    message: "Token can't be null!",
                }
            )
        }
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

async function getNotifRecord(req, res, next) {
    try {
        pool.getConnection(function (err, conn) {
            if (err) throw err
            conn.query(
                'SELECT * FROM notif_alert',
                function (error, results) {
                    if (error) throw error,
                    console.log(results)
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
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = {
    getNotifRecord,
    registerDevice
}