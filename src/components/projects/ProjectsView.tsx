/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  Lock,
  Plus,
  Flag,
  ListPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  computeItemProgressAndWeights,
  countLeaves,
  getDeadlineInfo,
} from '../../utils/engine';
import { WorkItem } from '../../types';

export const ProjectsView: React.FC = () => {
  const {
    workItems,
    statusMap,
    priorityMap,
    departmentMap,
    todayStr,
    dueSoonWindow,
    setSelectedItemId,
    canEdit,
    openCreateModal,
  } = useApp();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'wi-proj-q4': true,
    'wi-task-build-dash': true,
    'wi-proj-onboarding': true,
  });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    for (const w of workItems) allIds[w.id] = true;
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Top-level projects
  const rootProjects = workItems.filter(
    (item) => item.itemType === 'project' && !item.parentId && !item.isArchived
  );

  return (
    <div className="space-y-4 pb-16 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Projects</h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Hierarchical project tree with leaf-counted progress rollups and priority caps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="rounded border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="rounded border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] cursor-pointer"
          >
            Collapse all
          </button>
          {canEdit && (
            <button
              onClick={() => {
                openCreateModal({
                  type: 'project',
                  mode: 'project',
                  parentId: null,
                });
              }}
              className="flex items-center gap-1.5 rounded-md bg-[var(--brand-600)] hover:bg-[var(--brand-700)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New project</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs space-y-4">
        {rootProjects.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-3)]">
            No projects found. Create your first project to start tracking initiatives.
          </div>
        ) : (
          rootProjects.map((proj) => (
            <ProjectTreeNode
              key={proj.id}
              item={proj}
              depth={0}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface ProjectTreeNodeProps {
  item: WorkItem;
  depth: number;
  expandedNodes: Record<string, boolean>;
  toggleNode: (id: string) => void;
}

const ProjectTreeNode: React.FC<ProjectTreeNodeProps> = ({
  item,
  depth,
  expandedNodes,
  toggleNode,
}) => {
  const {
    workItems,
    statusMap,
    priorityMap,
    departmentMap,
    setSelectedItemId,
    canEdit,
    openCreateModal,
    todayStr,
    dueSoonWindow,
  } = useApp();

  const isExpanded = !!expandedNodes[item.id];
  const children = workItems.filter((w) => w.parentId === item.id && !w.isArchived);
  const hasChildren = children.length > 0;
  const isProject = item.itemType === 'project';
  const isSubProject = isProject && Boolean(item.parentId);

  const { progress, childWeights } = computeItemProgressAndWeights(
    item,
    workItems,
    statusMap,
    priorityMap
  );
  const leaves = countLeaves(item.id, workItems, statusMap);
  const hasManualWeight = Object.values(childWeights).some((w) => w.isManual);
  const status = statusMap.get(item.statusId);
  const dept = departmentMap.get(item.departmentIds[0]);
  const dl = getDeadlineInfo(item.dueDate, status, todayStr, dueSoonWindow);

  return (
    <div className="space-y-1">
      <div
        onClick={() => setSelectedItemId(item.id)}
        className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-md hover:bg-[var(--surface-2)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 max-w-lg">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(item.id);
              }}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-2)] cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {isProject ? (
            <Folder className="h-4 w-4 text-[var(--brand-600)] shrink-0" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-[var(--text-3)] shrink-0" />
          )}

          {item.needsCeoAttention && (
            <Flag className="h-3.5 w-3.5 text-[var(--attention-fg)] fill-[var(--attention-fg)] shrink-0" />
          )}

          <div className="truncate">
            <span className="text-xs font-semibold text-[var(--text)] truncate">
              {item.name}
            </span>
            {isProject && (
              <span className="ml-2 text-[11px] text-[var(--text-3)] font-medium">
                {leaves === 0 ? 'No tasks yet' : `${leaves} ${leaves === 1 ? 'task' : 'tasks'}`}
              </span>
            )}
          </div>
        </div>

        {/* Progress & Quick stats */}
        <div className="flex items-center gap-4 mt-2 sm:mt-0 pl-8 sm:pl-0">
          {/* Progress bar */}
          <div className="flex items-center gap-2 w-32">
            <div className="flex-1 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
              {progress !== null ? (
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor:
                      progress === 100 ? 'var(--success-fg)' : 'var(--brand-600)',
                  }}
                />
              ) : null}
            </div>
            <span className="text-xs font-semibold tabular-nums text-[var(--text)] w-8 text-right">
              {progress !== null ? `${progress}%` : 'N/A'}
            </span>
          </div>

          {hasManualWeight && (
            <span
              className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
              title="Manual weight override in effect"
            >
              <Lock className="h-2.5 w-2.5" />
              <span>manual</span>
            </span>
          )}

          {/* Department badge */}
          {dept && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[var(--text-2)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
              <span>{dept.name}</span>
            </span>
          )}

          {/* Due date */}
          <span className="text-xs text-[var(--text-3)] tabular-nums min-w-[70px] text-right">
            {item.dueDate ? `Due ${item.dueDate}` : '—'}
          </span>

          {/* Quick add actions adhering to hierarchy rules */}
          {canEdit && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              {isProject ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateModal({
                        type: 'project',
                        mode: 'sub_project',
                        parentId: item.id,
                      });
                    }}
                    title="Add Sub-project inside"
                    className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--brand-600)] cursor-pointer text-[10px] font-semibold flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Sub-project</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateModal({
                        type: 'task',
                        mode: 'task',
                        parentId: item.id,
                      });
                    }}
                    title="Add Task inside"
                    className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--brand-600)] cursor-pointer text-[10px] font-semibold flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Task</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateModal({
                      type: 'task',
                      mode: 'sub_task',
                      parentId: item.id,
                    });
                  }}
                  title="Add Subtask inside"
                  className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--brand-600)] cursor-pointer text-[10px] font-semibold flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" />
                  <span>Subtask</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render children recursively if expanded */}
      {isExpanded &&
        hasChildren &&
        children.map((child) => (
          <ProjectTreeNode
            key={child.id}
            item={child}
            depth={depth + 1}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
          />
        ))}
    </div>
  );
};
