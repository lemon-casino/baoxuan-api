/*
 * @Author: 陈晓飞 481617494@qq.com
 * @Date: 2024-03-08 13:57:52
 * @LastEditors: 陈晓飞 481617494@qq.com
 * @LastEditTime: 2024-03-09 17:05:28
 * @FilePath: /Bi-serve/config/ddbot.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const axios = require("axios");
const https = require("node:https");
const flowpathHandler = require("../router_handler/flowpath");
const FlowFormModel = require("../model/flowfrom");

const clientId = "dinglc7figruiaukkx86";
const clientSecret =
  "xbivnBl_KlDbXdQrllrA4LIVvTGWAReK3A9Qb4TjtKwEHO38Osxz8k-bl0_B4fkY";
const {
  DWClient,
  DWClientDownStream,
  EventAck,
  TOPIC_ROBOT,
} = require("dingtalk-stream");

const client = new DWClient({
  clientId: clientId,
  clientSecret: clientSecret,
});
let OldmsgId = "";
// 回复消息请求
const onBotMessagereq = async (webhook, message, content) => {
  const data = JSON.stringify({
    msgtype: "text",
    text: {
      content: `问题：${message.text.content}----\r\n回复：${content}`,
    },
    at: {
      isAtAll: false, // 是否艾特所有人
      atUserIds: [message?.senderStaffId || ""],
    },
  });
  console.log("webhook, content ================>", webhook, content);
  await axios.post(webhook, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return { status: "SUCCESS", message: "OK" }; // message 属性可以是任意字符串；
};
// 截取-----获取宜搭流程数据
const handel_yd_file_parseData = async (data) => {
  // 使用 '|' 字符分割字符串
  let parts = data.split("|");
  let action = parts[0].trim(); // 这就是你要执行的操作
  let content = parts[1].trim(); // 这是操作的内容
  let contentParts = content.split("/");
  let fileName = contentParts[2].trim(); // 文件名称
  let timeRange = contentParts[0].trim().split(","); // 时间区间
  let formIds = contentParts[1].trim().split(","); // 表单id
  let response = await axios.get(
    `http://127.0.0.1:9999/user/flowpath/getyidaprocess?startTime=${
      timeRange[0]
    }&endTime=${timeRange[1]}&form_ids=${JSON.stringify(
      formIds
    )}&file_name=${fileName}`,
    {
      headers: {
        Authorization: "1234567890",
      },
    }
  );
  if (response.data.code === 200) {
    return `\r\n真不错~~~文件导出成功啦，\r\n文件名称：${response.data.data.fileName}，\r\n点击下载吧~：${response.data.data.fileUrl}`;
  } else {
    return `可惜了~~~文件导出失败了，失败原因：${response.data.message}`;
  }
  // return
};
// 获取流程表单
const getFlowForm = async () => {
  const result = [];
  const resList = await FlowFormModel.getFlowFormList();
  resList.forEach((element) => {
    result.push(
      `${element.dataValues.flow_form_id}--${element.dataValues.flow_form_name}`
    );
  });
  return result.join("\r\n");
};
// GPT回复
const GPTReply = async (content) => {
  const GPTUrl = "http://chat_serve_api.yi-shi.vip/v1/chat/completions";
  const GPTheaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer Fk-JN3e78X3CNCe4FL8HQPiBHWKwpiMtCFgtpA5",
  };
  const GPTdata = {
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a seasoned e-commerce product operation mentor, and you are very skilled",
      },
      { role: "user", content: content },
    ],
  };
  const GPTresponse = await axios.post(GPTUrl, GPTdata, {
    headers: GPTheaders,
  });
  return GPTresponse.data.choices[0].message.content;
};
const onBotMessage = async (event) => {
  let message = JSON.parse(event.data);
  let content = (message?.text?.content || "").trim();
  let webhook = message?.sessionWebhook || "";
  if (message.msgId !== OldmsgId) {
    let parts = content.split("|");
    // await onBotMessagereq(
    //   webhook,
    //   message,
    //   "你提问的问题很深奥，让我想一想，别急~~"
    // );
    console.log("parts ================>", parts);
    if (parts.length > 0 && parts[0] === "文件") {
      const resa = await handel_yd_file_parseData(content);
      await onBotMessagereq(webhook, message, resa);
    } else if (parts.length > 0 && parts[0] === "流程表单") {
      await onBotMessagereq(webhook, message, await getFlowForm());
    } else if (content == "介绍") {
      await onBotMessagereq(
        webhook,
        message,
        `介绍：\r\n
            提问我之前记得艾特我哦~~~你可以向我提问，我定会知无不言，言无不尽。\r\n
            指定功能格式：\r\n
                1.导出宜搭流程，指定时间区间，指定表单，指定文件名称\r\n
                    格式：\r\n
                        文件| 开始时间-结束时间/表单id/文件名称\r\n
                    例子：\r\n
                        文件| 2024-01-01,2024-01-31/FORM-232dsadas321312,FORM-232dsadas32131321/宜搭流程文件\r\n
                2.获取流程表单\r\n
                    格式：\r\n
                        流程表单\r\n
            `
      );
    } else {
      try {
        const resGPTReply = await GPTReply(content);
        await onBotMessagereq(webhook, message, resGPTReply);
      } catch (error) {
        const resGPTReply = await GPTReply(content);
        await onBotMessagereq(webhook, message, resGPTReply);
        console.log("错误了 ================>", error.data);
      }
    }
    OldmsgId = message.msgId;
  }
};

client.registerCallbackListener(TOPIC_ROBOT, onBotMessage).connect();
