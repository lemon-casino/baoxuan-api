const sqlPrint = (sql, params = [], options = {}) => {
const {
        placeholder = '?', // 占位符
        escape = true,     // 是否转义参数
        strict = true      // 严格模式：参数数量必须匹配
    } = options;
    
    if (strict && (sql.split(placeholder).length - 1) !== params.length) {
        throw new Error(`参数数量不匹配: SQL需要 ${sql.split(placeholder).length - 1} 个参数，实际提供 ${params.length} 个`);
    }
    
    // 参数转义函数
    const escapeValue = (value) => {
        if (!escape) return value;
        
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value ? 1 : 0;
        
        // 字符串转义
        return `'${String(value).replace(/'/g, "''")}'`;
    };
    
    let paramIndex = 0;
    let result = '';
    let lastIndex = 0;
    let placeholderIndex = sql.indexOf(placeholder);
    
    while (placeholderIndex !== -1 && paramIndex < params.length) {
        // 添加占位符前的文本
        result += sql.substring(lastIndex, placeholderIndex);
        
        // 添加参数值
        result += escapeValue(params[paramIndex]);
        
        paramIndex++;
        lastIndex = placeholderIndex + placeholder.length;
        placeholderIndex = sql.indexOf(placeholder, lastIndex);
    }
    
    // 添加剩余文本
    result += sql.substring(lastIndex);
    console.warn('SQL打印：',result)
}
module.exports = { sqlPrint }
