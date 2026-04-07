import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useAuditLogStore } from '../../../store/auditLogStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui';
import { AlertCircle, FileText, CheckCircle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { timeAgo } from '../../../lib/utils';
import { api } from '../../../lib/api';

const CHART_COLORS = ['#E8630A', '#0D1117', '#8896A5', '#C8D3DF'];

const tooltipStyle = {
  backgroundColor: '#1A1A15',
  border: '1px solid #DCDCD4',
  borderRadius: '8px',
  color: '#FAFAF7'
};

interface DashboardStats {
  totalActiveUsers: number;
  escalatedPending: number;
  leavesThisMonth: number;
  departmentCount: number;
}

interface AnalyticsData {
  leavesByDepartment: { dept: string; count: number }[];
  leavesByType: { type: string; count: number }[];
  recentActivity: any[];
}

export function PrincipalDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { logs, fetchLogs } = useAuditLogStore();
  
  const [stats, setStats] = useState<DashboardStats>({ totalActiveUsers: 0, escalatedPending: 0, leavesThisMonth: 0, departmentCount: 0 });
  const [analytics, setAnalytics] = useState<AnalyticsData>({ leavesByDepartment: [], leavesByType: [], recentActivity: [] });
  
  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(() => {});
    api.get('/dashboard/analytics').then(res => setAnalytics(res.data)).catch(() => {});
    fetchLogs();
  }, []);

  if (!user) return null;

  const deptData = analytics.leavesByDepartment.map(d => ({
    name: d.dept.split(' ')[0],
    leaves: d.count,
  }));

  const typeLabels: Record<string, string> = { medical: 'Medical', personal: 'Personal', emergency: 'Emergency', academic: 'Academic', other: 'Other' };
  const typeData = analytics.leavesByType.map(d => ({
    name: typeLabels[d.type] || d.type,
    value: d.count,
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-10">
      {/* Welcome */}
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h1 className="page-title">Institution Overview</h1>
          <p className="text-text-secondary mt-1">High-level insights and escalated leave requests.</p>
        </div>
        <Button onClick={() => navigate('/leaves/review')} variant="primary">
          Review Escalated Leaves ({stats.escalatedPending})
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid border border-surface-border rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-surface-border bg-surface-card sm:grid-cols-2 lg:grid-cols-4 shadow-sm">
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Total Active Users</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.totalActiveUsers}</p>
        </div>
        <div className="p-5 flex flex-col justify-center bg-accent/5">
          <div className="flex items-center gap-2 text-accent mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Escalated Pending</span>
          </div>
          <p className="text-3xl font-bold text-accent">{stats.escalatedPending}</p>
        </div>
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-status-approved mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium text-text-secondary">Leaves This Month</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.leavesThisMonth}</p>
        </div>
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-indigo-500 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium text-text-secondary">Departments</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.departmentCount}</p>
        </div>
      </div>

      {/* Recharts Row */}
      <div className="grid lg:grid-cols-2 gap-6 h-[350px]">
        {/* Bar Chart */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-semibold text-text-primary mb-4">Leaves per Department</h3>
          <div className="flex-1 w-full h-[250px]">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBE4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F4F4EF' }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="leaves" fill="#E8630A" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-semibold text-text-primary mb-4">Leave Type Distribution</h3>
          <div className="flex-1 w-full h-[250px] relative">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {typeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend inside container */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              {typeData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-xs font-medium text-text-secondary">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-5 border-b border-surface-border pb-4">
          <h3 className="font-semibold text-text-primary">Recent System Activity</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/audit')}>
            View Audit Log
          </Button>
        </div>
        
        <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-surface-border">
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} className="relative pl-6">
              <div className="absolute left-[-26px] top-1 w-3 h-3 bg-surface border-2 border-accent rounded-full z-10" />
              <div>
                <p className="text-sm font-medium text-text-primary">{log.detail || log.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-muted">{timeAgo(log.timestamp)}</span>
                  <span className="text-xs text-text-muted">&bull;</span>
                  <span className="text-xs font-medium text-accent">{log.actorName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
