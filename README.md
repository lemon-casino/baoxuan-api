## 数据库

### 导入数据库文件

新建数据库并导入 sql 目录下的 **database.sql**

### 修改数据库信息

根据自身修改 model 目录下的 init.js

```js
const sequelize = new Sequelize(
  // 以下内容根据自身修改
  'react_antd_admin', // 数据库名
  'root', // 连接用户名
  '123456', // 密码
  {
    dialect: 'mysql', // 数据库类型
    host: '127.0.0.1', // ip
    port: 3306, // 端口
    define: {
      timestamps: false // 不自动创建时间
    },
    timezone: '+08:00' // 东八时区
  }
)
```

## 项目安装

```
npm install
```

### 启动项目

```
npm run start
```

## 接口地址
#### vue3+ts+nodeJS 后台管理系统接口文档（接口地址+参数）


##### 后端服务地址

http://127.0.0.1:9999

##### 公共模块

1. 每个接口 header 需要的参数值（公共、登录模块不需要）

   | 参数名 | 类型   | 是否必选 | 备注     |
      | ------ | ------ | -------- | -------- |
   | token  | String | 是       | 接口密钥 |

2. 刷新 token
   **接口地址**：http://127.0.0.1:9999/user/refreshToken
   **接口连接方式**：POST
   **接口所需参数**：

   | 参数名       | 类型   | 是否必选 | 备注           |
      | ------------ | ------ | -------- | -------------- |
   | refreshToken | String | 是       | 刷新token |

##### 登录模块

1. 获取验证码

   **接口地址**：http://127.0.0.1:9999/user/checkCode
   **接口连接方式**：GET
   **接口所需参数（Query 参数）**：

   | 参数名 | 类型   | 是否必选 | 备注           |
      | ------ | ------ | -------- | -------------- |
   | uuid   | number | 是       | 图形验证码键值 |

2. 登录
   **接口地址**：http://127.0.0.1:9999/user/login
   **接口连接方式**：POST
   **接口所需参数**：

   | 参数名    | 类型   | 是否必选 | 备注           |
      | --------- | ------ | -------- | -------------- |
   | username  | String | 是       | 用户名         |
   | password  | String | 是       | 密码           |
   | checkCode | String | 是       | 图形验证码     |
   | uuid      | number | 是       | 图形验证码键值 |

##### 用户模块

1. 获取用户列表

   **接口地址**：http://127.0.0.1:9999/user/list
   **接口连接方式**：GET
   **接口所需参数（Query 参数）**：

   | 参数名      | 类型   | 是否必选 | 备注     |
      | ----------- | ------ | -------- | -------- |
   | pageSize    | number | 是       | 每页数量 |
   | currentPage | number | 是       | 页码     |
   | username    | String | 否       | 用户名   |
   | status      | Char   | 否       | 状态     |

2. 添加用户

   **接口地址**：http://127.0.0.1:9999/user/addUser
   **接口连接方式**：POST

   **接口所需参数**：

   | 参数名   | 类型   | 是否必选 | 备注         |
      | -------- | ------ | -------- | ------------ |
   | username | String | 是       | 用户名       |
   | password | String | 是       | 密码         |
   | role_ids | Array  | 是       | 角色 id 数组 |
   | nickname | String | 否       | 昵称         |
   | email    | String | 否       | 邮箱         |
   | status   | Char   | 否       | 状态         |

3. 修改用户

   **接口地址**：http://127.0.0.1:9999/user/editUser/:user_id
   **接口连接方式**：POST

   **接口所需参数（Query 参数）**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | user_id | number | 是       | 用户 id |

   **接口所需参数**：

   | 参数名   | 类型   | 是否必选 | 备注         |
      | -------- | ------ | -------- | ------------ |
   | username | String | 是       | 用户名       |
   | role_ids | Array  | 是       | 角色 id 数组 |
   | nickname | String | 否       | 昵称         |
   | email    | String | 否       | 邮箱         |
   | status   | Char   | 否       | 状态         |

4. 删除用户

   **接口地址**：http://127.0.0.1:9999/user/delUser
   **接口连接方式**：POST
   **接口所需参数**：

   | 参数名  | 类型          | 是否必选 | 备注    |
      | ------- | ------------- | -------- | ------- |
   | user_id | number、Array | 是       | 用户 id |

5. 根据 id 获取用户信息

   **接口地址**：http://127.0.0.1:9999/user/queryUserInfo/:user_id
   **接口连接方式**：GET
   **接口所需参数（Params 参数）**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | user_id | number | 是       | 用户 id |

