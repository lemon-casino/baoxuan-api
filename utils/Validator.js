class Validator {
    static validate(bodyRules = {}) {
        return (req, res, next) => {
            const errors = [];
            // 检查 body 是否存在
            if (Object.keys(bodyRules).length > 0 && (!req.body || Object.keys(req.body).length === 0)) {
                errors.push({location: 'body', message: 'Request body is required'});
            }

            // 校验 body 参数
            for (const [param, rule] of Object.entries(bodyRules)) {
                const value = req.body[param];
                Validator.checkParam(value, rule, errors, 'body', param);
            }

            if (errors.length > 0) {
                return res.status(400).json({errors});
            }

            next();
        };
    }

    static checkParam(value, rule, errors, location, param) {
        if (rule.required && (value === undefined || value === null)) {
            errors.push({location, param, message: `${param} 是必填项`});
            return;
        }

        if (value !== undefined && value !== null) {
            if (rule.type && !Validator.checkType(value, rule.type)) {
                errors.push({location, param, message: `${param} 必须是 ${rule.type} 类型`});
            }

            if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
                errors.push({location, param, message: `${param} 必须至少 ${rule.minLength} 个字符长度`});
            }

            if (rule.regex && !rule.regex.test(value)) {
                errors.push({location, param, message: `${param} 不合法`});
            }

            if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
                errors.push({location, param, message: `${param} 必须至少为 ${rule.min}`});
            }

            if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
                errors.push({location, param, message: `${param} 必须最多为 ${rule.max}`});
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

/*
 const registerBodyRules = {
  username: { required: true, type: 'string' },
  password: { required: true, type: 'string', minLength: 6 },
  email: { required: true, type: 'string', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, minLength: 6 },
  age: { required: false, type: 'number', min: 18 },
  termsAccepted: { required: true, type: 'boolean' }
};
* */

module.exports = Validator;