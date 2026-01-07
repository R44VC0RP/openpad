import type { Project } from '../providers/OpenCodeProvider';

/**
 * Get the raw project path from either 'worktree' (SDK) or 'path' field.
 */
export function getProjectPathRaw(project: Project): string | undefined {
  return project.worktree || project.path;
}

/**
 * Get a display name for a project.
 * Uses the project name if available, otherwise extracts the folder name from the path.
 */
export function getProjectName(project: Project): string {
  if (project.name) return project.name;
  
  const path = getProjectPathRaw(project);
  if (path) {
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] || path;
  }
  
  return project.id;
}

/**
 * Convert an absolute path to a ~/relative format for display.
 * Handles macOS, Linux, and Windows home directory patterns.
 */
export function formatPath(path: string): string {
  const homePatterns = [
    /^\/Users\/[^/]+\//,      // macOS: /Users/username/
    /^\/home\/[^/]+\//,        // Linux: /home/username/
    /^C:\\Users\\[^\\]+\\/i,   // Windows: C:\Users\username\
  ];
  
  for (const pattern of homePatterns) {
    if (pattern.test(path)) {
      return '~/' + path.replace(pattern, '').replace(/\\/g, '/');
    }
  }
  return path;
}

/**
 * Get a formatted display path for a project.
 * Returns the path relative to home directory, or null if no path available.
 */
export function getProjectPath(project: Project): string | null {
  const projectPath = getProjectPathRaw(project);
  if (projectPath) {
    return formatPath(projectPath);
  }
  return null;
}
