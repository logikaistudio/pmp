import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { WBSProvider, useWBS } from './context/WBSContext';
import TargetRealizationChart from './components/TargetRealizationChart';
import WBSTable from './components/WBSTable';
import ProjectInfo from './components/ProjectInfo';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';
import ThemeToggle from './components/ThemeToggle';
import { handleDownloadPDF } from './components/PDFExport';


function AppContent() {
  const { user, login, logout, isAdmin } = useAuth();
  const { projectInfo } = useProject();
  const { wbsData, calculateOverallProgress } = useWBS();
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Calculate metrics from WBS data
  const overallProgress = calculateOverallProgress();
  const totalTasks = wbsData?.length || 0;
  const completedTasks = wbsData?.filter(item => item.progress === 100).length || 0;

  // Find next milestone (first incomplete main task)
  const nextMilestone = wbsData?.find(item => item.level === 0 && item.progress < 100);

  // If not authenticated, show login modal
  if (!user) {
    return <LoginModal onClose={() => { }} onLogin={login} />;
  }

  return (
    <div className="App">
      {/* Header / Actions */}
      <header id="project-header" className="glass-card" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderRadius: 0,
        padding: '1rem 2rem',
        marginBottom: '2rem',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none'
      }}>
        <div className="container flex-between" style={{ padding: 0 }}>
          <div className="flex-center" style={{ gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              {projectInfo.projectName.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{projectInfo.projectName}</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Dashboard Overview • {user.name} ({user.role})
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ThemeToggle />
            {isAdmin && (
              <button
                onClick={() => setShowSettings(true)}
                className="btn btn-ghost"
              >
                ⚙️ Settings
              </button>
            )}
            <button onClick={() => handleDownloadPDF(projectInfo, wbsData)} className="btn btn-ghost">
              📄 Export PDF
            </button>

            <button onClick={logout} className="btn btn-primary">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Printable */}
      <main id="report-content" style={{ marginTop: '90px', paddingBottom: '3rem' }}>
        <div className="container">
          {/* Top Section: Metrics + S-Curve Chart */}
          <section style={{ marginBottom: '2rem' }}>
            <div className="grid-responsive" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              {/* Key Metrics Cards */}
              <div id="metrics-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignContent: 'start' }}>
                <div className="glass-card">
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Project Progress</p>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0' }}>{overallProgress}%</h2>
                  <p style={{ color: overallProgress >= 50 ? '#4ade80' : '#fbbf24', fontSize: '0.9rem' }}>
                    {overallProgress >= 50 ? '✓ On Track' : '⚠ Needs Attention'}
                  </p>
                </div>
                <div className="glass-card">
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Next Milestone</p>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0.5rem 0' }}>
                    {nextMilestone?.name || 'All Complete'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {nextMilestone ? `Due: ${nextMilestone.endDate}` : 'No pending milestones'}
                  </p>
                </div>
                <div className="glass-card">
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Tasks</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0.5rem 0' }}>
                    {completedTasks} / {totalTasks} Completed
                  </h3>
                </div>
              </div>

              {/* S-Curve Chart - Same height as metrics column */}
              <div id="s-curve-container" style={{ height: '100%', minHeight: '400px' }}>
                <TargetRealizationChart />
              </div>
            </div>
          </section>

          {/* Project Information Section */}
          <div id="project-info-container">
            <ProjectInfo />
          </div>

          {/* Gantt Chart Removed per user request */}

          {/* WBS Section */}
          <section id="wbs-container">
            <WBSTable />
          </section>
        </div>
      </main>

      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <WBSProvider>
            <AppContent />
          </WBSProvider>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
