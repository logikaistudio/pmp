import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { useWBS } from '../context/WBSContext';

const TargetRealizationChart = () => {
    const { generateSCurveData } = useWBS();

    // Generate S-Curve data from WBS
    const data = useMemo(() => {
        const scurveData = generateSCurveData();
        // Format for display
        return scurveData.map((item, index) => ({
            name: `Week ${index + 1}`,
            date: item.date,
            planned: Math.round(item.planned),
            actual: Math.round(item.actual)
        }));
    }, [generateSCurveData]);

    return (
        <div className="glass-card animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Target vs Realization</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>S-Curve Progress Tracking</p>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="var(--text-secondary)"
                            tick={{ fill: 'var(--text-secondary)' }}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="var(--text-secondary)"
                            tick={{ fill: 'var(--text-secondary)' }}
                            axisLine={false}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="planned"
                            stroke="#a78bfa"
                            fill="url(#colorTarget)"
                            strokeWidth={2}
                            name="Target (%)"
                        />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="#4ade80"
                            fill="url(#colorActual)"
                            strokeWidth={2}
                            name="Realization (%)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TargetRealizationChart;
