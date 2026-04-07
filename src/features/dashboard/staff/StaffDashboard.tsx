import { useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useLeaveStore } from '../../../store/leaveStore';
import { Button, EmptyState, DataTable } from '../../../components/ui';
import { Calendar, CheckCircle, Clock, FilePlus2, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../lib/utils';
import { LEAVE_TYPES } from '../../../lib/constants';

// Shared BalanceBar
const BalanceBar = ({ type, used, total }: { type: string, used: number, total: number }) => {
  const percentage = Math.min(100, Math.max(0, (used / total) * 100));
  const isDanger = total - used <= 1;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-text-primary">{LEAVE_TYPES[type]?.label || type}</span>
        <span className="text-text-secondary">
          {total - used} <span className="text-text-muted">/ {total} left</span>
        </span>
      </div>
      <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-status-rejected' : 'bg-accent'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export function StaffDashboard() {
  const { user } = useAuthStore();
  const { getLeavesByUser, getBalanceByUser, getLeavesByDepartment, fetchMyLeaves, fetchBalance } = useLeaveStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyLeaves();
    fetchBalance();
  }, []);

  if (!user) return null;

  const myLeaves = getLeavesByUser(user.id);
  const myBalance = getBalanceByUser(user.id);
  const deptLeaves = getLeavesByDepartment(user.department)
    .filter(l => l.applicantId !== user.id && l.status === 'approved' && new Date(l.toDate) >= new Date());

  const pendingLeaves = myLeaves.filter(l => l.status === 'pending' || l.status === 'hod_approved').length;
  const approvedLeaves = myLeaves.filter(l => l.status === 'approved').length;
  
  // Recent 5 leaves
  const recentLeaves = [...myLeaves]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const columns = [
    { header: 'Applied On', accessor: 'appliedAt', render: (item: any) => formatDate(item.appliedAt) },
    { header: 'Type', accessor: 'leaveType', render: (item: any) => LEAVE_TYPES[item.leaveType]?.label },
    { header: 'Dates', accessor: 'fromDate', render: (item: any) => `${formatDate(item.fromDate)} - ${formatDate(item.toDate)}` },
    { header: 'Role', accessor: 'substituteId', render: (item: any) => item.substituteId ? <span className="text-emerald-500 font-medium">Arranged</span> : <span className="text-text-muted">-</span> },
    { header: 'Status', accessor: 'status', render: (item: any) => (
      <span className={`capitalize ${
        item.status === 'approved' ? 'text-status-approved' : 
        item.status === 'rejected' ? 'text-status-rejected' : 
        item.status === 'cancelled' ? 'text-text-muted' : 
        'text-status-pending'
      }`}>
        {item.status.replace('_', ' ')}
      </span>
    )},
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Welcome & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Hello, {user.name} 👋</h1>
          <p className="text-text-secondary mt-1">Here is your leave summary and recent activity.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="secondary" leftIcon={<FileText className="w-4 h-4" />} onClick={() => navigate('/leaves/my')} fullWidth>
            My Leaves
          </Button>
          <Button leftIcon={<FilePlus2 className="w-4 h-4" />} onClick={() => navigate('/leaves/apply')} fullWidth>
            Apply Leave
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid border border-surface-border rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-surface-border bg-surface-card sm:grid-cols-2 xl:grid-cols-5 shadow-sm">
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Total Applied</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{myLeaves.length}</p>
        </div>
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-status-approved mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium text-text-secondary">Approved</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{approvedLeaves}</p>
        </div>
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-status-pending mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium text-text-secondary">Pending</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{pendingLeaves}</p>
        </div>
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium text-text-secondary">Subs Arranged</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{myLeaves.filter(l => l.substituteId).length}</p>
        </div>
        <div className="p-5 flex flex-col justify-center bg-accent/5 rounded-b-xl xl:rounded-none xl:rounded-r-xl">
          <div className="flex items-center gap-2 text-accent mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium text-accent">Remaining Balance</span>
          </div>
          <p className="text-3xl font-bold text-accent">
            {myBalance ? (myBalance.totalAllotted - myBalance.totalUsed) : 0}
            <span className="text-base font-normal opacity-70 ml-1">days</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border flex justify-between items-center">
              <h3 className="font-semibold text-text-primary">Recent Applications</h3>
              <button 
                onClick={() => navigate('/leaves/my')}
                className="text-xs font-medium text-accent hover:text-accent-hover"
              >
                View all
              </button>
            </div>
            {recentLeaves.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={recentLeaves} 
                className="border-0 rounded-none shadow-none"
              />
            ) : (
              <EmptyState 
                icon={FileText} 
                title="No leaves yet" 
                description="You haven't applied for any leaves recently."
                className="py-12"
              />
            )}
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm p-5">
             <h3 className="font-semibold text-text-primary mb-5">Upcoming Leaves in {user.department}</h3>
             {deptLeaves.length > 0 ? (
               <div className="space-y-3">
                 {deptLeaves.slice(0, 4).map(leave => (
                   <div key={leave.id} className="flex justify-between items-center p-3 rounded-lg border border-surface-border">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary font-medium">
                          {leave.applicantName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{leave.applicantName}</p>
                          <p className="text-xs text-text-muted">{LEAVE_TYPES[leave.leaveType]?.label}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm text-text-primary font-medium">{formatDate(leave.fromDate)}</p>
                        <p className="text-xs text-text-muted">{leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-text-muted text-center py-6 border border-dashed border-surface-border rounded-lg">No upcoming leaves in your department.</p>
             )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-text-primary mb-5">Leave Balance Breakdown</h3>
            {myBalance ? (
              <div className="space-y-1">
                <BalanceBar type="medical" used={12 - myBalance.medical} total={12} />
                <BalanceBar type="personal" used={6 - myBalance.personal} total={6} />
                <BalanceBar type="emergency" used={3 - myBalance.emergency} total={3} />
                <BalanceBar type="academic" used={5 - myBalance.academic} total={5} />
                <BalanceBar type="other" used={4 - (myBalance.other ?? 4)} total={4} />
              </div>
            ) : (
              <p className="text-sm text-text-muted">Balance data unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
