import { useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useLeaveStore } from '../../../store/leaveStore';
import { useNavigate } from 'react-router-dom';
import { LeaveCard, Button } from '../../../components/ui';
import { CheckCircle, XCircle, Users, AlertCircle, CalendarDays } from 'lucide-react';

export function HoDDashboard() {
  const { user } = useAuthStore();
  const { getLeavesByDepartment, fetchLeaves } = useLeaveStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  if (!user) return null;

  const deptLeaves = getLeavesByDepartment(user.department);
  
  // Exclude HoD's own leaves from pending review
  const pendingApprovals = deptLeaves.filter(l => l.status === 'pending' && l.applicantId !== user.id);
  const approvedThisMonth = deptLeaves.filter(l => l.status === 'hod_approved' || l.status === 'approved');
  const rejectedThisMonth = deptLeaves.filter(l => l.status === 'rejected');
  
  // Who is on leave today
  const today = new Date().toISOString().split('T')[0];
  const onLeaveToday = deptLeaves.filter(l => 
    (l.status === 'approved' || l.status === 'hod_approved') && 
    l.fromDate <= today && l.toDate >= today
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="page-title">Department Overview ({user.department})</h1>
        <p className="text-text-secondary mt-1">Manage leave applications and department availability.</p>
      </div>

      {/* Stats Row */}
      <div className="grid border border-surface-border rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-surface-border bg-surface-card sm:grid-cols-2 lg:grid-cols-4 shadow-sm">
        <div className="p-5 flex flex-col justify-center bg-accent/5 rounded-t-xl sm:rounded-none sm:rounded-l-xl">
          <div className="flex items-center gap-2 text-accent mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Pending Approvals</span>
          </div>
          <p className="text-3xl font-bold text-accent">{pendingApprovals.length}</p>
        </div>
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-status-approved mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium text-text-secondary">Approved (Total)</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{approvedThisMonth.length}</p>
        </div>
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-status-rejected mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium text-text-secondary">Rejected (Total)</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{rejectedThisMonth.length}</p>
        </div>
        <div className="p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium text-text-secondary">On Leave Today</span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{onLeaveToday.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-5 border-b border-surface-border pb-4">
              <h3 className="font-semibold text-text-primary">Action Required: Pending Approvals</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/leaves/review')}>
                View All
              </Button>
            </div>
            
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.slice(0, 3).map(leave => (
                  <LeaveCard 
                    key={leave.id} 
                    leave={leave}
                    actions={
                      <div className="flex w-full">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          fullWidth 
                          onClick={() => navigate('/leaves/review')}
                        >
                          Review Request
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-text-muted">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20 text-emerald-500" />
                <p>All caught up! No pending leave applications.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
               <CalendarDays className="w-5 h-5 text-accent" />
               <h3 className="font-semibold text-text-primary">On Leave Today</h3>
            </div>
            {onLeaveToday.length > 0 ? (
               <div className="space-y-3">
                 {onLeaveToday.map(leave => (
                   <div key={leave.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-muted transition-colors">
                      <div className="w-8 h-8 rounded-full bg-surface border border-surface-border flex items-center justify-center text-xs font-medium">
                        {leave.applicantName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-text-primary truncate">{leave.applicantName}</p>
                         <p className="text-xs text-text-muted capitalize">{leave.applicantRole}</p>
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
              <p className="text-sm text-text-muted py-4 text-center">No one from {user.department} is on leave today.</p>
            )}
          </div>

          <div className="bg-brand-900 border border-brand-800 rounded-xl shadow-sm p-5 text-white">
             <h3 className="font-semibold mb-2">My Own Leaves</h3>
             <p className="text-sm text-text-muted mb-4">Need to take a break? Apply for your own leave here.</p>
             <Button variant="primary" fullWidth onClick={() => navigate('/leaves/apply')}>
               Apply HoD Leave
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
