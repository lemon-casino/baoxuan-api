const recruitmentStatisticRepo = require('@/repository/recruitment/recruitmentStatisticRepo');
const curriculumVitaeRepo = require('@/repository/curriculumVitaeRepo');
const TARGET_SHIPS = [
        {label: '初选通过', ship: 1},
        {label: '面试通过', ship: 4},
        {label: '已发offer', ship: 5},
        {label: '面试淘汰', ship: 6},
        {label: '简历淘汰', ship: 7},
        {label: '试用淘汰', ship: 10},
        {label: '收简历数', ship: 8},
];
const CURRICULUM_VITAE_SHIPS = new Set([8]);
const parseDay = (value) => {
        if (typeof value !== 'string') {
                return null;
        }
        const trimmed = value.trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                return null;
        }
        const date = new Date(trimmed);
        if (Number.isNaN(date.getTime())) {
                return null;
        }
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const parseMonth = (value) => {
        if (typeof value !== 'string') {
                return null;
        }
        const trimmed = value.trim();
        if (!/^\d{4}-\d{2}$/.test(trimmed)) {
                return null;
        }
        const [yearString, monthString] = trimmed.split('-');
        const year = Number(yearString);
        const monthIndex = Number(monthString) - 1;
        if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
                return null;
        }
        return new Date(year, monthIndex, 1);
};

const resolveDateRange = (query = {}) => {
        const period = typeof query.period === 'string' ? query.period.trim().toLowerCase() : 'day';
        const now = new Date();

        if (period === 'month') {
                const monthStart = parseMonth(query.month) || new Date(now.getFullYear(), now.getMonth(), 1);
                const endDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
                return {
                        period: 'month',
                        startDate: monthStart,
                        endDate,
                };
        }

        const dayStart = parseDay(query.date) || new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDate = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + 1);
        return {
                period: 'day',
                startDate: dayStart,
                endDate,
        };
};

const getCurriculumVitaeShipStatistics = async (query) => {
	const recruitmentShips = TARGET_SHIPS.filter((item) => !CURRICULUM_VITAE_SHIPS.has(item.ship));
        let startDate = query.startDate , endDate = query.endDate
        let rows = await recruitmentStatisticRepo.getCurriculumVitaeShipStatistics(startDate,endDate)
        const counts = new Map(rows.map((row) => [row.ship, row.count]));
        let rows1 = await recruitmentStatisticRepo.getHrCount(startDate,endDate)
        let rows2 = await recruitmentStatisticRepo.getJobCount(startDate,endDate)
        let items=TARGET_SHIPS.map((item) => ({
                ...item,
                count: counts.get(item.ship) ?? 0,
                hr:[],
                job:[]
        }))
        items = items.map(item => {
                return {
                    ...item,
                    hr: rows1.filter(hrItem => hrItem.ship === item.ship),
                    job: rows2.filter(jobItem => jobItem.ship === item.ship)
                };
            });
        return {
                items
        }
};

module.exports = {
        getCurriculumVitaeShipStatistics,
};
