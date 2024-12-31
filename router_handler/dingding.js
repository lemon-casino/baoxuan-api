const contactsReq = require("../core/dingDingReq/contactsReq")
const credentialsReq = require("../core/dingDingReq/credentialsReq")
const UsersModel = require("../model/users");
const {generateToken} = require("../utils/token");
const tokenConfig = require("../config/index").tokenConfig;
const biResponse = require("../utils/biResponse")
const { config: dingdingConfig } = require('../core/dingDingReq/dingDingReqUtil')

exports.getddUserList = async (req, res) => {
    // 钉钉授权流程
    const ddAuth = async (code) => {
        // 1.根据code获取用户token
        let UserToken = await credentialsReq.getUserDingDingAccessToken(code);
        // 1.获取企业内部应用的access_token
        let CorpToken = await credentialsReq.getDingDingAccessToken();
        // 2.根据token获取通讯录用户信息，得到unionid
        const {nick, unionId, avatarUrl, openId, mobile} = await contactsReq.getUserInfoByToken(
            UserToken.accessToken
        );
        //  3.根据unionid获取用户的userid
        const userIdinfo = await contactsReq.getUserIdByUnionIdAndToken(CorpToken.access_token, unionId);
        return {
            userid: userIdinfo.result.userid,
            corpTokenToken: CorpToken.access_token,
        };
    };

    // 返回个人信息
    const getddUserLists = async (corpTokenToken, userid) => {
        const userInfo = await contactsReq.getUserInfoByUserIdAndToken(corpTokenToken, userid);
        if (userInfo.errmsg === "ok") {
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
                const {result} = await contactsReq.getDpInfo(corpTokenToken, item.dept_id);
                // 如果是主管获取当前部门下的所有员工userid
                if (item.leader) {
                    const user_result = await contactsReq.getDeptUserList(
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
            return res.send(biResponse.serverError(userInfo.errmsg));
        }
    };

    // 钉钉授权流程
    const {corpTokenToken, userid} = await ddAuth(req.query.code);
    // TODO 将corpTokenToken存入redis中
    // const { corpTokenToken } = await ddAuth(req.query.code);
    // const userid = "073105202321093148"; // 管理员的userid
    // const userid = "02305302114423558928"; // 普通的userid
    // const userid = "093612106024638452";// 子部门主管id
    // 返回用户信息
    const {name, avatar, mobile, email, dept_id_list, hired_date, dep_list} =
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
            generateToken(
                {
                    id: is_userId.user_id,
                    userId: is_userId.dingding_user_id,
                    username: is_userId.username
                },
                tokenConfig.jwtSecretKey,
                tokenConfig.secretKeyExpire
            );
        // 生成长时refreshToken
        const refreshToken = generateToken(
            {
                id: is_userId.user_id,
                userId: is_userId.dingding_user_id,
                username: is_userId.username
            },
            tokenConfig.jwtRefrechSecretKey,
            tokenConfig.refreshSerectKeyExpire
        );
        return res.send(biResponse.success({
            is_userId: true,
            token,
            refreshToken,
        }));
    } else {
        return res.send(biResponse.success({
            is_userId: false,
            name,
            avatar,
            mobile,
            email,
            hired_date,
            dingding_user_id: userid
        }));
    }
};
exports.getLiuChengList = async (req, res) => {
    try {
        let aa = await credentialsReq.getDingDingAccessToken()
        return res.send(aa);
    } catch (error) {
        return res.send(biResponse.serverError(error.message));
    }
};
exports.getDpList = async (req, res) => {
    try {
        let user_id = req.body?.user_id;
        let {access_token: accessToken} = await credentialsReq.getDingDingAccessToken()
        let dpData = await contactsReq.getDp(accessToken, 3203266220231269);
        return res.send(dpData);
    } catch (e) {
        console.log(e);
    }
};
exports.getDpInfo = async (req, res) => {
    try {
        let dp_id = req.body?.dp_id;
        let {access_token: accessToken} = await credentialsReq.getDingDingAccessToken();
        let dpData = await contactsReq.getDpInfo(accessToken, 913539395);
        return res.send(dpData);
    } catch (e) {
        console.log(e);
    }
};


exports.getDDConfig = async (req, res) => {
    try {
        let conf = await dingdingConfig(req.query.url);
        return res.send(conf);
    } catch (e) {
        console.log(e);
    }
}
