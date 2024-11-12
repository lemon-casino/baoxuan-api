const confirmationNoticeRepo = require("@/repository/confirmationNoticeRepo")
const confirmNotice = async () => {
    const  DingTO=await confirmationNoticeRepo.getConfirmationNotice()
    // 试用期没有conversion_date的数据 或者supervisors 为空的数据
  const Not = await confirmationNoticeRepo.NotSupervisorsAndConversionDate()
    return {
    DingTO,
    Not
};
}


const timingSynchronization = async () => {
    //同步users  is_is_resign= true表的数据
     await confirmationNoticeRepo.syncUsersToConfirmationNotice()
}
module.exports = {
    confirmNotice,
    timingSynchronization
};