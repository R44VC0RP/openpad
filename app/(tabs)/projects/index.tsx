import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ProjectsScreen } from '../../../src/screens/ProjectsScreen';
import { useOpenCode, Project } from '../../../src/providers/OpenCodeProvider';

export default function Projects() {
  const router = useRouter();
  const { projects, projectsLoading, refreshProjects, setSelectedProject } = useOpenCode();

  const handleSelectProject = useCallback((project: Project) => {
    // Set the selected project to filter sessions
    setSelectedProject(project);
    // Navigate to sessions tab
    router.push('/(tabs)/sessions');
  }, [router, setSelectedProject]);

  return (
    <ProjectsScreen
      projects={projects}
      loading={projectsLoading}
      onRefresh={refreshProjects}
      onSelectProject={handleSelectProject}
    />
  );
}
