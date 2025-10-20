const Sequelize = require('sequelize');
const sequelize = require('./bpmInit');

const CurriculumVitaeModel = sequelize.define('curriculum_vitae', {
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		comment: '主键ID',
		field: 'id'
	},
	hr: {
		type: Sequelize.STRING(64),
		allowNull: true,
		defaultValue: null,
		comment: '人事',
		field: 'hr'
	},
	date: {
		type: Sequelize.DATE,
		allowNull: true,
		defaultValue: null,
		comment: '收件时间',
		field: 'date'
	},
	job: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '岗位',
		field: 'job'
	},
	jobSalary: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '岗位薪资',
		field: 'job_salary'
	},
	name: {
		type: Sequelize.STRING(64),
		allowNull: true,
		defaultValue: null,
		comment: '姓名',
		field: 'name'
	},
	latestCorp: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '最近入职企业',
		field: 'latest_corp'
	},
	latestJob: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '最近入职岗位',
		field: 'latest_job'
	},
	gender: {
		type: Sequelize.TINYINT,
		allowNull: true,
		defaultValue: null,
		comment: '1男，2女',
		field: 'gender'
	},
	age: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: null,
		comment: '年龄',
		field: 'age'
	},
	location: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '工作地点',
		field: 'location'
	},
	education: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '学历',
		field: 'education'
	},
	seniority: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '工龄',
		field: 'seniority'
	},
	salary: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '期望薪资',
		field: 'salary'
	},
	filename: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '简历名称',
		field: 'filename'
	},
	filesize: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: null,
		comment: '文件大小',
		field: 'filesize'
	},
	filepath: {
		type: Sequelize.STRING(255),
		allowNull: true,
		defaultValue: null,
		comment: '文件路径',
		field: 'filepath'
	},
	ship: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: null,
		comment: '状态 1是淘汰, 2是进入面试 3是初面 ',
		field: 'ship'
	}
}, {
	tableName: 'curriculum_vitae',
	timestamps: false
});

module.exports = CurriculumVitaeModel;