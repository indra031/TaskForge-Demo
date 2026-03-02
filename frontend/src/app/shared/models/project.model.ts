export interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  key: string;
}