6. 重置密码

   **接口地址**：http://127.0.0.1:9999/user/editPwd
   **接口连接方式**：POST
   **接口所需参数**：

   | 参数名       | 类型   | 是否必选 | 备注     |
      | ------------ | ------ | -------- | -------- |
   | user_id      | number | 是       | 用户 id  |
   | old_password | string | 是       | 旧密码   |
   | password     | string | 是       | 新密码   |
   | repassword   | string | 是       | 确认密码 |

##### 角色模块

1. 获取角色列表

   **接口地址**：http://127.0.0.1:9999/user/role/listRole
   **接口连接方式**：GET
   **接口所需参数（Query 参数）**：

   | 参数名      | 类型   | 是否必选 | 备注     |
      | ----------- | ------ | -------- | -------- |
   | pageSize    | number | 是       | 每页数量 |
   | currentPage | number | 是       | 页码     |
   | role_name   | String | 否       | 角色名   |

2. 添加角色

   **接口地址**：http://127.0.0.1:9999/user/role/addRole
   **接口连接方式**：POST

   **接口所需参数**：

   | 参数名    | 类型   | 是否必选 | 备注   |
      | --------- | ------ | -------- | ------ |
   | role_name | String | 是       | 角色名 |
   | remark    | String | 否       | 描述   |
   | status    | Char   | 否       | 状态   |

3. 修改角色

   **接口地址**：http://127.0.0.1:9999/user/role/editRole
   **接口连接方式**：POST
   **接口所需参数（Query 参数）**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | role_id | number | 是       | 角色 id |

   **接口所需参数**：

   | 参数名    | 类型   | 是否必选 | 备注   |
      | --------- | ------ | -------- | ------ |
   | role_name | String | 是       | 角色名 |
   | remark    | String | 否       | 描述   |
   | status    | Char   | 否       | 状态   |

4. 根据 id 获取角色信息

   **接口地址**：http://127.0.0.1:9999/user/role/getRole
   **接口连接方式**：GET
   **接口所需参数（Query 参数）**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | role_id | number | 是       | 角色 id |

5. 删除角色

   **接口地址**：http://127.0.0.1:9999/user/role/delRole
   **接口连接方式**：POST
   **接口所需参数**：

   | 参数名   | 类型  | 是否必选 | 备注    |
      | -------- | ----- | -------- | ------- |
   | role_ids | Array | 是       | 角色 id |

6. 获取所有角色

   **接口地址**：http://127.0.0.1:9999/user/role/allRole
   **接口连接方式**：GET

7. 获取角色权限

   **接口地址**：http://127.0.0.1:9999/user/role/roleResource
   **接口连接方式**：GET
   **接口所需参数（Query 参数）**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | role_id | number | 是       | 角色 id |

8. 更新角色权限

   **接口地址**：http://127.0.0.1:9999/user/role/updateRoleResource
   **接口连接方式**：POST
   **接口所需参数（Query 参数）**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | role_id | number | 是       | 角色 id |

   **接口所需参数**：

   | 参数名   | 类型  | 是否必选 | 备注         |
      | -------- | ----- | -------- | ------------ |
   | menu_ids | Array | 是       | 菜单 id 数组 |

##### 菜单模块

1. 获取菜单列表

   **接口地址**：http://127.0.0.1:9999/user/menu/listMenu
   **接口连接方式**：GET
   **接口所需参数（Query 参数）**：

   | 参数名 | 类型   | 是否必选 | 备注     |
      | ------ | ------ | -------- | -------- |
   | title  | String | 否       | 菜单标题 |

2. 添加菜单

   **接口地址**：http://127.0.0.1:9999/user/menu/addMenu
   **接口连接方式**：POST

   **接口所需参数**：

   | 参数名     | 类型   | 是否必选       | 备注         |
      | ---------- | ------ | -------------- | ------------ |
   | parent_id  | number | 是             | 权限父 id    |
   | title      | String | 是             | 权限标题     |
   | sort       | number | 是             | 权限排序     |
   | type       | String | 是             | 权限类别     |
   | name       | String | 是             | 路由名       |
   | component  | String | 否（菜单必选） | 路由文件地址 |
   | path       | String | 否（菜单必选） | 路由地址     |
   | redirect   | String | 否             | 重定向地址   |
   | permission | String | 否（按钮必选） | 权限标识     |
   | hidden     | String | 否             | 菜单是否隐藏 |
   | icon       | String | 否             | 菜单图标     |

