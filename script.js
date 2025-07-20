// Supabase 配置 - 请替换为您的实际配置
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// 简化的 Supabase 客户端
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.currentUser = null;
  }

  auth = {
    signUp: async ({ email, password }) => {
      console.log('注册用户:', email);
      return { 
        data: { user: { id: 'user_' + Date.now(), email } }, 
        error: null 
      };
    },

    signInWithPassword: async ({ email, password }) => {
      console.log('用户登录:', email);
      this.currentUser = { id: 'user_' + Date.now(), email };
      return { 
        data: { user: this.currentUser }, 
        error: null 
      };
    },

    signOut: async () => {
      this.currentUser = null;
      return { error: null };
    },

    getUser: async () => {
      return { data: { user: this.currentUser } };
    }
  };

  from(table) {
    return {
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: async () => {
            console.log(`查询 ${table} 表:`, { column, value });
            return { data: null, error: null };
          },
          order: (column, options) => ({
            then: async (callback) => {
              console.log(`查询 ${table} 表并排序:`, { column, options });
              return callback({ data: [], error: null });
            }
          })
        })
      }),

      insert: (data) => ({
        select: () => ({
          single: async () => {
            console.log(`插入 ${table} 表:`, data);
            return { 
              data: { id: 'id_' + Date.now(), ...data }, 
              error: null 
            };
          }
        })
      }),

      update: (data) => ({
        eq: (column, value) => ({
          select: () => ({
            single: async () => {
              console.log(`更新 ${table} 表:`, { data, column, value });
              return { 
                data: { id: value, ...data }, 
                error: null 
              };
            }
          })
        })
      }),

      delete: () => ({
        eq: (column, value) => ({
          then: async (callback) => {
            console.log(`删除 ${table} 表记录:`, { column, value });
            return callback({ error: null });
          }
        })
      })
    };
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// 认证服务
class AuthService {
  static async signUp(username, password) {
    try {
      // 检查用户名是否已存在（模拟检查）
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
      if (existingUsers[username]) {
        return { user: null, error: '用户名已存在' };
      }

      const email = `${username}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          username
        })
        .select()
        .single();

      if (userError) {
        return { user: null, error: userError.message };
      }

      // 保存注册信息到本地存储（模拟数据库）
      existingUsers[username] = { 
        id: data.user.id, 
        email, 
        password: password // 实际应用中不应该明文存储密码
      };
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      return {
        user: {
          id: data.user.id,
          username,
          email
        },
        error: null
      };
    } catch (error) {
      return { user: null, error: '注册过程中发生错误' };
    }
  }

  static async signIn(username, password) {
    try {
      // 检查用户是否已注册
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
      if (!existingUsers[username]) {
        return { user: null, error: '用户未注册，请先注册账户' };
      }

      // 验证密码
      if (existingUsers[username].password !== password) {
        return { user: null, error: '用户名或密码错误' };
      }

      const email = `${username}@example.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: '用户名或密码错误' };
      }

      return {
        user: {
          id: existingUsers[username].id,
          username,
          email: existingUsers[username].email
        },
        error: null
      };
    } catch (error) {
      return { user: null, error: '登录过程中发生错误' };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: '退出登录时发生错误' };
    }
  }
}

// 待办事项服务
class TodoService {
  static async getTodos(userId) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { todos: [], error: error.message };
      }

      return { todos: data || [], error: null };
    } catch (error) {
      return { todos: [], error: '获取待办事项时发生错误' };
    }
  }

  static async addTodo(userId, task) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: userId,
          task,
          completed: false
        })
        .select()
        .single();

      if (error) {
        return { todo: null, error: error.message };
      }

      return { todo: data, error: null };
    } catch (error) {
      return { todo: null, error: '添加待办事项时发生错误' };
    }
  }

  static async deleteTodo(todoId) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: '删除待办事项时发生错误' };
    }
  }
}

