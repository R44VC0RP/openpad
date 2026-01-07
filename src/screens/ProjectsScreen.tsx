import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Icon } from '../components/Icon';
import { spacing, radius, typography } from '../theme';
import type { Project } from '../providers/OpenCodeProvider';
import { getProjectName, getProjectPath } from '../utils/project';

interface ProjectsScreenProps {
  projects: Project[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onSelectProject?: (project: Project) => void;
}

export function ProjectsScreen({
  projects,
  loading = false,
  refreshing = false,
  onRefresh,
  onSelectProject,
}: ProjectsScreenProps) {
  const { theme, colors: c } = useTheme();

  const renderProject = ({ item }: { item: Project }) => {
    const name = getProjectName(item);
    const path = getProjectPath(item);
    
    return (
      <TouchableOpacity
        style={[styles.projectItem, { backgroundColor: c.bgCard, borderBottomColor: c.divider }]}
        onPress={() => onSelectProject?.(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.projectIcon, { backgroundColor: c.accentSubtle }]}>
          <Icon name="folder-open" size={20} color={c.accent} />
        </View>
        
        <View style={styles.projectContent}>
          <Text style={[theme.bodyMedium]} numberOfLines={1}>
            {name}
          </Text>
          {path && (
            <Text style={[theme.small, theme.textSecondary]} numberOfLines={1}>
              {path}
            </Text>
          )}
        </View>
        
        <Icon name="chevron-right" size={20} color={c.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={theme.container}>
      {/* Header */}
      <View style={[theme.header]}>
        <View>
          <Text style={theme.title}>Projects</Text>
          <Text style={[theme.small, theme.textSecondary]}>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </Text>
        </View>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={c.accent}
            />
          ) : undefined
        }
        contentContainerStyle={[
          styles.list,
          projects.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: c.accentSubtle }]}>
              <Icon name="folder-open" size={32} color={c.accent} />
            </View>
            <Text style={[theme.subtitle, { marginTop: spacing.lg }]}>
              {loading ? 'Loading...' : 'No Projects'}
            </Text>
            <Text style={[theme.body, theme.textSecondary, styles.emptyText]}>
              {loading 
                ? 'Fetching your projects' 
                : 'Open a project in OpenCode to see it here'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectContent: {
    flex: 1,
    marginLeft: spacing.lg,
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
