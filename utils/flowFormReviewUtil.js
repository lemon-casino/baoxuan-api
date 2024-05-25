const getReviewItem = (activityId, reviewItems) => {
    for (const reviewItem of reviewItems) {
        if (activityId === reviewItem.id) {
            return reviewItem
        }
        if (reviewItem.children && reviewItem.children.length > 0) {
            const tmpReviewItem = getReviewItem(activityId, reviewItem.children)
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