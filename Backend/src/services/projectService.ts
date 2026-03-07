import type { ProjectRepository } from "../repositories/projectRepository";

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async getProjectById(projectId: string) {
    return this.projectRepository.findById(projectId);
  }

  async getProjectBySlug(slug: string) {
    return this.projectRepository.findBySlug(slug);
  }
}
