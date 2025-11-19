const API_BASE = import.meta.env.VITE_API_BASE_URL;

class TodoService {
  // Get current user from localStorage
  getCurrentUser() {
    const savedUser = localStorage.getItem('todoUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        user: user.username,
        workspace: 'default' // You can make this dynamic if needed
      };
    }
    return {
      user: 'system',
      workspace: 'default'
    };
  }

  async login(username, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  }

  async getUsers() {
    const response = await fetch(`${API_BASE}/auth/users`);
    return response.json();
  }

  async getTasks() {
    const response = await fetch(`${API_BASE}/tasks`);
    return response.json();
  }

  async createTask(data) {
    const userInfo = this.getCurrentUser();
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ...userInfo })
    });
    return response.json();
  }

  async getTask(id) {
    const response = await fetch(`${API_BASE}/tasks/${id}`);
    return response.json();
  }

  async updateTaskStatus(taskId, status) {
    const userInfo = this.getCurrentUser();
    const response = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...userInfo })
    });
    return response.json();
  }

  async updateTaskProgress(taskId, progress) {
    const userInfo = this.getCurrentUser();
    const response = await fetch(`${API_BASE}/tasks/${taskId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, ...userInfo })
    });
    return response.json();
  }

  async deleteTask(id) {
    const userInfo = this.getCurrentUser();
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo)
    });
    return response.json();
  }

  async addComment(taskId, text) {
    const userInfo = this.getCurrentUser();
    const response = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ...userInfo })
    });
    return response.json();
  }

  async updateTask(id, data) {
    const userInfo = this.getCurrentUser();
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ...userInfo })
    });
    return response.json();
  }

  async getTaskLogs(taskId) {
    const response = await fetch(`${API_BASE}/logs/task/${taskId}`);
    return response.json();
  }

  async getAllTasksLogs() {
    const response = await fetch(`${API_BASE}/logs`);
    return response.json();
  }

  async getSnapshots() {
    const response = await fetch(`${API_BASE}/restore/snapshots`);
    return response.json();
  }

  async restoreSnapshot(snapshotId) {
    const userInfo = this.getCurrentUser();
    const response = await fetch(`${API_BASE}/restore/${snapshotId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo)
    });
    return response.json();
  }
}

export default new TodoService();
