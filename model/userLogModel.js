const {
    DataTypes
} = require('sequelize');
const dateUtil = require("../utils/dateUtil");

module.exports = sequelize => {
    const attributes = {
        id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: null,
            primaryKey: true,
            autoIncrement: false,
            comment: null,
            field: "id"
        },
        userId: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "用户Id",
            field: "user_id"
        },
        userName: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "用户名",
            field: "user_name"
        },
        loginTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "登录时间",
            field: "login_time",
            get() {
                const loginTime = this.getDataValue("loginTime")
                if (loginTime) {
                    return dateUtil.format2Str(loginTime)
                }
                return loginTime

            }
        },
        lastOnlineTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "最新的在线时间;",
            field: "last_online_time",
            get() {
                const lastOnlineTime = this.getDataValue("lastOnlineTime")
                if (lastOnlineTime) {
                    return dateUtil.format2Str(lastOnlineTime)
                }
                return lastOnlineTime
            }
        },
        device: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "登录设备信息",
            field: "device"
        },
        ip: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: "登录ip;",
            field: "ip"
        },
        isOnline: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 0,
            primaryKey: false,
            autoIncrement: false,
            comment: "是否在线;",
            field: "is_online"
        },
        duration: {
            type: DataTypes.VIRTUAL,
            get() {
                const loginTime = this.getDataValue("loginTime")
                const lastOnlineTime = this.getDataValue("lastOnlineTime")
                if (!lastOnlineTime || !loginTime) {
                    return 0
                }
                return Math.max(dateUtil.duration(lastOnlineTime, loginTime), 0)
            }
        }
    };
    const options = {
        tableName: "user_log",
        comment: "",
        indexes: []
    };
    const UserLogModel = sequelize.define("userLogModel", attributes, options);
    return UserLogModel;
};