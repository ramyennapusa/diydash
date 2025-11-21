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
        const errorMessage = data.message || data.error || `API request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      // If it's already an Error object, re-throw it
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, wrap it in an Error
      throw new Error(error.message || 'API request failed');
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
}

// Export singleton instance
const apiClient = new DIYDashAPI();
export default apiClient;

