# 开发流程定时同步任务说明

## 执行时机
- 在 `scripts/scheduledTask.js` 中，`processSync` 表达式为 `0 */2 * * * ?`，仅在生产环境每 2 分钟触发一次。
- 任务顺序依次调用 `processService.syncDevelopmentProcessFormFields()` 与 `processService.syncDevelopmentProcessRunningNodes()`，异常会记录到 `[DevelopmentProcessSync]` 日志。

## 表单字段同步（syncDevelopmentProcessFormFields）
- 拉取需要同步的开发流程清单及其 `process_info` 数据，并对同一字段按“优先非空”的原则合并。
- 基础字段：根据 `DEVELOPMENT_PROCESS_FIELD_SYNC_CONFIGS` 定义，将“京东是否选中 / 事业一二三部是否选中”“类目选择”“产品线简称”“采购形式”等常规表单值写回 `development_process`，对勾选类字段存储为 1（选中）、0（未选中）、3（缺字段）、4（空值）。
- 市场分析：合并旧版“反推-运营提供市场分析”、新版“市场分析上传”以及全流程“事业一部/二部/三部市场分析上传”三类来源，按表单标题分组后序列化为 JSON 存入 `analysis` 字段。
- 事业部归属：
  - `syybyycl` 流程且推品类型为 “IP推品” 时，使用 `ip-运营事业部`；
  - `fantuituipin`/`fttplc` 取 `运营事业部`；
  - 其余 `syybyycl` 以 `运营事业部` 兜底，结果写入 `develop_type`。
- 市场分析名称：根据推品类型决定来源——供应商推品用“推品名称”，反推推品用“参考-产品简称”，自研/IPP 推品用“市场分析名称”，写入 `analysis_name`。
- 采购/订货方式：
  - `采购形式` 原样同步到 `purchase_type` 和 `order_type`；
  - `是否代发` 规范化为“代发/订货”，同时刷新 `purchase_type` 和 `order_type`；
  - 订货量通过“实际订货量”去重合并为 JSON 写入 `order_num`。
- 其他字段：
  - 视觉类型、选中平台（JSON 数组）、运营负责人按是否京东分配到对应字段；
  - 上架完成的链接 ID 按平台分三组写入 `first_goods_id`、`second_goods_id`、`third_goods_id`；
  - 扩展字段批量归并：立项性质、设计定义、产品开发性质、核心立项理由、预计大货时间、预计样品确认时间、是否自主设计、样品图片、北京/杭州设计草图、专利归属、专利二级、采购/订货方式等；
  - 同步流程状态到 `process_status`。
- 仅当目标值与当前数据不一致时才执行数据库更新，避免无效写入。

## 运行节点同步（syncDevelopmentProcessRunningNodes）
- 汇总开发类流程中运行中的任务，按流程 ID 聚合并生成 `流程标题:任务内容-处理人` 的分号分隔字符串。
- 若生成的运行节点字符串与现有值不同则写回 `running_node`，当某个 UID 不再有运行中的任务时会将其字段重置为 `null`。
