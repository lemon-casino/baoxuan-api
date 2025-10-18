const {
    DataTypes
} = require('sequelize');
module.exports = sequelize => {
    const attributes = {
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "name"
        },
        section: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "section"
        },
        position: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "position"
        },
        beCharge: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "be_charge"
        },
        employeeStatus: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "employee_status"
        },
        onBoardTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "on_board_time"
        },
        lengthService: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "length_service"
        },
        documentNumber: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "document_number"
        },
        birthday: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "birthday"
        },
        age: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "age"
        },
        sex: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "sex"
        },
        rank: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "rank"
        },
        nation: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "nation"
        },
        phoneNumber: {
            type: DataTypes.BIGINT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "phone_number"
        },
        maritalStatus: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "marital_status"
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "address"
        },
        registrationType: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "registration_type"
        },
        cardAddress: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "card_address"
        },
        educationalBackground: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "educational_background"
        },
        graduateSchool: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "graduate_school"
        },
        major: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "major"
        },
        emergencyContactName: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "emergency_contact_name"
        },
        contactNumber: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "contact_number"
        },
        contractCompany: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "contract_company"
        },
        contractType: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "contract_type"
        },
        startDateFirstContract: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "start_date_first_contract"
        },
        firstContractExpirationDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "first_contract_expiration_date"
        },
        currentContractStartingDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "current_contract_starting_date"
        },
        currentContractExpirationDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "current_contract_expiration_date"
        },
        termContract: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "term_contract"
        },
        renewalTimes: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "renewal_times"
        }
    };
    const options = {
        tableName: "zai_zhi_ren",
        comment: "",
        indexes: []
    };
    const ZaiZhiRenModel = sequelize.define("zaiZhiRenModel", attributes, options);
    return ZaiZhiRenModel;
};