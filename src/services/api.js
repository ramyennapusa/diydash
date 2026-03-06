// API Client for DIY Dash React App
// Set VITE_API_BASE_URL in .env (e.g. .env.local) to override, or leave unset to use default.
// Get your URL after deploy: cd diydash-infra/terraform && terraform output api_gateway_url

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://xic1t3v249.execute-api.us-west-2.amazonaws.com/prod';

const STORAGE_KEY = 'diydash_user';

class DIYDashAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.userEmail = null;
    this.onUnauthorized = null;
  }

  setUser(user) {
    this.userEmail = user && user.email ? String(user.email).trim().toLowerCase() : null;
  }

  setOnUnauthorized(callback) {
    this.onUnauthorized = callback;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const headers = { ...options.headers };
    if (method !== 'GET') {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    if (this.userEmail && !options.skipUserEmail) {
      headers['X-User-Email'] = this.userEmail;
    }
    const config = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      let data;
      try {
        data = await response.json();
      } catch (_) {
        data = { message: response.statusText || 'Invalid response' };
      }

      if (!response.ok) {
        if (response.status === 401) {
          try {
            localStorage.removeItem(STORAGE_KEY);
            const rawMsg = (data && data.message) ? data.message : 'User ID not found. Please create an account.';
            const msg = rawMsg.includes('Account not found') || rawMsg.includes('You may have been removed')
              ? 'User ID not found. Please create an account.'
              : rawMsg;
            sessionStorage.setItem('loginMessage', msg);
          } catch (_) {}
          this.onUnauthorized?.();
        }
        const errorMessage = data.message || data.error || `API request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error(
          'Cannot reach the server. Check that the API is deployed, the URL in src/services/api.js is correct, and CORS is enabled.'
        );
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error.message || 'API request failed');
    }
  }

  // Check that a user exists (used on login before calling onLogin to avoid flashing homepage). Throws on 401.
  async validateUser(email) {
    const owner = String(email || '').trim().toLowerCase();
    if (!owner) throw new Error('Email is required.');
    return this.request(`/projects?owner=${encodeURIComponent(owner)}`, { skipUserEmail: true });
  }

  // Get all projects (uses owner query param to avoid CORS preflight when X-User-Email not yet allowed)
  async getProjects(status = null) {
    const params = new URLSearchParams();
    if (this.userEmail) params.set('owner', this.userEmail);
    if (status && status !== 'All') params.set('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/projects${query}`, { skipUserEmail: true });
  }

  // Get single project by ID
  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  // Create new project with optional image upload to S3
  async createProject(projectData) {
    // Prepare the request body
    const requestBody = {
      title: projectData.title,
      description: projectData.description || '',
      status: projectData.status || 'Planning',
      difficulty: projectData.difficulty || 'Beginner',
      estimatedTime: projectData.estimatedTime || '',
      pictures: [],
      tasks: [],
      videos: [],
      materials: [],
      tools: [],
      references: []
    };

    // If imageData is provided (base64), include it for S3 upload
    if (projectData.imageData) {
      requestBody.imageData = projectData.imageData;
      requestBody.imageContentType = projectData.imageContentType || 'image/jpeg';
    } else if (projectData.image && projectData.image.trim()) {
      // If it's a URL string, send it as is
      requestBody.image = projectData.image.trim();
    }

    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // Update existing project
  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  // Delete project
  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Create account (email + password). Account is unverified until user enters the 4-digit code.
  async createAccount(email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
  }

  // Send 4-digit verification code to user's email (only for existing unverified accounts)
  async sendVerificationCode(email) {
    return this.request('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
  }

  // Verify 4-digit code and complete registration
  async verifyCode(email, code) {
    return this.request('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), code: String(code).trim() }),
    });
  }

  // Delete current user account (requires X-User-Email from setUser). Clears session on success.
  async deleteAccount() {
    const result = await this.request('/auth/account', { method: 'DELETE' });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    return result;
  }

  // Update project status
  async updateProjectStatus(id, status) {
    return this.updateProject(id, { status });
  }

  // Add task to project (uses dedicated endpoint)
  async addTask(projectId, task) {
    return this.request(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        description: task.description || '',
        completed: task.completed !== undefined ? task.completed : false,
        estimatedTime: task.estimatedTime || '',
        difficulty: task.difficulty || 'Beginner',
        order: task.order,
        category: task.category || 'Planning',
        id: task.id
      }),
    });
  }

  // Get tasks for a project
  async getTasks(projectId) {
    return this.request(`/projects/${projectId}/tasks`);
  }

  // Update task completion
  async toggleTask(projectId, taskId) {
    const project = await this.getProject(projectId);
    const tasks = project.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    return this.updateProject(projectId, { tasks });
  }

  // Add picture to project (uploads to S3)
  async addPicture(projectId, picture) {
    // Use dedicated upload endpoint if imageData is provided
    if (picture.imageData) {
      return this.request(`/projects/${projectId}/pictures`, {
        method: 'POST',
        body: JSON.stringify({
          imageData: picture.imageData,
          imageContentType: picture.imageContentType || 'image/jpeg',
          caption: picture.caption || '',
          type: picture.type || 'progress',
          id: picture.id,
          order: picture.order
        }),
      });
    } else {
      // Fallback to update project if no imageData (for URL-based pictures)
      const project = await this.getProject(projectId);
      const pictures = [...(project.pictures || []), picture];
      return this.updateProject(projectId, { pictures });
    }
  }

  // Add video to project (uploads to S3 or adds URL)
  async addVideo(projectId, video) {
    // Use dedicated upload endpoint if videoData is provided or url is provided
    if (video.videoData || video.url) {
      return this.request(`/projects/${projectId}/videos`, {
        method: 'POST',
        body: JSON.stringify({
          videoData: video.videoData,
          videoContentType: video.videoContentType,
          url: video.url,
          title: video.title || 'Untitled Video',
          description: video.description || '',
          type: video.type || 'tutorial',
          duration: video.duration || '0:00',
          thumbnail: video.thumbnail || '',
          id: video.id
        }),
      });
    } else {
      // Fallback to update project if no videoData or url
      const project = await this.getProject(projectId);
      const videos = [...(project.videos || []), video];
      return this.updateProject(projectId, { videos });
    }
  }

  // Add material to project
  async addMaterial(projectId, material) {
    const project = await this.getProject(projectId);
    const materials = [...(project.materials || []), material];
    return this.updateProject(projectId, { materials });
  }

  // Toggle material purchased status
  async toggleMaterialPurchased(projectId, materialId) {
    const project = await this.getProject(projectId);
    const materials = project.materials.map(material =>
      material.id === materialId ? { ...material, purchased: !material.purchased } : material
    );
    return this.updateProject(projectId, { materials });
  }

  // Add reference to project
  async addReference(projectId, reference) {
    const project = await this.getProject(projectId);
    const references = [...(project.references || []), reference];
    return this.updateProject(projectId, { references });
  }

  // Delete picture from project
  async deletePicture(projectId, pictureId) {
    const project = await this.getProject(projectId);
    const pictures = (project.pictures || []).filter(pic => pic.id !== pictureId);
    return this.updateProject(projectId, { pictures });
  }

  // Collaborators: list, add, remove (permission: 'view' | 'edit')
  async getCollaborators(projectId) {
    return this.request(`/projects/${projectId}/collaborators`);
  }

  async addCollaborator(projectId, { email, permission }) {
    return this.request(`/projects/${projectId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), permission: permission === 'edit' ? 'edit' : 'view' }),
    });
  }

  async removeCollaborator(projectId, email) {
    const normalized = String(email || '').trim().toLowerCase();
    const encoded = encodeURIComponent(normalized);
    return this.request(`/projects/${projectId}/collaborators/${encoded}`, { method: 'DELETE' });
  }

  // Redeem invite token (after signup/login). Returns { projectId }.
  async redeemInvite(token) {
    return this.request('/invite/redeem', {
      method: 'POST',
      body: JSON.stringify({ token: String(token).trim() }),
    });
  }

  // Collaboration requests (pending invite to a project – accept or decline)
  async acceptCollaborationRequest(projectId) {
    return this.request('/collaboration-requests/accept', {
      method: 'POST',
      body: JSON.stringify({ projectId: String(projectId).trim() }),
    });
  }

  async declineCollaborationRequest(projectId) {
    return this.request('/collaboration-requests/decline', {
      method: 'POST',
      body: JSON.stringify({ projectId: String(projectId).trim() }),
    });
  }
}

// Export singleton instance
const apiClient = new DIYDashAPI();
export default apiClient;

