/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { ProjectsView } from './components/projects/ProjectsView';
import { CeoAttentionView } from './components/ceo/CeoAttentionView';
import { FollowupsView } from './components/followups/FollowupsView';
import { MeetingsView } from './components/meetings/MeetingsView';
import { SettingsView } from './components/settings/SettingsView';
import { ItemDetailDrawer } from './components/dialogs/ItemDetailDrawer';
import { NewItemModal } from './components/dialogs/NewItemModal';
import { ParentCascadeDialog } from './components/dialogs/ParentCascadeDialog';
import { CommandPalette } from './components/dialogs/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';

const MainLayout: React.FC = () => {
  const { activeNav, isSidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
          isSidebarCollapsed ? 'pl-16' : 'pl-62'
        }`}
      >
        {/* Fixed Top Bar */}
        <TopBar />

        {/* Content Container (starts under 56px topbar) */}
        <main className="flex-1 mt-14 p-6 overflow-y-auto">
          {activeNav === 'dashboard' && <DashboardView />}
          {activeNav === 'tasks' && <TasksView />}
          {activeNav === 'projects' && <ProjectsView />}
          {activeNav === 'ceo' && <CeoAttentionView />}
          {activeNav === 'followups' && <FollowupsView />}
          {activeNav === 'meetings' && <MeetingsView />}
          {activeNav === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Overlays & Modals */}
      <ItemDetailDrawer />
      <NewItemModal />
      <ParentCascadeDialog />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
