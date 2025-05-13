const bpmConst = {
    host: 'http://localhost:48080',
    webHost: 'http://localhost:5173',
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