// 翻译字典
const translations = {
    'zh-CN': {
        '我的待办事项': '我的待办事项',
        '添加新任务...': '添加新任务...',
        '添加': '添加',
        '删除': '删除',
        '退出登录': '退出登录',
        'English': 'English'
    },
    'en-US': {
        '我的待办事项': 'My To-Do List',
        '添加新任务...': 'Add new task...',
        '添加': 'Add',
        '删除': 'Delete',
        '退出登录': 'Logout',
        'English': '中文'
    }
};

let currentLang = 'zh-CN';

// 事件监听器
document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

document.getElementById('register').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    
    if (username && password) {
        const { user, error } = await AuthService.signUp(username, password);
        
        if (error) {
            alert('注册失败: ' + error);
        } else {
            alert('注册成功，请登录');
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('register').reset();
        }
    }
});

document.getElementById('login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (username && password) {
        const { user, error } = await AuthService.signIn(username, password);
        
        if (error) {
            alert('登录失败: ' + error);
        } else {
            currentUser = user;
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            document.getElementById('login').reset();
            
            await loadTasks();
        }
    }
});

document.getElementById('logout-btn').addEventListener('click', async function() {
    const { error } = await AuthService.signOut();
    
    if (error) {
        alert('退出登录失败: ' + error);
    } else {
        currentUser = null;
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('task-list').innerHTML = '';
    }
});

document.getElementById('toggle-lang').addEventListener('click', function() {
    currentLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    translatePage();
});

document.getElementById('task-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    
    if (taskText && currentUser) {
        const { todo, error } = await TodoService.addTodo(currentUser.id, taskText);
        
        if (error) {
            alert('添加任务失败: ' + error);
        } else {
            addTaskToDOM(todo);
            taskInput.value = '';
        }
    }
});

async function loadTasks() {
    if (!currentUser) return;
    
    const { todos, error } = await TodoService.getTodos(currentUser.id);
    
    if (error) {
        alert('加载任务失败: ' + error);
        return;
    }
    
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    todos.forEach(todo => {
        addTaskToDOM(todo);
    });
}

function addTaskToDOM(todo) {
    const taskList = document.getElementById('task-list');
    
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${todo.task}</span>
        <button class="delete-btn" data-todo-id="${todo.id}">${translations[currentLang]['删除']}</button>
    `;
    
    li.querySelector('.delete-btn').addEventListener('click', async function() {
        const todoId = this.getAttribute('data-todo-id');
        const { error } = await TodoService.deleteTodo(todoId);
        
        if (error) {
            alert('删除任务失败: ' + error);
        } else {
            li.remove();
        }
    });
    
    taskList.appendChild(li);
}

function translatePage() {
    document.getElementById('toggle-lang').textContent = translations[currentLang]['English'];
    document.getElementById('app-title').textContent = translations[currentLang]['我的待办事项'];
    document.getElementById('task-input').placeholder = translations[currentLang]['添加新任务...'];
    document.getElementById('add-btn').textContent = translations[currentLang]['添加'];
    document.getElementById('logout-btn').textContent = translations[currentLang]['退出登录'];
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.textContent = translations[currentLang]['删除'];
    });
}

// 动画效果
window.addEventListener('load', function() {
    for (let i = 0; i < 20; i++) {
        createBubble();
    }
    
    const wave = document.createElement('div');
    wave.className = 'wave';
    document.body.appendChild(wave);
    
    document.addEventListener('mousemove', function(e) {
        const bubbles = document.querySelectorAll('.bubble');
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        bubbles.forEach(bubble => {
            const bubbleX = parseInt(bubble.style.left) || 0;
            const bubbleY = parseInt(bubble.style.top) || 0;
            
            const dx = (mouseX - bubbleX) * 0.02;
            const dy = (mouseY - bubbleY) * 0.02;
            
            bubble.style.transform = `translate(${dx}px, ${dy}px)`;
        });
    });
});

function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    const size = Math.random() * 60 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.top = `${Math.random() * 100}%`;
    
    bubble.style.animationDelay = `${Math.random() * 15}s`;
    
    document.body.appendChild(bubble);
}