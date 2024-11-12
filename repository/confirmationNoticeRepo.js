const Sequelize = require("sequelize")
const sequelize = require('../model/init');
const getconfirmationnoticeModel = require("../model/confirmationnoticeModel")
const confirmationnoticeModel = getconfirmationnoticeModel(sequelize)
const getusersModel = require("../model/usersModel")
const {getStaffInfo} = require("@/core/dingDingReq/yiDaReq");
const redisRepo = require("@/repository/redisRepo");
const usersModel = getusersModel(sequelize)

// 同步users  is_is_resign= true表的数据
 // 同步数据
const syncUsersToConfirmationNotice = async () => {
    // 查询users表中is_resign为true的数据
    const ListUser = await usersModel.findAll({
        attributes:['username','nickname','dingding_user_id'],
        where: {
            is_resign: false
        },
        logging:true,
        raw:true
    })
    //ListUser 如果ListUser 的username 没有在 confirmationnoticeModel 中的userid中存在，则插入数据 有则更新数据  confirmationnoticeModel的userid 有 而 ListUser的username没有的数据删除
    const ListConfirmationNotice = await confirmationnoticeModel.findAll({
        attributes:['userid'],
        raw:true
    })
    // 1.遍历ListUser
    for (const item of ListUser) {
        let flag = false
        for (const item2 of ListConfirmationNotice) {
            if (item.username === item2.userid) {
                flag = true
            }
        }
        // 类型
        let attribute="";
        //是否通知
        let whether=2;
        // 直属主管
        let  StaffInfosupervisors="";
        // 计划转正日期
        let conversion_date="";
        const {access_token: ddAccessToken} = await redisRepo.getToken();
       const StaffInfo= await getStaffInfo(ddAccessToken,946663611,item.dingding_user_id,"sys01-planRegularTime,sys00-reportManager,sys01-employeeStatus")

        for (const staffInfoKey of StaffInfo.result[0].field_data_list) {
            if (staffInfoKey.field_code === 'sys01-employeeStatus') {
                const attributeValue = staffInfoKey.field_value_list[0]?.value;
                if (attributeValue !== undefined) {
                    attribute = parseInt(attributeValue);
                    if (attribute === 2) {
                        // 说明是实习生
                        for (const innerKey of StaffInfo.result[0].field_data_list) {
                           // console.log(innerKey)
                            if (innerKey.field_code === 'sys01-planRegularTime') {
                                conversion_date = innerKey.field_value_list[0]?.value;
                            }
                        }
                        whether=1
                    }
                }
            } else if (staffInfoKey.field_code === 'sys00-reportManager') {
                StaffInfosupervisors = staffInfoKey.field_value_list[0]?.value;
                // TODO 通知人事 此人 没有花名册没有上级主管 请核实
                if (StaffInfosupervisors === undefined) {
                    console.log(item.nickname ,attribute, staffInfoKey.field_value_list[0]?.label, conversion_date);
                }
            }
        }
        // 检查 conversion_date 是否为有效日期
        if (isNaN(Date.parse(conversion_date))) {
            conversion_date = null; // 或者设置为一个默认值
        }
        if (!flag) {
            await confirmationnoticeModel.create({
                userid: item.username,
                attribute: attribute,
                dingding: item.dingding_user_id,
                    whether:whether,
                supervisors:StaffInfosupervisors,
                conversionDate:conversion_date
            },{
                logging:true
                }
            )
        }else {
            // 4.如果flag为true，则更新数据

            await confirmationnoticeModel.update({
                supervisors:StaffInfosupervisors,
                attribute: attribute,
                conversionDate:conversion_date,
                whether:whether
            }, {
                where: {
                    userid: item.username,
                    dingding: item.dingding_user_id,
                },
                logging:true
            })
        }
    }
    // 2.遍历ListConfirmationNotice
    for (const item of ListConfirmationNotice) {
        let flag = false
        for (const item2 of ListUser) {
            if (item.userid === item2.username) {
                flag = true
            }
        }
        if (!flag) {
            await confirmationnoticeModel.destroy({
                where: {
                    userid: item.userid
                }
            })
        }
    }

}


