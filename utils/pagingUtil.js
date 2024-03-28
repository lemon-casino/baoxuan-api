const paging = (pageCount, total, data) => {
    return {
        pageCount,
        total,
        data
    }
}

module.exports = {paging}