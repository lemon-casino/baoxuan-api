/**
 * 获取树形结构数据
 * @param data 数据
 * @param level 父id层级
 * @param idField 字段名
 * @param pidField 上一级字段名
 * @returns {null|[]}
 */
const getTreeData = function (
  data,
  level = null,
  idField = "menu_id",
  pidField = "parent_id"
) {
  const _level = [];
  // 第一次进来获取所有父id
  if (level === null) {
    data.forEach(function (item) {
      _level.push(item[pidField]);
    });
    level = Math.min(..._level);
  }
  let prefixPath = "";
  const getTreeInnerData = (
    data,
    level,
    idField = "menu_id",
    pidField = "parent_id"
  ) => {
    const tree = [];
    data.forEach(function (item) {
      if (item[pidField] === level) {
        tree.push(item);
      }
    });
    if (tree.length === 0) {
      return null;
    }
    // 对于父id为0的进行循环，然后查出父节点为上面结果id的节点内容
    tree.forEach(function (item) {
      if (item.type !== "B") {
        if (_level.includes(item[idField])) prefixPath += "/" + item.path;
        const childData = getTreeInnerData(
          data,
          item[idField],
          idField,
          pidField
        );
        if (childData != null) {
          item["menuPath"] = prefixPath;
          item["children"] = childData;
          prefixPath = "";
        } else {
          item["menuPath"] = prefixPath + "/" + item.path;
        }
      }
    });
    return tree;
  };
  return getTreeInnerData(data, level, idField, pidField);
};
/**
 * 获取两个数组差集
 * @param arr1
 * @param arr2
 * @returns {*[]}
 */
const minustArr = function (arr1 = [], arr2 = []) {
  return arr1.filter(function (v) {
    return arr2.indexOf(v) === -1;
  });
};
/**
 * 时间日期转换
 * @param date 当前时间，new Date() 格式
 * @param format 需要转换的时间格式字符串
 * @description format 字符串随意，如 `YYYY-mm、YYYY-mm-dd`
 * @description format 季度："YYYY-mm-dd HH:MM:SS QQQQ"
 * @description format 星期："YYYY-mm-dd HH:MM:SS WWW"
 * @description format 几周："YYYY-mm-dd HH:MM:SS ZZZ"
 * @description format 季度 + 星期 + 几周："YYYY-mm-dd HH:MM:SS WWW QQQQ ZZZ"
 * @returns 返回拼接后的时间字符串
 */
const formatDateTime = (date, format) => {
  let we = date.getDay(); // 星期
  let z = getWeek(date); // 周
  let qut = Math.floor((date.getMonth() + 3) / 3).toString(); // 季度
  const opt = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getUTCMonth() + 1).toString(), // 月(月份从0开始，要+1)
    "d+": date.getUTCDate().toString(), // 日
    "H+": date.getUTCHours().toString(), // 时
    "M+": date.getUTCMinutes().toString(), // 分
    "S+": date.getUTCSeconds().toString(), // 秒
    "q+": qut, // 季度
  };
  // 中文数字 (星期)
  const week = {
    0: "日",
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
  };
  // 中文数字（季度）
  const quarter = {
    1: "一",
    2: "二",
    3: "三",
    4: "四",
  };
  if (/(W+)/.test(format))
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length > 1
        ? RegExp.$1.length > 2
          ? "星期" + week[we]
          : "周" + week[we]
        : week[we]
    );
  if (/(Q+)/.test(format))
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length == 4 ? "第" + quarter[qut] + "季度" : quarter[qut]
    );
  if (/(Z+)/.test(format))
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length == 3 ? "第" + z + "周" : z + ""
    );
  for (let k in opt) {
    let r = new RegExp("(" + k + ")").exec(format);
    // 若输入的长度不为1，则前面补零
    if (r)
      format = format.replace(
        r[1],
        RegExp.$1.length == 1 ? opt[k] : opt[k].padStart(RegExp.$1.length, "0")
      );
  }
  return format;
};
/**
 * 获取当前日期是第几周
 * @param dateTime 当前传入的日期值
 * @returns 返回第几周数字值
 */
const getWeek = (dateTime) => {
  let temptTime = new Date(dateTime.getTime());
  // 周几
  let weekday = temptTime.getDay() || 7;
  // 周1+5天=周六
  temptTime.setDate(temptTime.getDate() - weekday + 1 + 5);
  let firstDay = new Date(temptTime.getFullYear(), 0, 1);
  let dayOfWeek = firstDay.getDay();
  let spendDay = 1;
  if (dayOfWeek != 0) spendDay = 7 - dayOfWeek + 1;
  firstDay = new Date(temptTime.getFullYear(), 0, 1 + spendDay);
  let d = Math.ceil((temptTime.valueOf() - firstDay.valueOf()) / 86400000);
  let result = Math.ceil(d / 7);
  return result;
};

module.exports = {
  getTreeData,
  minustArr,
  formatDateTime,
};
