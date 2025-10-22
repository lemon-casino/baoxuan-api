const biResponse = require("../utils/biResponse")
const settlementService = require("../service/settlementService")
const moment = require('moment')
const ExcelJS = require('exceljs')
const formidable = require("formidable")
const fs = require('fs')
const iconv = require("iconv-lite")

const newMap = function(datum) {
    if (datum === '') {
        return null;
    }
    datum = datum.trim()
    return datum;
}

const importData = async (req, res, next) => {
    try {
        let form = new formidable.IncomingForm()
        form.uploadDir = "./public/excel"
        fs.mkdirSync(form.uploadDir, { recursive: true })
        form.keepExtensions = true
        form.parse(req, async function (error, fields, files) {
            if (error) {
                return res.send(biResponse.canTFindIt)
            }

            const file = files.file
            const ext = file.originalFilename.split('.')[1]
            const filename = file.originalFilename.split('.')[0].split('_')
            if (filename.length < 3) {
                fs.rmSync(file.filepath)
                return res.send(biResponse.canTFindIt())
            }
            const projectName = filename[0]
            const shopName = filename[1]
            const time = filename[2]
            let extra = null
            if (filename.length > 3) extra = filename[3]
            const newPath = `${form.uploadDir}/${moment().valueOf()}-${file.originalFilename}`
            fs.renameSync(file.filepath, newPath, (err) => {  
                if (err) throw err
            })
            const workbook = new ExcelJS.Workbook()
            let datainfo = fs.readFileSync(newPath)
            if (projectName == '拼多多' || 
                projectName == '京东' || 
                projectName == '京东自营' || 
                projectName == '天猫') 
                datainfo = iconv.decode(datainfo, 'GBK')
            fs.writeFileSync(newPath, datainfo)
            let readRes = null
            if (ext == 'csv') {
                if (projectName == '天猫') 
                    readRes = await workbook.csv.readFile(newPath, {map: newMap})
                readRes = await workbook.csv.readFile(newPath)
            } else readRes = await workbook.xlsx.readFile(newPath)
            if (readRes) {
                let worksheet = []
                workbook.eachSheet(function(sheet) {
                    worksheet.push(sheet)
                })
                if (worksheet.length && worksheet[0].rowCount > 0) {
                    let result = await settlementService.batchInsert(worksheet, projectName, shopName, time, extra)
                    if (result) {
                        fs.rmSync(newPath)
                    } else {
                        return res.send(biResponse.createFailed())
                    }
                } else {
                    fs.rmSync(newPath)
                    return res.send(biResponse.createFailed())
                }
            }
            return res.send(biResponse.success())
        })
    } catch (e) {
        next(e)
    }
}

module.exports = {
    importData
}