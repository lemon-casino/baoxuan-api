const bpmConst = {
    host: 'http://bpm.pakchoice.cn:48080/baoxuan',
    webHost: 'http://bpm.pakchoice.cn:48080',
    webLink: {
        instanceDetail: '/bpm/process-instance/detail?id='
    },
    headers: {
        Authorization: 'Bearer test-admin',
        'Tenant-Id': 1
    },
    link: {
        refreshToken: '/admin-api/system/auth/refresh-token',
        createProcessInstance: '/admin-api/bpm/process-instance/create',
        uploadFile: '/admin-api/infra/file/upload'
    },
    params: {
        createProcessInstance: {
            processDefinitionId: '',
            variables: {},
            startUserSelectAssignees: {},
            refreshToken: '',
        }
    }
}

module.exports = bpmConst;