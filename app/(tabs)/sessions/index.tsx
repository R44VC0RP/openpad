import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SessionsScreen } from '../../../src/screens/SessionsScreen';
import { useOpenCode, Session } from '../../../src/providers/OpenCodeProvider';

export default function Sessions() {
  const router = useRouter();
  const {
    sessions,
    sessionsLoading,
    sessionsRefreshing,
    refreshSessions,
    selectedProject,
    setSelectedProject,
  } = useOpenCode();

  const handleSelectSession = useCallback((session: Session) => {
    // Navigate to chat screen outside of tabs (hides tab bar)
    router.push(`/chat/${session.id}`);
  }, [router]);

  const handleClearProject = useCallback(() => {
    setSelectedProject(null);
  }, [setSelectedProject]);

  return (
    <SessionsScreen
      sessions={sessions}
      loading={sessionsLoading}
      refreshing={sessionsRefreshing}
      onRefresh={refreshSessions}
      onSelectSession={handleSelectSession}
      selectedProject={selectedProject}
      onClearProject={handleClearProject}
    />
  );
}
