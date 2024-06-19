// 此模块中调用的钉钉接口次数有限制：1w次/月

const httpUtil = require("../utils/httpUtil");

/**
 * 获取打卡记录
 *
 * @param pageIndex
 * @param pageSize
 * @param workDateFrom
 * @param workDateTo
 * @param userIds
 * @param token
 * @returns {Promise<any|undefined>}
 */
const getAttendances = async (pageIndex, pageSize, workDateFrom, workDateTo, userIds, token) => {
    const url = `https://oapi.dingtalk.com/attendance/list?access_token=${token}`
    const body = {
        workDateFrom,
        workDateTo,
        "offset": pageIndex * pageSize,
        "limit": pageSize,
        "userIdList": userIds,
        "isI18n": false,
    }
    return await httpUtil.post(url, body)
}

/**
 * 获取当前企业所有可管理的表单
 *
 * @param accessToken
 * @param userId
 * @returns {Promise<{result: [{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null], success: boolean}>}
 */
const getOAProcessTemplates = async (accessToken, userId) => {
    return {
        "result": [
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "日常订货付款申请",
                "gmtModified": "2024-02-29T19:15Z",
                "iconName": "common",
                "processCode": "PROC-7DBEA61E-7BBF-4B6A-943C-A9AB44F0B035",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "备用金申请",
                "gmtModified": "2024-01-08T10:06Z",
                "iconName": "biz",
                "processCode": "PROC-0C45B1DA-E65E-4C57-B1BE-5FF8FF7B4EED",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN0169Fn5R24E16X0jVZ6_!!6000000007358-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 7,
                "flowTitle": "换班",
                "gmtModified": "2020-08-04T16:25Z",
                "iconName": "relieve",
                "processCode": "PROC-A558155D-EA7C-4AD4-A010-748BED720849",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01C4MeMd1ZCPcxWUe8q_!!6000000003158-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "部门协作（一对一）",
                "gmtModified": "2021-08-30T17:44Z",
                "iconName": "exchange",
                "processCode": "PROC-832ACD84-0984-4052-A1F7-2C6A7C038548",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01ST07Gs25ABP9pzgSS_!!6000000007485-2-tps-480-480.png"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "快递付款申请",
                "gmtModified": "2023-12-15T12:49Z",
                "iconName": "procurement",
                "processCode": "PROC-3B68A1FF-7C03-4AD0-ACF0-C2EEAFD89CD5",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01AYTIyi1tsMDVcgNSq_!!6000000005957-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "杂费",
                "gmtModified": "2024-03-07T12:44Z",
                "iconName": "procurement",
                "processCode": "PROC-0D2BCBB5-7882-487E-8FF1-F6DBE7E19F63",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01AYTIyi1tsMDVcgNSq_!!6000000005957-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "软件采购申请",
                "gmtModified": "2023-10-25T11:22Z",
                "iconName": "biz",
                "processCode": "PROC-77F40AA6-D6C2-46F5-81E7-FDDB9859CA27",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN0169Fn5R24E16X0jVZ6_!!6000000007358-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "房租",
                "gmtModified": "2023-10-23T16:06Z",
                "iconName": "house",
                "processCode": "PROC-F2867A64-FE58-42B2-ADDC-044282E7376C",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN017ix8gZ1ebD9XWrom5_!!6000000003889-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "仓库运费及日杂费",
                "gmtModified": "2022-08-26T18:03Z",
                "iconName": "biz",
                "processCode": "PROC-04192EE0-93D1-4010-AA70-D59714CFFF56",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN0169Fn5R24E16X0jVZ6_!!6000000007358-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "运营推广费",
                "gmtModified": "2024-01-11T17:00Z",
                "iconName": "datapie",
                "processCode": "PROC-36B4FCEB-4F57-4012-814C-1D60018D0C19",
                "iconUrl": "https://img.alicdn.com/imgextra/i4/O1CN01EuisBL1SSiPogkS3k_!!6000000002246-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "专利审批",
                "gmtModified": "2022-08-23T14:01Z",
                "iconName": "payment",
                "processCode": "PROC-E5393684-C6EF-450B-B1FB-690502E2D661",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01NcX3GA261JLcC1KzU_!!6000000007601-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "拍照用品",
                "gmtModified": "2024-01-10T19:48Z",
                "iconName": "biz",
                "processCode": "PROC-0117DD0D-FB49-4B64-AFB3-4B167AF47182",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN0169Fn5R24E16X0jVZ6_!!6000000007358-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "差旅报销费用",
                "gmtModified": "2023-11-14T17:01Z",
                "iconName": "trip",
                "processCode": "PROC-949A66E5-9156-4A4B-A0D5-523C71114D9F",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN011JkyFi29g1Ov9ZBPB_!!6000000008096-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "业务招待",
                "gmtModified": "2023-05-23T18:45Z",
                "iconName": "message",
                "processCode": "PROC-7DD4ED81-297E-4FD8-AFC4-79491C3B850A",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01QFVaYy1YkvraxC3vW_!!6000000003098-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "外聘费",
                "gmtModified": "2023-11-17T14:38Z",
                "iconName": "love",
                "processCode": "PROC-16C61BA5-9F82-419B-84CA-682DDD4424DE",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN0103C48E1liGYy18eGQ_!!6000000004852-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "付款申请单",
                "gmtModified": "2023-12-14T20:12Z",
                "iconName": "pay",
                "processCode": "PROC-20C43271-5D2E-4D91-BAA5-7A838F0234EE",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01VkwWMH28poFdlsfL9_!!6000000007982-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "财务、行政、人事物品借用申请",
                "gmtModified": "2023-03-10T13:16Z",
                "iconName": "tag",
                "processCode": "PROC-6EE3A030-040B-4EFD-A455-E8C84C5E585B",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01S7JMRH1L7Sj8f23gW_!!6000000001252-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "开发票申请审批",
                "gmtModified": "2023-09-19T09:36Z",
                "iconName": "out",
                "processCode": "PROC-896687BC-73C5-4E81-BBDA-135A4DC44EE6",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01LDNnNJ1kkGg9ZYS1F_!!6000000004721-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "维修申请单",
                "gmtModified": "2020-08-19T20:01Z",
                "iconName": "maintenance",
                "processCode": "PROC-79C3632F-755D-4614-93C5-7783D70B806F",
                "iconUrl": "https://img.alicdn.com/imgextra/i4/O1CN01RsBV4N1pL920AQejY_!!6000000005343-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "包材采买申请",
                "gmtModified": "2021-08-31T17:58Z",
                "iconName": "common",
                "processCode": "PROC-0C51E33B-0DA2-4D84-86CA-892C21A9C0EB",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "软件费",
                "gmtModified": "2023-11-28T16:45Z",
                "iconName": "common",
                "processCode": "PROC-EB0B687F-7D92-4865-97FF-287D1F4D1C61",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "运营代发流程",
                "gmtModified": "2023-05-29T09:16Z",
                "iconName": "common",
                "processCode": "PROC-C0CED0C5-1C83-4571-9925-2D404632F847",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "盘点差异调整",
                "gmtModified": "2024-04-15T09:23Z",
                "iconName": "common",
                "processCode": "PROC-810C228F-8FD8-4B80-BAE2-27CD40C0FF36",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "异常订单处理",
                "gmtModified": "2022-05-17T16:33Z",
                "iconName": "common",
                "processCode": "PROC-1B04C1B8-6783-46EA-8FAE-9DFBD69E93B6",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "破损处理流程",
                "gmtModified": "2022-08-24T10:37Z",
                "iconName": "common",
                "processCode": "PROC-19AAF7F9-88B0-41DB-9AB0-C7A5F52757FB",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "残次仓处理",
                "gmtModified": "2021-08-30T18:41Z",
                "iconName": "common",
                "processCode": "PROC-CCD118AD-B9F7-4018-8631-EB75AF3F8FC2",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "1688刷坑产单",
                "gmtModified": "2022-06-06T18:21Z",
                "iconName": "common",
                "processCode": "PROC-9516F4EF-87AD-457B-A017-351245865794",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "残品组合转正品流程",
                "gmtModified": "2022-09-23T11:18Z",
                "iconName": "common",
                "processCode": "PROC-A6699374-5461-4D15-8555-06301E69CCA8",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "管理人员质检",
                "gmtModified": "2024-05-22T12:55Z",
                "iconName": "common",
                "processCode": "PROC-E5F32BEB-D973-4ACD-8682-D52551BD876B",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "库房拆单流程",
                "gmtModified": "2021-10-14T12:40Z",
                "iconName": "common",
                "processCode": "PROC-83D2AE8A-F02D-4A42-BB56-9A6223F68458",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "正品拆配件后转残次仓流程",
                "gmtModified": "2021-11-22T14:14Z",
                "iconName": "common",
                "processCode": "PROC-EA366DE0-9D49-49EC-85FF-CCE4457FDB12",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "京东入仓流程申请",
                "gmtModified": "2023-03-18T15:30Z",
                "iconName": "common",
                "processCode": "PROC-0B02669A-8E76-4B86-B816-2268926C84C4",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "工厂退残流程",
                "gmtModified": "2022-10-31T14:05Z",
                "iconName": "common",
                "processCode": "PROC-1AEBFA95-4192-4C00-9705-AA3B9D8380F6",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "补发配件需求",
                "gmtModified": "2022-04-06T16:09Z",
                "iconName": "common",
                "processCode": "PROC-1469B71E-B16A-41F3-9FF6-FF3C0EFA4086",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "增、减员申请",
                "gmtModified": "2022-05-06T17:10Z",
                "iconName": "fly",
                "processCode": "PROC-C6723CE8-F9A5-4349-8B6C-A8CE1CC0E760",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01LerNcO1ZzsP53zuLJ_!!6000000003266-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "转正（新）",
                "gmtModified": "2023-12-27T14:10Z",
                "iconName": "positive",
                "processCode": "PROC-2CAF9D6E-700E-4FC9-9E16-4262E652C1E6",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01jEGQPU22UqQVqiC9f_!!6000000007124-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "快递、云仓付款申请",
                "gmtModified": "2023-12-20T09:05Z",
                "iconName": "procurement",
                "processCode": "PROC-A2703227-6F6B-4C1E-A590-7AA563A390B8",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01AYTIyi1tsMDVcgNSq_!!6000000005957-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "盖章申请",
                "gmtModified": "2022-09-13T09:25Z",
                "iconName": "inchapter#orange",
                "processCode": "PROC-99D79371-3043-4608-AA6C-1F0DF24BA3E6",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01Lxcogf1ExwnvlqTg1_!!6000000000419-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "残次品结账",
                "gmtModified": "2023-12-07T10:41Z",
                "iconName": "common",
                "processCode": "PROC-DCD2581C-7C3E-4CA9-BF60-980262EB379A",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "市场询价",
                "gmtModified": "2024-03-04T09:40Z",
                "iconName": "common",
                "processCode": "PROC-C4292E7D-09BE-4FC2-BE01-CD8FA3DF08FC",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "拼多多采购选品会流程",
                "gmtModified": "2022-10-05T09:46Z",
                "iconName": "common",
                "processCode": "PROC-0F6524F3-ED80-4616-9879-94CDC7CCBAA9",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "供应商问题沟通表",
                "gmtModified": "2023-10-21T15:42Z",
                "iconName": "common",
                "processCode": "PROC-C723E332-2343-47CC-BF29-A8E3CE945699",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "库房产品报废流程",
                "gmtModified": "2022-10-27T15:23Z",
                "iconName": "common",
                "processCode": "PROC-7BA75459-38D5-41D8-9716-7A6377DD93D1",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "智能合同审批",
                "gmtModified": "2022-11-21T11:19Z",
                "iconName": "contractNew#blue",
                "processCode": "PROC-213F43C6-0126-48C1-A678-B83A7C45BC1B",
                "iconUrl": "https://img.alicdn.com/imgextra/i4/O1CN01SlypYt1nmxrMUl70d_!!6000000005133-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "采购样品报销",
                "gmtModified": "2023-11-01T13:00Z",
                "iconName": "procurement",
                "processCode": "PROC-D980947B-B94A-405F-9197-89EBC14DBCAA",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01AYTIyi1tsMDVcgNSq_!!6000000005957-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "各平台（或定制款）订货下单流程",
                "gmtModified": "2023-12-13T16:26Z",
                "iconName": "common",
                "processCode": "PROC-23A07CC2-80E7-4376-8EDC-6C81F79DFBB8",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "供应商月对账单审批流程",
                "gmtModified": "2023-08-08T09:18Z",
                "iconName": "common",
                "processCode": "PROC-5342D3F0-F29C-4638-A47D-4AA83DD2F1B1",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "南京仓日常费用报销",
                "gmtModified": "2024-03-02T18:46Z",
                "iconName": "common",
                "processCode": "PROC-2F720D2F-EA8D-4532-90E8-9605F5268728",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "库房退款发货流程",
                "gmtModified": "2023-02-10T18:10Z",
                "iconName": "common",
                "processCode": "PROC-51E2833F-A132-4F15-AE91-B0CFE76AE85F",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "网店管家采购单冲抵流程",
                "gmtModified": "2023-12-09T09:42Z",
                "iconName": "common",
                "processCode": "PROC-974A5F3C-620E-424A-8744-2EF7B2B7AB51",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "日常报销",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "behavior",
                "processCode": "PROC-06FF2359-C030-4E4A-A850-C4DE8D30309A",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01XQZ14h1Yv0ZtgabEj_!!6000000003120-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "差旅报销",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "trip",
                "processCode": "PROC-2550F230-0049-4069-9C69-4BD439514D22",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN011JkyFi29g1Ov9ZBPB_!!6000000008096-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "付款单",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "biz#green",
                "processCode": "PROC-D4FF2227-96E0-4412-A03D-660431A66618",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01AvRkiO1QaNoev0iPa_!!6000000001992-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "收款单",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "collection#green",
                "processCode": "PROC-3434B3A0-E194-403E-8100-96A56DB7C1A1",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01nnvt1j21gSrHeYuQm_!!6000000007014-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "备用金",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "common#green",
                "processCode": "PROC-B681BBE0-5839-4C7B-BDA8-8E23339D4F6F",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01N8qCer28EiATxILyj_!!6000000007901-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "备用金核销",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "work_instructions#green",
                "processCode": "PROC-9105CBC6-8897-4564-9842-6371A48574A3",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01D5dZ1K1MbyjV0rt8d_!!6000000001454-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "备用金还款",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "propaganda#green",
                "processCode": "PROC-2E03E73F-D079-4352-9606-468877FDA466",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01rtAVs41ycqt5OaJvg_!!6000000006600-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "应收单",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "datacurve#green",
                "processCode": "PROC-A4D32F84-BCFF-4001-B7DA-E17EBC400943",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01oiIgcQ1gC8heWQmDv_!!6000000004105-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "应收坏账",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "leave#green",
                "processCode": "PROC-17723A33-CA4D-4C08-BFB8-81B1F2650D0C",
                "iconUrl": "https://img.alicdn.com/imgextra/i4/O1CN01Ridjdk28RzefcrHHC_!!6000000007930-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "应收回款",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "exchange#green",
                "processCode": "PROC-F7D81B22-5266-4EEE-A2A5-8B91F35B1885",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01OvKAGK1LiYoDrXmKL_!!6000000001333-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "应付单",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "biz#green",
                "processCode": "PROC-BBC64A42-A166-446F-8589-55583C44905E",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01AvRkiO1QaNoev0iPa_!!6000000001992-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "应付实付",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "payment#green",
                "processCode": "PROC-DEFE9F7F-7F04-443E-A922-4426C6D69B0E",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01nx1AUI28X20h0C6SS_!!6000000007941-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "应付免付",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "biz#green",
                "processCode": "PROC-863DABA1-FA3C-447A-B775-C3C32D8AC7A9",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01AvRkiO1QaNoev0iPa_!!6000000001992-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "转账申请",
                "gmtModified": "2023-02-21T11:06Z",
                "iconName": "exchange#green",
                "processCode": "PROC-7B4BF801-1681-4246-BD7D-4B9B8B46D47E",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01OvKAGK1LiYoDrXmKL_!!6000000001333-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "产品采购问题决策沟通申请",
                "gmtModified": "2024-01-19T09:41Z",
                "iconName": "common",
                "processCode": "PROC-29F902A0-928D-4FA9-A1D6-79B5F146C31D",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "运营新人入职流程",
                "gmtModified": "2023-06-08T10:44Z",
                "iconName": "common",
                "processCode": "PROC-D26F9764-B9DB-486B-AF91-026E5626B93C",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "各物流月拦截情况汇总表",
                "gmtModified": "2023-02-28T17:46Z",
                "iconName": "common",
                "processCode": "PROC-6F29CA06-F234-4418-A2B7-57C26ADCE0B9",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "采购费用报销",
                "gmtModified": "2023-03-10T14:49Z",
                "iconName": "common",
                "processCode": "PROC-767008E6-5B13-4E4A-81B0-A0FF85B2E5B5",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "修改个人档案",
                "gmtModified": "2023-04-28T13:55Z",
                "iconName": "common",
                "processCode": "PROC-BF05723E-5BEE-4F63-BB31-EC5D39DCC758",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "美编任务运营发布",
                "gmtModified": "2023-06-10T09:02Z",
                "iconName": "common",
                "processCode": "PROC-DF174ADF-48AA-4AFE-A536-73AE34B81808",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "采购断货流程",
                "gmtModified": "2023-10-12T08:34Z",
                "iconName": "common",
                "processCode": "PROC-116B1A49-399C-4FF4-9253-7860D03164A8",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "新品开发流程",
                "gmtModified": "2023-06-10T09:27Z",
                "iconName": "datacurve",
                "processCode": "PROC-1A8ABA52-5977-479E-AD82-0D377DFF854B",
                "iconUrl": "https://img.alicdn.com/imgextra/i4/O1CN01CzHOUC1mu0KX4Nx8J_!!6000000005013-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "摄影加美编任务运营发布",
                "gmtModified": "2023-07-07T13:12Z",
                "iconName": "common",
                "processCode": "PROC-0C552879-F50B-403D-AA5E-DD03D1FC8066",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "运营拍摄视频流程",
                "gmtModified": "2023-07-07T16:19Z",
                "iconName": "common",
                "processCode": "PROC-F1DD6C68-D331-448D-BFF7-F7580CDB353A",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "质检",
                "gmtModified": "2023-11-15T09:44Z",
                "iconName": "common",
                "processCode": "PROC-531B1592-A9CA-4C15-96D5-BAA5C0773C90",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "钉钉应用市场申请开通试用",
                "gmtModified": "2023-12-14T09:25Z",
                "iconName": "common",
                "processCode": "PROC-875EF4E6-7000-49A8-92B8-294E195DB936",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 4,
                "flowTitle": "加班申请",
                "gmtModified": "2024-06-11T18:13Z",
                "iconName": "timefades",
                "processCode": "PROC-C37DC990-E2B8-490C-8CB5-929467335263",
                "iconUrl": "https://img.alicdn.com/imgextra/i1/O1CN01iZVS5g1VMi4M2xN0C_!!6000000002639-2-tps-480-480.png"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "公开发布审批",
                "gmtModified": "2023-12-30T15:34Z",
                "iconName": "common",
                "processCode": "PROC-AC74D1E7-90E7-487C-A286-C6BA346F95E3",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 5,
                "flowTitle": "外出申请",
                "gmtModified": "2024-01-29T17:26Z",
                "iconName": "contract",
                "processCode": "PROC-83F7E302-53CF-403D-89BD-4CE8B7A1CDB0",
                "iconUrl": "https://img.alicdn.com/imgextra/i4/O1CN015QEpq61u8O4vtsSLX_!!6000000005992-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "排班审批",
                "gmtModified": "2024-01-31T18:27Z",
                "iconName": "common",
                "processCode": "PROC-7078F5A2-6578-45D6-9D85-D4D4122FC42F",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 2,
                "flowTitle": "因公外出申请",
                "gmtModified": "2024-06-01T16:52Z",
                "iconName": "leave",
                "processCode": "PROC-224DA523-A1E3-4A88-809C-4EB4C8984F44",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01KlxdBZ1RwCITwWURk_!!6000000002175-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "轻量审批-权限申请",
                "gmtModified": "2024-04-27T17:29Z",
                "iconName": "common",
                "processCode": "PROC-F33529A3-0826-47AE-9AE1-75C9CA093902",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "调薪审批（智能薪酬）",
                "gmtModified": "2024-05-09T17:11Z",
                "iconName": "common",
                "processCode": "PROC-E7C5BFFD-B163-4DA1-8AA7-C41500771278",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "定薪审批（智能薪酬）",
                "gmtModified": "2024-05-09T17:11Z",
                "iconName": "common",
                "processCode": "PROC-92ADA372-0041-4903-B8D3-56B0545CF40B",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "发薪审批（智能薪酬）",
                "gmtModified": "2024-05-09T17:11Z",
                "iconName": "common",
                "processCode": "PROC-3FD075C3-9677-4C1B-86C5-98B50D724366",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 2,
                "flowTitle": "员工请假流程",
                "gmtModified": "2024-06-11T14:03Z",
                "iconName": "leave",
                "processCode": "PROC-420A7B11-B6F2-4B6D-9A65-E011BC3EAAB8",
                "iconUrl": "https://img.alicdn.com/imgextra/i3/O1CN01KlxdBZ1RwCITwWURk_!!6000000002175-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "出差申请",
                "gmtModified": "2024-06-01T13:48Z",
                "iconName": "common",
                "processCode": "PROC-130EB513-9B54-4B4A-B04D-16A8022B2135",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "试用期考核审批表",
                "gmtModified": "2024-05-24T16:05Z",
                "iconName": "common",
                "processCode": "PROC-C5423AFA-A84A-4601-93EE-D59712443011",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "转正审批",
                "gmtModified": "2024-05-24T16:30Z",
                "iconName": "common",
                "processCode": "PROC-9B87C8D7-F8F9-4BB8-A5E8-AE47EA96CC2B",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "晋升审批",
                "gmtModified": "2024-05-24T16:47Z",
                "iconName": "common",
                "processCode": "PROC-0D20BA68-4AE8-4B4B-BAFD-FAFCA53DFF03",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "调岗审批",
                "gmtModified": "2024-05-24T18:10Z",
                "iconName": "common",
                "processCode": "PROC-22A6E849-CB12-497B-9644-248C668AFA25",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "离职审批",
                "gmtModified": "2024-06-07T09:01Z",
                "iconName": "common",
                "processCode": "PROC-28FD468C-48AC-4786-AC95-150398F33948",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "部门用品申请流程",
                "gmtModified": "2024-05-24T18:38Z",
                "iconName": "common",
                "processCode": "PROC-C803C63E-6759-477D-8359-B121BA9D9DFC",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            },
            {
                "newProcess": false,
                "attendanceType": 0,
                "flowTitle": "招聘需求审批",
                "gmtModified": "2024-05-24T18:44Z",
                "iconName": "common",
                "processCode": "PROC-8296632A-7F8B-4304-8D6D-5CF3C26515E6",
                "iconUrl": "https://img.alicdn.com/imgextra/i2/O1CN01r8CMaY1suojEoDna3_!!6000000005827-0-tps-480-480.jpg"
            }
        ],
        "success": true
    }

    const url = "https://api.dingtalk.com/v1.0/workflow/processes/managements/templates"
    const params = {userId: userId}
    return await httpUtil.get(url, params, accessToken)
}

/**
 * 获取审批实例ID列表
 *
 * @param accessToken
 * @param data { processCode, startTime, endTime, nextToken, maxResults, userIds, statuses}
 * @returns {Promise<void>}
 */
const getOAProcessIds = async (accessToken, data) => {
    const url = "https://api.dingtalk.com/v1.0/workflow/processes/instanceIds/query"
    return await httpUtil.post(url, data, accessToken)
}

/**
 * 获取单个审批实例详情
 *
 * @param accessToken
 * @param processInstanceId
 * @returns {Promise<*|undefined>}
 */
const getOAProcessDetails = async (accessToken, processInstanceId) => {
    const params = {processInstanceId}
    const url = "https://api.dingtalk.com/v1.0/workflow/processInstances"
    return await httpUtil.get(url, params, accessToken)
}

module.exports = {
    getAttendances,
    getOAProcessTemplates,
    getOAProcessIds,
    getOAProcessDetails
}