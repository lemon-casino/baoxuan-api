const {v4: uuid} = require('uuid');

const getId = () => {
    return uuid()
}

module.exports = {
    getId
}