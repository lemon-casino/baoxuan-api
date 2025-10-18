const axios = require('axios');
async function sendDingtalkMessage(access_token, message) {
    const data = {
        msgtype: 'markdown',
        markdown: {
            title: '快递物流信息通知',
            text: message
        }
    };
    const webhookUrl = 'https://oapi.dingtalk.com/robot/send?access_token='+access_token;
    try {
        const response = await axios.post(webhookUrl, data, { headers: { 'Content-Type': 'application/json' } });
        if (response.status === 200) {
            console.log('消息发送成功');
        } else {
            console.log('消息发送失败，状态码：', response.status);
        }
    } catch (error) {
        console.error('Error sending DingTalk message:', error);
    }
}
export { sendDingtalkMessage };
