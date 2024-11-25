const stockService = require("../service/jst/stockService")
const orderService = require('../service/jst/orderService')
const biResponse = require("../utils/biResponse")
const ExcelJS = require('exceljs')
const moment = require('moment')

const getWeekStats = async (req, res, next) => {
    try {
        const columns = [
            { header: '商品名称', key: 'name', isDefault: true },
            { header: '商品编码', key: 'sku_id', isDefault: true },
            { header: '款式编码', key: 'i_id', isDefault: true },
            { header: '主仓实际库存', key: 'qty', isDefault: true },
            { header: '30天销量', key: 'month_sale', isDefault: true },
            { header: '7天销量', key: 'week_sale', isDefault: true },
            { header: '昨日销量', key: 'yesterday_sale', isDefault: true },
            { header: '今日销量', key: 'today_sale', isDefault: true },
            { header: '30天日均', key: 'month_sale_ave', isDefault: true },
            { header: '7天日均', key: 'week_sale_ave', isDefault: true },
            //库存/(7天销量/7)
            { header: '可支撑', key: 'sale_day', isDefault: true },
            //无库存, 无销售, 0-30天, 31-60天, 61-90天, 90天+
            { header: '可支撑范围', key: 'sale_day_rank', isDefault: true },            
            { header: '上架时间', key: 'other_2', isDefault: true },
            { header: '上架月', key: 'other_2_month', isDefault: true },
            { header: '周转员', key: 'other_1', isDefault: true },
            { header: '备注标签', key: 'other_3', isDefault: true },
            { header: '开发员', key: 'other_4', isDefault: true },
        ]

        const columns1 = [
            { header: '渠道', key: 'shop_name', isDefault: true },
            { header: '商品名称', key: 'name', isDefault: true },
            { header: '商品编码', key: 'sku_id', isDefault: true },
            { header: '款式编码', key: 'i_id', isDefault: true },
            { header: '30天销量', key: 'sale', isDefault: true },
        ]
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('数据源')
        const worksheet1 = workbook.addWorksheet('新品无销售')
        const worksheet2 = workbook.addWorksheet('新品60天以上')
        const worksheet3 = workbook.addWorksheet('老品滞销')
        const worksheet4 = workbook.addWorksheet('滞销库存')
        const worksheet5 = workbook.addWorksheet('天猫近30天')
        const worksheet6 = workbook.addWorksheet('拼多多近30天')
        const worksheet7 = workbook.addWorksheet('京东近30天')
        const worksheet8 = workbook.addWorksheet('淘工厂近30天')
        worksheet.columns = columns
        worksheet1.columns = columns
        worksheet2.columns = columns
        worksheet3.columns = columns
        worksheet4.columns = columns
        worksheet5.columns = columns1
        worksheet6.columns = columns1
        worksheet7.columns = columns1
        worksheet8.columns = columns1
        let data = await stockService.getStockStats()
        for (let i = 0; i < data.length; i++) {
            let month_sale_ave = data[i].month_sale ? Math.ceil(data[i].month_sale / 30) : 0
            let week_sale_ave = data[i].week_sale ? Math.ceil(data[i].week_sale / 30) : 0
            let sale_day = week_sale_ave ? Math.ceil(data[i].qty / week_sale_ave) : 0
            let sale_day_rank
            if (data[i].qty == 0) sale_day_rank = '无库存'
            else if (week_sale_ave == 0) sale_day_rank = '无销售'
            else if (sale_day <= 30) sale_day_rank = '0-30天'
            else if (sale_day <= 60) sale_day_rank = '31-60天'
            else if (sale_day <= 90) sale_day_rank = '61-90天'
            else sale_day_rank = '90天+'
            let row = {
                name: data[i].name,
                sku_id: data[i].sku_id,
                i_id: data[i].i_id,
                qty: data[i].qty,
                month_sale: data[i].month_sale || 0,
                week_sale: data[i].week_sale || 0,
                yesterday_sale: data[i].yesterday_sale || 0,
                today_sale: data[i].today_sale || 0,
                month_sale_ave,
                week_sale_ave,
                sale_day,
                sale_day_rank,
                other_2: data[i].other_2,
                other_2_month: data[i].other_2_month,
                other_1: data[i].other_1,
                other_3: data[i].other_3,
                other_4: data[i].other_4
            }
            if (data[i].other_2 && 
                /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(data[i].other_2)) {
                if (moment(data[i].other_2).subtract(-90, 'day').valueOf() >= moment().valueOf() && 
                    sale_day_rank == '无销售') {
                    worksheet1.addRow(row)
                }
                if (moment(data[i].other_2).subtract(-90, 'day').valueOf() >= moment().valueOf() && 
                    ['61-90天', '90天+'].includes(sale_day_rank)) {
                    worksheet2.addRow(row)
                }
                if (moment(data[i].other_2).subtract(-90, 'day').valueOf() < moment().valueOf() && 
                    ['无销售', '61-90天', '90天+'].includes(sale_day_rank)) {
                    worksheet3.addRow(row)
                }
            }
            if (['无销售', '61-90天', '90天+'].includes(sale_day_rank)) {
                worksheet4.addRow(row)
            }
            worksheet.addRow(row)
        }
        data = await orderService.getSaleStats()
        for (let i = 0; i < data.length; i++) {
            if (!data[i].sku_id) continue
            let row = {
                shop_name: data[i].shop_name,
                name: data[i].name,
                sku_id: data[i].sku_id,
                i_id: data[i].i_id,
                sale: data[i].sale
            }
            if (data[i].project_id == 1) worksheet6.addRow(row)
            else if (data[i].project_id == 2) worksheet8.addRow(row)
            else if (data[i].project_id == 5) worksheet7.addRow(row)
            else worksheet5.addRow(row)
        }

        const buffer = await workbook.xlsx.writeBuffer()
        res.setHeader('Content-Disposition', `attachment; filename="kczz.xlsx"`)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
        return res.send(buffer)
    } catch (e) {
        next(e)
    }
}

const syncOrder = async (req, res, next) => {
    try {
        await orderService.syncOrder(req.body.start, req.body.end)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getWeekStats,
    syncOrder
}