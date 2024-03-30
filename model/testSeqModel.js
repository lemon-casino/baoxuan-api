const Sequelize = require('sequelize')
const sequelize = require('./init')

const testSeqModel = sequelize.define('menus', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING(10),
        defaultValue: ''
    },
    name: {
        type: Sequelize.STRING(100),
        defaultValue: ''
    },
})