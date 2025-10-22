const normalizeStatus = (status = '') => status.replace(/\s+/g, '').toLowerCase();

const STATUS_TO_SHIP = new Map(
        [
                ['初选通过', 1],
                ['约面', 2],
                ['一面', 3],
                ['二面', 3],
                ['三面', 3],
                ['四面', 3],
                ['面试通过', 4],
                ['Offer', 5],
                ['回绝Offer', 6],
                ['候选人拒绝', 6],
                ['终止该候选人', 6],
                ['面试未通过', 6],
                ['面试爽约', 6],
        ].map(([status, ship]) => [normalizeStatus(status), ship])
);

const DEFAULT_SHIP = 8;

const SHIP_PRIORITY = {
        8: 0,
        1: 10,
        2: 20,
        3: 30,
        4: 40,
        5: 50,
        6: 60,
        7: 100,
};

const resolveShip = (status) => {
        if (typeof status !== 'string') {
                return null;
        }
        const normalized = normalizeStatus(status);
        return STATUS_TO_SHIP.get(normalized) ?? null;
};

module.exports = {
        normalizeStatus,
        STATUS_TO_SHIP,
        DEFAULT_SHIP,
        SHIP_PRIORITY,
        resolveShip,
};
