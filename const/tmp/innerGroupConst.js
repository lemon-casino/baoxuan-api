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
            {
                userName: "朱梦婷",
                userDDId: "01281701265226240386",
                isLeader: true
            },
            {userName: "安静淼", userDDId: "142218413823748364"},
            {userName: "薛娜", userDDId: "17403303641083361"}
        ]
    },
    {
        groupCode: "lyGroup", groupName: "李杨组",
        members: [
            {userName: "李杨", userDDId: "1902106729846298", isLeader: true},
            {userName: "唐再宏", userDDId: "211420293021597362"}
        ]
    },
    {
        groupCode: "swtGroup", groupName: "孙文涛组",
        members: [
            {userName: "孙文涛", userDDId: "325661230323306765", isLeader: true},
            {userName: "赵佳雯", userDDId: "493525201335469841"}
        ]
    }
]

const tmInnerGroup = {
    deptId: "903075138",
    group: tmInnerGroupVersion2,
    deprecatedGroup: tmInnerGroupVersion1
}

const visionInnerGroup = {
    deptId: "482162119",
    group: [
        // {
        //     groupCode: "shGroup", groupName: "施豪组",
        //     members: [
        //         {userName: "施豪", userDDId: "2257122745843341", isLeader: true},
        //         {userName: "张宇", userDDId: "021013633404778343"}
        //     ]
        // },
        // {
        //     groupCode: "lxyGroup", groupName: "李徐莹组",
        //     members: [
        //         {userName: "李徐莹", userDDId: "216201066326206711", isLeader: true},
        //         {userName: "易敏", userDDId: "023231184344835996"}
        //     ]
        // },
        // {
        //     groupCode: "zykGroup", groupName: "张月坤组",
        //     members: [
        //         {userName: "张月坤", userDDId: "045820505124242300", isLeader: true},
        //         {userName: "张周", userDDId: "023223231211776520"}
        //     ]
        // },
        // {
        //     groupCode: "dfGroup", groupName: "丁芳组",
        //     members: [{userName: "丁芳", userDDId: "013017535501652498", isLeader: true}]
        // },
        // {
        //     groupCode: "syGroup", groupName: "摄影组",
        //     members: [
        //         {userName: "于浩", userDDId: "2103600332651419"},
        //         {userName: "杨雪", userDDId: "1228451750859266"},
        //         {userName: "高悦斌", userDDId: "02421711126038887038"},
        //         {userName: "芦明阳", userDDId: "02332348011532989963"}
        //     ]
        // }
    ]
}

module.exports = {
    tmInnerGroup,
    visionInnerGroup
}