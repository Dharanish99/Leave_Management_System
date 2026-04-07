import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLeaveStore } from '../../store/leaveStore';
import { LeaveCard, PageHeader, Select, EmptyState, Button } from '../../components/ui';
import { FileText, Download, XCircle } from 'lucide-react';
import { LEAVE_TYPES } from '../../lib/constants';
import { toast } from '../../hooks/useToast';

export function MyLeavesPage() {
  const { user } = useAuthStore();
  const { getLeavesByUser, cancelLeave, fetchMyLeaves } = useLeaveStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  if (!user) return null;

  const myLeaves = getLeavesByUser(user.id);

  const filteredLeaves = useMemo(() => {
    return myLeaves
      .filter((l) => statusFilter === 'all' || l.status === statusFilter)
      .filter((l) => typeFilter === 'all' || l.leaveType === typeFilter)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [myLeaves, statusFilter, typeFilter]);

  const handleCancel = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this leave request?")) {
      cancelLeave(id);
      toast.info('Leave Cancelled', 'Your leave request has been cancelled and balance refunded.');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'hod_approved', label: 'HoD Approved' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(LEAVE_TYPES).map(([k, v]) => ({ value: k, label: v.label }))
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="My Leaves" 
        subtitle="View and track all your leave applications and their status."
      />

      <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        </div>
        <div className="flex-1">
          <Select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        </div>
      </div>

      <div>
        {filteredLeaves.length > 0 ? (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <LeaveCard 
                key={leave.id} 
                leave={leave}
                actions={
                  <div className="flex justify-end w-full gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {leave.status === 'pending' || leave.status === 'hod_approved' ? (
                      <Button 
                        variant="danger" 
                        size="sm" 
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => handleCancel(leave.id)}
                      >
                        Cancel Leave
                      </Button>
                    ) : leave.status === 'approved' ? (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        leftIcon={<Download className="w-4 h-4" />}
                        onClick={() => toast.success('Downloaded', 'Leave approval document downloaded.')}
                      >
                        Download PDF
                      </Button>
                    ) : null}
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm">
            <EmptyState 
              icon={FileText} 
              title="No leaves found" 
              description={myLeaves.length > 0 ? "No leaves match your current filters. Try changing them." : "You haven't applied for any leaves yet."}
            />
          </div>
        )}
      </div>
    </div>
  );
}
