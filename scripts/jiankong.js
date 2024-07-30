const redis = require('redis');
const client = redis.createClient();

// Redis 键定义
const key_running_finished = 'flows:today:running_and_finished';
const key_new_set = 'flows:today:running_and_finished_027086325D5B4B24885D75A541FD633E7AMV';
const formUuid_pattern = 'FORM-027086325D5B4B24885D75A541FD633E7AMV';

// 监听 flows:today:running_and_finished 的变化
client.on('message', (channel, message) => {
    if (channel === key_running_finished) {
        processRunningFinishedChange();
    }
});

// 订阅 flows:today:running_and_finished
client.subscribe(key_running_finished).then(r => {
    console.log("-------------")
});

// 处理变化逻辑
function processRunningFinishedChange() {
    client.hgetall(key_running_finished, (err, data) => {
        if (err) {
            console.error('Error retrieving data from Redis:', err);
            return;
        }

        // 获取符合条件的对象
        const matchingObjects = getMatchingObjects(data);

        // 将匹配的对象存储到新的集合中
        storeMatchingObjects(matchingObjects);
    });
}

// 获取符合条件的对象
function getMatchingObjects(data) {
    const matchingObjects = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = JSON.parse(data[key]);
            if (value.formUuid === formUuid_pattern) {
                matchingObjects[key] = data[key];
            }
        }
    }
    return matchingObjects;
}

// 将符合条件的对象存储到新的集合中
function storeMatchingObjects(matchingObjects) {
    for (const key in matchingObjects) {
        if (matchingObjects.hasOwnProperty(key)) {
            client.hset(key_new_set, key, matchingObjects[key], (err, reply) => {
                if (err) {
                    console.error('Error storing data in Redis:', err);
                    return;
                }
                console.log(`Stored ${key} in ${key_new_set}`);
            });
        }
    }
}
