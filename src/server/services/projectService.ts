import { ProjectRepository } from "@/server/repositories/projectRepository";

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository = new ProjectRepository()) {}

  async getProjectById(projectId: string) {
    return this.projectRepository.findById(projectId);
  }

  async getProjectBySlug(slug: string) {
    return this.projectRepository.findBySlug(slug);
  }
}