3. 修改菜单

   **接口地址**：http://127.0.0.1:9999/user/menu/editMenu
   **接口连接方式**：POST

   **接口所需参数（Query 参数）**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | menu_id | number | 是       | 菜单 id |

   **接口所需参数**：

   | 参数名     | 类型   | 是否必选       | 备注         |
      | ---------- | ------ | -------------- | ------------ |
   | parent_id  | number | 是             | 权限父 id    |
   | title      | String | 是             | 权限标题     |
   | sort       | number | 是             | 权限排序     |
   | type       | String | 是             | 权限类别     |
   | name       | String | 是             | 路由名       |
   | component  | String | 否（菜单必选） | 路由文件地址 |
   | path       | String | 否（菜单必选） | 路由地址     |
   | redirect   | String | 否             | 重定向地址   |
   | permission | String | 否（按钮必选） | 权限标识     |
   | hidden     | String | 否             | 菜单是否隐藏 |
   | icon       | String | 否             | 菜单图标     |

4. 根据 id 获取菜单

   **接口地址**：http://127.0.0.1:9999/user/menu/getMenu
   **接口连接方式**：GET
   **接口所需参数（Query 参数）**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | menu_id | number | 是       | 菜单 id |

5. 删除菜单

   **接口地址**：http://127.0.0.1:9999/user/menu/delMenu
   **接口连接方式**：POST
   **接口所需参数**：

   | 参数名  | 类型   | 是否必选 | 备注    |
      | ------- | ------ | -------- | ------- |
   | menu_id | number | 是       | 菜单 id |

6. 获取菜单项

   **接口地址**：http://127.0.0.1:9999/user/menu/listMenuOptions
   **接口连接方式**：GET

##### 用户信息模块（已登录用户）

1. 获取用户信息

   **接口地址**：http://127.0.0.1:9999/user/myInfo/userinfo
   **接口连接方式**：GET

2. 更新用户信息

   **接口地址**：http://127.0.0.1:9999/user/myInfo/updateUserinfo
   **接口连接方式**：POST

   **接口所需参数**：

   | 参数名   | 类型   | 是否必选 | 备注   |
      | -------- | ------ | -------- | ------ |
   | username | String | 否       | 用户名 |
   | nickname | String | 否       | 昵称   |
   | email    | String | 否       | 邮箱   |

3. 更新用户密码

   **接口地址**：http://127.0.0.1:9999/user/myInfo/updatePwd
   **接口连接方式**：POST
   **接口所需参数**：

   | 参数名       | 类型   | 是否必选 | 备注     |
      | ------------ | ------ | -------- | -------- |
   | old_password | string | 是       | 旧密码   |
   | password     | string | 是       | 新密码   |
   | repassword   | string | 是       | 确认密码 |

4. 更新用户头像
   **接口地址**：http://127.0.0.1:9999/user/myInfo/updateAvatar
   **接口连接方式**：POST

   **接口请求方式**：form-data

   **接口所需参数**：

   | 参数名 | 类型   | 是否必选 | 备注     |
      | ------ | ------ | -------- | -------- |
   | file   | object | 是| 头像文件 |


------
# 单品表
## 淘宝
> 线上正式端口号：9999  测试端口号：7999

|说明|地址|请求方式|参数|返回结果|
| --- |--- |----|----|----|
|获取token|http://47.95.1.102:7999/user/tokens|post |{"userName": "baishaoxiong","password": "123456"}|{"code": 200,"message": "成功","data": {"token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTcsInVzZXJuYW1lIjoiYmFpc2hhb3hpb25nIiwiaWF0IjoxNzExMzI5MzI5LCJleHAiOjE3MTEzMzI5Mjl9.t6ZhYiorN3TAdHYTSnYVbq1e2d4RofsXVkmKAELxFFQ","refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTcsInVzZXJuYW1lIjoiYmFpc2hhb3hpb25nIiwiaWF0IjoxNzExMzI5MzI5LCJleHAiOjE3MTE1MDIxMjl9.C9ckdIDpxGfjjjiTsWnscKQckXyGaUo61L1gqZi_mWQ"}}
|保存单品数据|http://47.95.1.102:7999/single-item/taobao|post|参数太多单独发|{"code": 200,"message": "成功"}或者{"code": 500,"message": "异常信息"}
