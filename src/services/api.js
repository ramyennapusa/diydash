// API Client for DIY Dash React App
// API Gateway URL configured for your deployment

const API_BASE_URL = 'https://xic1t3v249.execute-api.us-west-2.amazonaws.com/prod';

class DIYDashAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get all projects
  async getProjects(status = null) {
    const queryParam = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/projects${queryParam}`);
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
      description: projectData.description,
      status: projectData.status || 'Planning',
      difficulty: projectData.difficulty || 'Beginner',
      estimatedTime: projectData.estimatedTime || '',
      pictures: [],
      tasks: [],
      videos: [],
      materials: [],
      tools: []
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

  // Update project status
  async updateProjectStatus(id, status) {
    return this.updateProject(id, { status });
  }

  // Add task to project
  async addTask(projectId, task) {
    const project = await this.getProject(projectId);
    const tasks = [...(project.tasks || []), task];
    return this.updateProject(projectId, { tasks });
  }

  // Update task completion
  async toggleTask(projectId, taskId) {
    const project = await this.getProject(projectId);
    const tasks = project.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    return this.updateProject(projectId, { tasks });
  }

  // Add picture to project
  async addPicture(projectId, picture) {
    const project = await this.getProject(projectId);
    const pictures = [...(project.pictures || []), picture];
    return this.updateProject(projectId, { pictures });
  }

  // Add video to project
  async addVideo(projectId, video) {
    const project = await this.getProject(projectId);
    const videos = [...(project.videos || []), video];
    return this.updateProject(projectId, { videos });
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
}

// Export singleton instance
const apiClient = new DIYDashAPI();
export default apiClient;

