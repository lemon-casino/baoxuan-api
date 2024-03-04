const axios = require("axios");
const dd = require("../utils/dingding");
// 引入用户模型
const UsersModel = require("../model/users");
const { addToken } = require("../utils/token");
const key = require("../config/index");

// 定义获取流程列表的API接口URL
const GET_PROCESS_LIST_URL =
  "https://oapi.dingtalk.com/robot/send?access_token=";

// 定义获取流程列表的请求参数
const PROCESS_LIST_PARAM = {
  type: "oa",
  open_id: "YOUR_OPEN_ID", // 钉钉应用的管理员账号的OpenID
  process_code: "YOUR_PROCESS_CODE", // 流程的编码
  page: 1, // 页码，默认为1
  page_size: 10, // 每页的数量，默认为10
};

exports.getddUserList = async (req, res) => {
  // 钉钉授权流程
  const ddAuth = async (code) => {
    // 1.根据code获取用户token
    let UserToken = await dd.getddToken(code);
    // 1.获取企业内部应用的access_token
    let CorpToken = await dd.getddCorpToken();
    // 2.根据token获取通讯录用户信息，得到unionid
    const { nick, unionId, avatarUrl, openId, mobile } = await dd.getddtxInfo(
      UserToken.accessToken
    );
    //  3.根据unionid获取用户的userid
    const userIdinfo = await dd.getddUserId(CorpToken.access_token, unionId);
    return {
      userid: userIdinfo.result.userid,
      corpTokenToken: CorpToken.access_token,
    };
  };

  // 返回个人信息
  const getddUserLists = async (corpTokenToken, userid) => {
    const userInfo = await dd.getddUserInfo(corpTokenToken, userid);
    if (userInfo.errmsg === "ok") {
      // name: 员工姓名
      // avatar: 员工头像
      // mobile: 员工手机号
      // email: 员工邮箱
      // dept_id_list: 员工所属部门id列表
      // hired_date: 员工入职时间
      // leader_in_dept 员工在对应的部门中是否是主管，返回true或false
      const {
        name,
        avatar,
        mobile,
        email,
        dept_id_list,
        hired_date,
        leader_in_dept,
      } = userInfo.result;
      let promises = leader_in_dept.map(async (item) => {
        const { result } = await dd.getDpInfo(corpTokenToken, item.dept_id);
        // 如果是主管获取当前部门下的所有员工userid
        if (item.leader) {
          const user_result = await dd.getDeptUserList(
            corpTokenToken,
            item.dept_id
          );
          return {
            dept_info: result,
            is_leader: item.leader,
            dep_userid_list: user_result.result.userid_list,
          };
        } else {
          return {
            dept_info: result,
            is_leader: item.leader,
            dep_userid_list: [],
          };
        }
      });
      const dep_list = (await Promise.all(promises)).flat();
      return {
        name,
        avatar,
        mobile,
        email,
        dept_id_list,
        hired_date,
        dep_list,
      };
    } else {
      return res.send({
        code: 0,
        message: userInfo.errmsg,
        data: {},
      });
    }
  };

  // 钉钉授权流程
  const { corpTokenToken, userid } = await ddAuth(req.query.code);
  // TODO 将corpTokenToken存入redis中
  // const { corpTokenToken } = await ddAuth(req.query.code);
  // const userid = "073105202321093148"; // 管理员的userid
  // const userid = "02305302114423558928"; // 普通的userid
  // const userid = "093612106024638452";// 子部门主管id
  // 返回用户信息
  const { name, avatar, mobile, email, dept_id_list, hired_date, dep_list } =
    await getddUserLists(corpTokenToken, userid);

  // 查询是否存在相同用户名
  const is_userId = await UsersModel.findOne({
    where: {
      dingding_user_id: userid,
    },
  });
  if (is_userId) {
    const token =
      "Bearer " +
      addToken(
        { id: is_userId.user_id, username: is_userId.username },
        key.jwtSecretKey,
        key.secretKeyExpire
      );
    // 生成长时refreshToken
    const refreshToken = addToken(
      { id: is_userId.user_id, username: is_userId.username },
      key.jwtRefrechSecretKey,
      key.refreshSerectKeyExpire
    );
    return res.send({
      code: 200,
      message: "登录成功",
      data: {
        is_userId: true,
        token,
        refreshToken,
      },
    });
  } else {
    return res.send({
      code: 200,
      message: "获取用户信息成功",
      data: {
        is_userId: false,
        name,
        avatar,
        mobile,
        email,
        hired_date,
        dingding_user_id: userid,
        // newLiuChengList
      },
    });
  }
};
exports.getLiuChengList = async (req, res) => {
  try {
    let aa = await dd.corpAccessToken();

    return res.send(aa);
  } catch (error) {
    return res.send({
      err: error,
    });
  }
};
exports.getDpList = async (req, res) => {
  try {
    let user_id = req.body?.user_id;
    console.log(user_id);
    let token = await dd.corpAccessToken();
    let dpData = await dd.getDp(token.accessToken, 3203266220231269);
    return res.send(dpData);
  } catch (e) {
    console.log(e);
  }
};
exports.getDpInfo = async (req, res) => {
  try {
    let dp_id = req.body?.dp_id;
    let token = await dd.corpAccessToken();
    let dpData = await dd.getDpInfo(token.accessToken, 913539395);
    return res.send(dpData);
  } catch (e) {
    console.log(e);
  }
};
