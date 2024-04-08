// 处理小数的精度问题
const sum = (...nums) => {
    const times = 1000
    let result = 0
    for (const num of nums) {
        result = (result * times + num * times) / times
    }
    return result
}

module.exports = {
    sum
}