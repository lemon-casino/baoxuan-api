const getReviewItem = (nodeId, reviewItems) => {
    for (const reviewItem of reviewItems) {
        if (nodeId === reviewItem.id) {
            return reviewItem
        }
        if (reviewItem.children && reviewItem.children.length > 0) {
            const tmpReviewItem = getReviewItem(nodeId, reviewItem.children)
            if (tmpReviewItem) {
                return tmpReviewItem
            }
        }
    }
    return null
}

module.exports = {
    getReviewItem
}