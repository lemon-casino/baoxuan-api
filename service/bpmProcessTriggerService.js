const credentialsReq = require('@/core/dingDingReq/credentialsReq');
const httpUtil = require('@/utils/httpUtil');
const {logger} = require('@/utils/log');

const PROCESS_DEFINITION_ID = 'tianmaofppg:3:7819bfde-ae2d-11f0-9dae-4e87a9367e20';
const CREATE_PROCESS_URL = 'http://bpm.pakchoice.cn:48080/admin-api/bpm/process-instance/create';

const VARIABLE_PRESETS = [
	{Ftk6mgw1iqxyduc: '天猫助理', Cfid16gxfaf8o: 339, Cfid67n33h9b7: 154},
	{Ftk6mgw1iqxyduc: '天猫助理', Cfid16gxfaf8o: 340, Cfid67n33h9b7: 154},
	{Ftk6mgw1iqxyduc: '天猫助理', Cfid16gxfaf8o: 339, Cfid67n33h9b7: 153},
	{Ftk6mgw1iqxyduc: '天猫助理', Cfid16gxfaf8o: 340, Cfid67n33h9b7: 153},
	{Ftk6mgw1iqxyduc: '天猫助理', Cfid16gxfaf8o: 342, Cfid67n33h9b7: 357},
	{Ftk6mgw1iqxyduc: '天猫助理', Cfid16gxfaf8o: 342, Cfid67n33h9b7: 231},
	{Ftk6mgw1iqxyduc: '天猫助理', Cfid16gxfaf8o: 342, Cfid67n33h9b7: 158},
	{Ftk6mgw1iqxyduc: '天猫运营', Cfid16gxfaf8o: 357, Cfid67n33h9b7: 158},
	{Ftk6mgw1iqxyduc: '天猫运营', Cfid16gxfaf8o: 231, Cfid67n33h9b7: 158},
	{Ftk6mgw1iqxyduc: '天猫运营', Cfid16gxfaf8o: 154, Cfid67n33h9b7: 153},
];

const buildRequestPayload = (variables) => ({
	processDefinitionId: PROCESS_DEFINITION_ID,
	variables: {...variables},
	startUserSelectAssignees: {},
});

const triggerTmallEvaluationProcesses = async () => {
	const tokenResponse = await credentialsReq.getBpmgAccessToken();
	const accessToken = tokenResponse?.data?.accessToken;

	if (!accessToken) {
		throw new Error('Failed to obtain BPM access token for process creation');
	}

	const headers = {
		Authorization: `Bearer ${accessToken}`,
		'Tenant-Id': 1,
	};
console.log('accessToken', accessToken);
console.log('headers', headers);
	for (const variables of VARIABLE_PRESETS) {
		const payload = buildRequestPayload(variables);
		logger.info(
			'[BpmProcessTrigger] Submitting process instance for %s with operator %d and assessor %d',
			variables.Ftk6mgw1iqxyduc,
			variables.Cfid16gxfaf8o,
			variables.Cfid67n33h9b7,
		);
		await httpUtil.post(CREATE_PROCESS_URL, payload, headers);
	}
};

module.exports = {
	triggerTmallEvaluationProcesses,
};