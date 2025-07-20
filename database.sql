/*
  # 待办事项应用数据库表结构

  1. 新建表
    - `users`
      - `id` (uuid, 主键) - Supabase 认证用户 ID
      - `username` (text, 唯一) - 用户显示名称
      - `created_at` (timestamp)
    - `todos`
      - `id` (uuid, 主键)
      - `user_id` (uuid, 外键到 users)
      - `task` (text) - 任务描述
      - `completed` (boolean) - 任务完成状态
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. 安全设置
    - 在两个表上启用 RLS
    - 为认证用户添加管理自己数据的策略
*/

-- 创建用户表用于存储额外的用户信息
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 创建待办事项表
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 待办事项表策略
CREATE POLICY "Users can read own todos"
  ON todos
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own todos"
  ON todos
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own todos"
  ON todos
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own todos"
  ON todos
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 创建索引以提高性能
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos(created_at);

-- 自动更新 updated_at 时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 自动更新 updated_at 的触发器
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();