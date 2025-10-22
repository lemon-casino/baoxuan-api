const paging = (pageCount, total, data) => {
    return {
        pageCount,
        total,
        data
    }
}

const defaultPaging = (data, pageSize) => {
    return paging(Math.ceil(data.count / pageSize), data.count, data.rows)
}

module.exports = {
    paging,
    defaultPaging
}