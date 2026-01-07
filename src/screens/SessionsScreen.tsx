import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Icon } from '../components/Icon';
import { spacing, typography } from '../theme';
import type { Session, SessionWithPreview, Project } from '../providers/OpenCodeProvider';
import { getProjectName } from '../utils/project';

interface SessionsScreenProps {
  sessions: SessionWithPreview[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectSession: (session: Session) => void;
  selectedProject?: Project | null;
  onClearProject?: () => void;
}

interface GroupedSession extends SessionWithPreview {
  children?: SessionWithPreview[];
  isChild?: boolean;
}

export function SessionsScreen({
  sessions,
  loading,
  refreshing,
  onRefresh,
  onSelectSession,
  selectedProject,
  onClearProject,
}: SessionsScreenProps) {
  const { theme, colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // Group sessions by parent
  const groupedSessions = useMemo(() => {
    const parentSessions: GroupedSession[] = [];
    const childrenMap = new Map<string, SessionWithPreview[]>();
    
    // First pass: separate parents and children
    for (const session of sessions) {
      if (session.parentID) {
        const existing = childrenMap.get(session.parentID) || [];
        existing.push(session);
        childrenMap.set(session.parentID, existing);
      } else {
        parentSessions.push({ ...session });
      }
    }
    
    // Second pass: attach children to parents and count
    for (const parent of parentSessions) {
      const children = childrenMap.get(parent.id);
      if (children) {
        parent.children = children.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt || '';
          const dateB = b.updatedAt || b.createdAt || '';
          return dateB.localeCompare(dateA);
        });
      }
    }
    
    return parentSessions;
  }, [sessions]);

  // Count only parent sessions
  const parentCount = groupedSessions.length;

  const toggleExpanded = (sessionId: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const renderChildSession = (item: SessionWithPreview) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.childSessionItem, { borderBottomColor: c.divider, backgroundColor: c.bgHover }]}
      onPress={() => onSelectSession(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.childIndicator, { backgroundColor: c.accent }]} />
      <View style={styles.sessionContent}>
        <View style={styles.sessionHeader}>
          <Text style={[styles.childSessionTitle, { color: c.text }]} numberOfLines={1}>
            {item.title || 'Untitled Session'}
          </Text>
          <Text style={[styles.sessionTime, { color: c.textMuted }]}>
            {formatDate(item.updatedAt || item.createdAt)}
          </Text>
        </View>
        {item.preview && (
          <Text style={[styles.sessionPreview, { color: c.textSecondary }]} numberOfLines={1}>
            {item.preview}
          </Text>
        )}
      </View>
      <Icon name="chevron-right" size={16} color={c.textMuted} />
    </TouchableOpacity>
  );

  const renderSession = ({ item }: { item: GroupedSession }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSessions.has(item.id);
    
    return (
      <View>
        <TouchableOpacity
          style={[styles.sessionItem, { borderBottomColor: c.divider }]}
          onPress={() => onSelectSession(item)}
          activeOpacity={0.7}
        >
          <View style={styles.sessionContent}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTitle, { color: c.text }]} numberOfLines={1}>
                {item.title || 'Untitled Session'}
              </Text>
              <Text style={[styles.sessionTime, { color: c.textMuted }]}>
                {formatDate(item.updatedAt || item.createdAt)}
              </Text>
            </View>
            {item.preview && (
              <Text style={[styles.sessionPreview, { color: c.textSecondary }]} numberOfLines={1}>
                {item.preview}
              </Text>
            )}
          </View>
          
          {hasChildren ? (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => toggleExpanded(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[styles.childCountBadge, { backgroundColor: c.accentSubtle }]}>
                <Text style={[styles.childCountText, { color: c.accent }]}>
                  {item.children!.length}
                </Text>
              </View>
              <Icon 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={c.textMuted} 
              />
            </TouchableOpacity>
          ) : (
            <Icon name="chevron-right" size={18} color={c.textMuted} />
          )}
        </TouchableOpacity>
        
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {item.children!.map(renderChildSession)}
          </View>
        )}
      </View>
    );
  };

  // Extra padding for the floating liquid glass tab bar on iPad
  const topPadding = insets.top + 60;

  return (
    <View style={theme.container}>
      {/* Header */}
      <View style={[theme.header, { paddingTop: topPadding }]}>
        <View style={{ flex: 1 }}>
          <Text style={theme.title}>Sessions</Text>
          {selectedProject ? (
            <TouchableOpacity 
              onPress={onClearProject}
              style={styles.projectFilter}
            >
              <Icon name="folder-open" size={12} color={c.accent} />
              <Text style={[theme.small, { color: c.accent }]} numberOfLines={1}>
                {getProjectName(selectedProject)}
              </Text>
              <Icon name="x" size={14} color={c.accent} />
            </TouchableOpacity>
          ) : (
            <Text style={[theme.small, theme.textSecondary]}>
              {parentCount} {parentCount === 1 ? 'session' : 'sessions'}
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={groupedSessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
          />
        }
        contentContainerStyle={[
          styles.list,
          sessions.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color={c.textMuted} />
            <Text style={[theme.subtitle, { marginTop: spacing.lg, color: c.text }]}>
              {loading ? 'Loading...' : 'No Sessions'}
            </Text>
            <Text style={[theme.body, theme.textSecondary, styles.emptyText]}>
              {loading 
                ? 'Fetching your sessions' 
                : 'Start a conversation in OpenCode to see it here'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  sessionContent: {
    flex: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sessionTitle: {
    ...typography.bodyMedium,
    flex: 1,
  },
  sessionTime: {
    ...typography.caption,
  },
  sessionPreview: {
    ...typography.small,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  childCountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  childCountText: {
    ...typography.caption,
    fontWeight: '600',
  },
  childrenContainer: {
    marginLeft: spacing.md,
  },
  childSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
    paddingLeft: spacing.md,
    borderBottomWidth: 1,
  },
  childIndicator: {
    width: 2,
    height: '100%',
    marginRight: spacing.md,
    borderRadius: 1,
  },
  childSessionTitle: {
    ...typography.small,
    fontWeight: '500',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  projectFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
});
