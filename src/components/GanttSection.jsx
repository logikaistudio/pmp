import React, { useState, useMemo } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import "../gantt-custom.css";
import { useWBS } from '../context/WBSContext';

const GanttSection = () => {
    const { wbsData } = useWBS();
    const [view, setView] = useState(ViewMode.Week);
    const [isChecked, setIsChecked] = useState(true);

    // Generate Gantt tasks from WBS data
    const tasks = useMemo(() => {
        if (!wbsData || wbsData.length === 0) {
            // Return a placeholder task if no data
            return [{
                start: new Date(),
                end: new Date(Date.now() + 86400000), // +1 day
                name: 'No tasks available',
                id: 'placeholder',
                progress: 0,
                type: 'task',
                dependencies: [],
                styles: { progressColor: '#94a3b8' }
            }];
        }

        return wbsData.map((item) => {
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);

            // Map dependencies to Gantt format
            const dependencies = item.dependencies?.map(dep => dep.predecessorId) || [];

            return {
                start,
                end,
                name: item.name,
                id: item.id,
                progress: item.progress,
                type: item.level === 0 ? 'project' : 'task',
                dependencies, // Add dependencies array
                styles: {
                    progressColor: item.status === 'Delayed' ? '#f87171' :
                        item.status === 'At Risk' ? '#fbbf24' : '#4ade80',
                    progressSelectedColor: item.status === 'Delayed' ? '#ef4444' :
                        item.status === 'At Risk' ? '#f59e0b' : '#22c55e'
                }
            };
        });
    }, [wbsData]);

    let columnWidth = 60;
    if (view === ViewMode.Month) {
        columnWidth = 300;
    } else if (view === ViewMode.Week) {
        columnWidth = 250;
    }

    return (
        <div className="glass-card animate-fade-in" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', flexShrink: 0 }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Gantt Chart</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Timeline & Dependencies</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${view === ViewMode.Day ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setView(ViewMode.Day)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                        Day
                    </button>
                    <button
                        className={`btn ${view === ViewMode.Week ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setView(ViewMode.Week)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                        Week
                    </button>
                    <button
                        className={`btn ${view === ViewMode.Month ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setView(ViewMode.Month)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                        Month
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <Gantt
                    tasks={tasks}
                    viewMode={view}
                    listCellWidth={isChecked ? "155px" : ""}
                    columnWidth={columnWidth}
                    barBackgroundColor="var(--color-primary)"
                    barProgressColor="var(--color-primary-dark)"
                    connectorStrokeWidth={1}
                    connectorClassName="" // can be used for custom connector styling
                    headerHeight={50}
                    fontFamily="inherit"
                    fontSize="14px"
                    rowHeight={40}
                    todayColor="rgba(37, 99, 235, 0.1)"
                />
            </div>
        </div>
    );
};

export default GanttSection;
