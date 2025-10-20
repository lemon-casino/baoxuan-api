const Sequelize = require('sequelize')
const { bpmDbConfig2 } = require('../config/index')

if (!bpmDbConfig2) {
	throw new Error('bpmDbConfig2 is not configured')
}

const Op = Sequelize.Op
const operatorsAliases = {
	$eq: Op.eq,
	$ne: Op.ne,
	$gte: Op.gte,
	$gt: Op.gt,
	$lte: Op.lte,
	$lt: Op.lt,
	$not: Op.not,
	$in: Op.in,
	$notIn: Op.notIn,
	$is: Op.is,
	$like: Op.like,
	$notLike: Op.notLike,
	$iLike: Op.iLike,
	$notILike: Op.notILike,
	$regexp: Op.regexp,
	$notRegexp: Op.notRegexp,
	$iRegexp: Op.iRegexp,
	$notIRegexp: Op.notIRegexp,
	$between: Op.between,
	$notBetween: Op.notBetween,
	$overlap: Op.overlap,
	$contains: Op.contains,
	$contained: Op.contained,
	$adjacent: Op.adjacent,
	$strictLeft: Op.strictLeft,
	$strictRight: Op.strictRight,
	$noExtendRight: Op.noExtendRight,
	$noExtendLeft: Op.noExtendLeft,
	$and: Op.and,
	$or: Op.or,
	$any: Op.any,
	$all: Op.all,
	$values: Op.values,
	$col: Op.col
}

const sequelize = new Sequelize(
	bpmDbConfig2.dbName,
	bpmDbConfig2.username,
	bpmDbConfig2.password,
	{
		dialect: 'mysql',
		host: bpmDbConfig2.host,
		port: bpmDbConfig2.port,
		define: {
			...bpmDbConfig2.define
		},
		timezone: '+08:00',
		operatorsAliases,
		logging: bpmDbConfig2.logging,
		pool: {
			max: 20,
			min: 5,
			acquire: 120000,
			idle: 10000
		}
	},
)

module.exports = sequelize