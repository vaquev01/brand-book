import type { ProjectService } from "../services/projectService";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  async showById(projectId: string) {
    return this.projectService.getProjectById(projectId);
  }

  async showBySlug(slug: string) {
    return this.projectService.getProjectBySlug(slug);
  }
}
