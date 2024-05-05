// 天猫小组内容划分的临时小组结构
const tmInnerGroupVersion1 = {
    "朱梦婷组": ["朱梦婷", "安静淼", "薛娜"],
    "李杨组": ["李杨", "唐再宏"],
    "孙文涛组": ["孙文涛", "赵佳雯"]
}

const tmInnerGroupVersion2 = [
    {
        groupCode: "zmtGroup", groupName: "朱梦婷组",
        members: [
            {userName: "朱梦婷", isLeader: true}, {userName: "安静淼"}, {userName: "薛娜"}
        ]
    },
    {
        groupCode: "lyGroup", groupName: "李杨组",
        members: [
            {userName: "李杨", isLeader: true}, {userName: "唐再宏"}]
    },
    {
        groupCode: "swtGroup", groupName: "孙文涛组",
        members: [{userName: "孙文涛", isLeader: true}, {userName: "赵佳雯"}]
    }
]

module.exports = {
    tmInnerGroupVersion1,
    tmInnerGroupVersion2
}