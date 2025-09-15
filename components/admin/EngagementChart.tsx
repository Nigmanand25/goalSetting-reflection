
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../shared/Card';

interface EngagementChartProps {
    data: { name: string; goals: number; reflections: number; confidence: number }[];
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data }) => {
    return (
        <Card>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Weekly Engagement</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{
                            top: 5, right: 20, left: -10, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                        <YAxis tick={{ fill: '#64748b' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(51, 65, 85, 0.8)',
                                borderColor: 'rgba(100, 116, 139, 0.5)',
                                color: '#f8fafc',
                                borderRadius: '0.5rem'
                            }}
                            cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="goals" name="Goal Completion (%)" fill="#6366f1" />
                        <Bar dataKey="reflections" name="Reflection Rate (%)" fill="#8b5cf6" />
                        <Bar dataKey="confidence" name="Avg Confidence (%)" fill="#14b8a6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export default EngagementChart;
