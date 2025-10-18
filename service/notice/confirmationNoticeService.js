const confirmationNoticeService = require('@/service/notice/impl/confirmationNoticeServiceImpl');
const biResponse = require("@/utils/biResponse");

//通知确认
const confirmNotice = async (req, res, next) => {
   const list=await  confirmationNoticeService.confirmNotice();

    return res.send(biResponse.success(list))
}

const timingSynchronization = async () => {
    await  confirmationNoticeService.timingSynchronization();
}


module.exports = {
    confirmNotice,
    timingSynchronization
}