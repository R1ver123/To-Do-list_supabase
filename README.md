# 待办事项应用 - Supabase 版本

这是一个使用 Supabase 作为后端数据库的待办事项管理应用。

## 功能特性

- 🔐 用户注册和登录系统
- ✅ 待办事项的增删改查
- 🌐 中英文语言切换
- 🎨 海洋主题动画效果
- 📱 响应式设计
- ☁️ 云端数据存储
- 🔒 行级安全策略 (RLS)

## 安装和配置

### 1. 设置 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 在项目设置中获取以下信息：
   - Project URL
   - Anon Key

### 2. 配置应用

1. 打开 `script.js` 文件
2. 将以下变量替换为您的实际 Supabase 配置：

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. 创建数据库表

在 Supabase 的 SQL 编辑器中运行 `database.sql` 文件中的 SQL 语句，这将创建：

- `users` 表：存储用户信息
- `todos` 表：存储待办事项
- 行级安全策略：确保用户只能访问自己的数据
- 索引：优化查询性能

### 4. 启动应用

直接在浏览器中打开 `index.html` 文件即可使用。

## 文件结构

```
supabase-todo-app/
├── index.html          # 主页面文件
├── style.css           # 样式文件
├── script.js           # JavaScript 逻辑
├── database.sql        # 数据库表结构
└── README.md          # 说明文档
```

## 使用说明

1. **注册账户**：首次使用需要注册新账户
2. **登录系统**：使用注册的用户名和密码登录
3. **管理任务**：添加、删除待办事项
4. **语言切换**：点击右上角按钮切换中英文界面
5. **退出登录**：点击退出登录按钮安全退出

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Supabase (PostgreSQL + Auth)
- **认证**：Supabase Auth
- **数据库**：PostgreSQL with RLS
- **样式**：CSS Grid, Flexbox, CSS Animations

## 安全特性

- 用户认证和授权
- 行级安全策略 (RLS)
- 数据输入验证
- 安全的密码处理
- HTTPS 加密传输

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License

## 支持

如有问题，请查看 Supabase 官方文档或提交 Issue。
