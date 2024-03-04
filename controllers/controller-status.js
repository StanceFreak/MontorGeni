const util = require('util')
const axios = require('axios')
const {ROOT_URL} = require('../utils/options')
const exec = util.promisify(require('child_process').exec)

async function getServerStatus(req, res, next) {
    try {
        const objResponse = {}
        const url = `${ROOT_URL}/query`
        const status = await axios.get(url, {params: {query : 'up{job="node_exporter"}'}})
        const {stdout, stderr} = await exec('uptime -p')
        status.data.data.result.map((data) => {
            objResponse.serverStatus = data.value[1]
        })
        if (stderr) {
            console.log('stderr:', stderr)
        } else {
            objResponse.serverUptime = stdout.slice(3, -1)
        }
        const responseValues = Object.values(objResponse)
        return res.status(200).json({
            status: 200,
            message: "success",
            data: {
                status: responseValues[0],
                uptime: responseValues[1]
            }
        })
    } catch (err) {
        res.status(400)
        next(Error(err.message))
    }
}

async function testExec(req, res, next) {
    try {
        const {stdout, stderr} = await exec('echo "matatabi" | sudo -S systemctl stop prometheus')
        if (stderr) {
            console.log('stderr:', stderr)
        } else {
            console.log("Success stopping prometheus")
        }
    } catch (error) {
        res.status(400)
        next(Error(error.message))
    }
}

module.exports = {
    getServerStatus,
    testExec
}