//查询 confirmationnoticeModel 的 conversion_date 与今天 对比 是不是    第七天   第14天 和今天 相等的数据
const getConfirmationNotice = async () => {
    const today = new Date()
    const threeDays = new Date(today)
    threeDays.setDate(today.getDate() + 3)
    const sevenDays = new Date(today)
    sevenDays.setDate(today.getDate() + 7)
    const fourteenDays = new Date(today)
    fourteenDays.setDate(today.getDate() + 14)

    const ListConfirmationNotice = await confirmationnoticeModel.findAll({
        attributes:{
            exclude:['createdAt','updatedAt']
        },
        where: {
            conversionDate: {
                [Sequelize.Op.or]: [today,threeDays, sevenDays, fourteenDays]
            },
            whether: 1,
            supervisors :
                {[Sequelize.Op.ne]: null}
        },
        raw:true
    })
    for (const listConfirmationNoticeKey of ListConfirmationNotice) {
		//这些都是需要通知的数据
      let numberOfDays=  Math.ceil((new Date(listConfirmationNoticeKey.conversionDate)- today) / (1000 * 60 * 60 * 24));
      if (numberOfDays === 0) {
            listConfirmationNoticeKey.probationcontexe = `您好，您的转正日期为${listConfirmationNoticeKey.conversionDate}，今天是您的转正日期`
      }else {
          listConfirmationNoticeKey.probationcontexe = `您好，您的转正日期为${listConfirmationNoticeKey.conversionDate}，距离转正时间还有 ${ numberOfDays } 天，请您提前做好准备。`
      }
        listConfirmationNoticeKey.supervisorid = await  getDingdingUserId(listConfirmationNoticeKey.supervisors)
        listConfirmationNoticeKey.name=  await getusername(listConfirmationNoticeKey.userid)
        listConfirmationNoticeKey.supervisorscontexe = `您好，您的下属${listConfirmationNoticeKey.name}将于${listConfirmationNoticeKey.conversionDate}转正， 距离转正时间还有 ${ numberOfDays } 天 。`

        // 抄送人事
        listConfirmationNoticeKey.hrcontexe = `您好，${listConfirmationNoticeKey.name}将于${listConfirmationNoticeKey.conversionDate}转正， 距离转正时间还有 ${ numberOfDays } 天 。`

    }

    return ListConfirmationNotice
}
// 试用期没有conversion_date的数据 或者supervisors 为空的数据
const NotSupervisorsAndConversionDate = async () => {
  const list =await confirmationnoticeModel.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        where: {
            [Sequelize.Op.or]: [
                {conversionDate: null},
                {supervisors: null}
            ],
            whether: 1

        },
        raw: true
    })
    for (const item of list) {
        item.name= await getusername(item.userid)
        let xy=''
        let zg=''
        if (item.conversionDate === null) {
            xy = "无计划转正日期"
        }
        if (item.supervisors === null) {
            zg = "无上级主管"
        }
        item.hrcontexe = `${item.name} ${xy} ${zg} 。`

    }
    return  list;
}
// 根据 nickname 用户名  is_resign =true获取 对应的 dingding_user_id
 const getDingdingUserId = async (nickname) => {
 const dingding=  await  usersModel.findOne({
         attributes:['dingding_user_id'],
         where: {
             nickname: nickname,
             is_resign: false
         },
         logging:true,
         raw:true
     })
    return dingding.dingding_user_id
 }
// 根据
const getusername = async (username) => {
    const dingding=  await  usersModel.findOne({
        attributes:['nickname'],
        where: {
            username: username,
            is_resign: false
        },
        logging:true,
        raw:true
    })
    return dingding.nickname
}



module.exports = {
    syncUsersToConfirmationNotice,
    getConfirmationNotice,
    NotSupervisorsAndConversionDate,
}