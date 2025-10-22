const {success} = require("@/utils/biResponse");
const {errorMessages} = require("@/const/errorConst");

class Validator {
    static validate(bodyRules = {}) {
        return (req, res, next) => {
            const errors = [];

            // 检查是否存在请求体
            if (Object.keys(bodyRules).length > 0 && (!req.body || Object.keys(req.body).length === 0)) {
                errors.push({location: 'body', message: '请求体是必须的'});
            }

            // 验证请求体参数
            for (const [param, rule] of Object.entries(bodyRules)) {
                const value = req.body[param];
                if (rule.each) {
                    // 验证数组中的每个元素

                    if (Array.isArray(value)) {
                        console.log("来到这里", value, rule, errors, 'body', param)
                        Validator.checkParam(value, rule, errors, 'body', param);
                        value.forEach((item, index) => {
                            console.log(item, rule.each, errors, 'body', `${param}[${index}]`)
                            Validator.checkParam(item, rule.each, errors, 'body', `${param}[${index}]`);
                        });
                    } else {
                        // 查看外层的required 是否为true 如果为true 则报错
                        if (rule.required) {
                            errors.push({location: 'body', param, message: `${param} 是必须的`});
                        } else {

                        }
                    }
                } else {
                    // 标准参数验证
                    Validator.checkParam(value, rule, errors, 'body', param);
                }
            }

            if (errors.length > 0) {
                return res.send({
                    code: 203,
                    message: errors.reduce((acc, cur) => {
                        const existing = acc.find(item => item.param === cur.param);
                        if (existing) {
                            existing.message += `,${cur.message}`;
                        } else {
                            acc.push(cur);
                        }
                        return acc;
                    }, [])
                });
            }

            next();
        };
    }

    static checkParam(value, rule, errors, location, param) {
        if (rule.required && (value === undefined || value === null)) {
            errors.push({location, param, message: `${param} 是必须的`});
            return;
        }

        if (value !== undefined && value !== null) {
            if (rule.type && !Validator.checkType(value, rule.type)) {
                errors.push({location, param, message: `${param} 必须是 ${rule.type} 类型`});
            }

            if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
                errors.push({location, param, message: `${param} 至少需要 ${rule.minLength} 个字符`});
            }

            //array 数组的长度的验证
            if (rule.minLength && Array.isArray(value) && value.length < rule.minLength) {
                errors.push({location, param, message: `${param} 至少需要 ${rule.minLength} 个元素`});
            }

            if (rule.regex && !rule.regex.test(value)) {
                errors.push({location, param, message: `${param} 无效`});
            }

            if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
                errors.push({location, param, message: `${param} 至少需要 ${rule.min}`});
            }

            if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
                errors.push({location, param, message: `${param} 不能超过 ${rule.max}`});
            }

            if (rule.properties) {
                // 验证对象的每个属性
                for (const [prop, propRule] of Object.entries(rule.properties)) {
                    Validator.checkParam(value[prop], propRule, errors, location, `${param}.${prop}`);
                }
            }
        }
    }

    static checkType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number';
            case 'boolean':
                return typeof value === 'boolean';
            case 'object':
                return value !== null && typeof value === 'object' && !Array.isArray(value);
            case 'array':
                return Array.isArray(value);
            case 'null':
                return value === null;
            case 'undefined':
                return value === undefined;
            default:
                return false;
        }
    }
}


/* const registerBodyRules = {
  username: { required: true, type: 'string' },
  password: { required: true, type: 'string', minLength: 6 },
  email: { required: true, type: 'string', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, minLength: 6 },
  age: { required: false, type: 'number', min: 18 },
  termsAccepted: { required: true, type: 'boolean' }
  exclude: {required: false, type: "array", minLength: 1,
  each: {type: 'object',properties: {field: {required: true, type: 'string', regex: /^[A-Za-z0-9]+$/}
        }
        }
    }
};*/


module.exports = Validator;
