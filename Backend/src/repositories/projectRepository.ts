export interface ProjectRepository {
  findById(projectId: string): Promise<unknown | null>;
  findBySlug(slug: string): Promise<unknown | null>;
}
