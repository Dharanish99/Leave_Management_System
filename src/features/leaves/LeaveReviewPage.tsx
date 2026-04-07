import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLeaveStore } from '../../store/leaveStore';
import { DataTable, PageHeader, Button, Badge, Modal, Textarea } from '../../components/ui';
import { Check, X, Forward, Paperclip } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { LEAVE_TYPES } from '../../lib/constants';
import { BASE_URL } from '../../lib/api';
import type { LeaveApplication } from '../../types';
import { toast } from '../../hooks/useToast';

type Tab = 'all' | 'pending' | 'approved' | 'rejected' | 'forwarded';

export function LeaveReviewPage() {
  const { user } = useAuthStore();
  const { leaves, getLeavesByDepartment, approveLeave, rejectLeave, forwardLeave, fetchLeaves } = useLeaveStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'forward' | null>(null);
  const [remark, setRemark] = useState('');

  if (!user || (user.role !== 'hod' && user.role !== 'principal')) return null;

  // Fetch leaves on mount
  useEffect(() => {
    fetchLeaves();
  }, []);

  // Data Filtering based on Role
  const baseLeaves = useMemo(() => {
    if (user.role === 'hod') {
      return getLeavesByDepartment(user.department).filter(l => l.applicantId !== user.id);
    }
    // Principal sees all
    return leaves;
  }, [user, leaves, getLeavesByDepartment]);

  // Data Filtering based on Tab
  const filteredLeaves = useMemo(() => {
    return baseLeaves.filter(leave => {
      switch (activeTab) {
        case 'pending':
          if (user.role === 'principal') return leave.status === 'hod_approved';
          return leave.status === 'pending';
        case 'approved':
          return leave.status === 'approved' || (user.role === 'hod' && leave.status === 'hod_approved');
        case 'rejected':
          return leave.status === 'rejected';
        case 'forwarded':
          return leave.status === 'hod_approved';
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [baseLeaves, activeTab, user.role]);

  const handleActionClick = (leave: LeaveApplication, type: 'approve' | 'reject' | 'forward') => {
    setSelectedLeave(leave);
    setActionType(type);
    setRemark('');
  };

  const confirmAction = () => {
    if (!selectedLeave || !actionType) return;
    
    // Validate remark for rejection
    if (actionType === 'reject' && remark.trim().length < 5) {
      toast.error('Remark Required', 'Please provide a valid reason for rejection.');
      return;
    }

    const finalRemark = remark.trim() || (actionType === 'approve' ? 'Approved.' : 'Processed.');

    if (actionType === 'approve') {
      approveLeave(selectedLeave.id, finalRemark, user.role as 'hod' | 'principal');
      toast.success('Leave Approved', 'The leave application has been approved.');
    } else if (actionType === 'reject') {
      rejectLeave(selectedLeave.id, finalRemark, user.role as 'hod' | 'principal');
      toast.warning('Leave Rejected', 'The leave application has been rejected and balance refunded.');
    } else if (actionType === 'forward') {
      forwardLeave(selectedLeave.id, finalRemark);
      toast.info('Leave Forwarded', 'The application was forwarded to the Principal.');
    }

    setSelectedLeave(null);
    setActionType(null);
  };

  const columns = [
    { 
      header: 'Applicant', 
      accessor: 'applicantName',
      render: (item: LeaveApplication) => (
        <div>
          <p className="font-medium text-text-primary">{item.applicantName}</p>
          <p className="text-[11px] text-text-muted capitalize">{item.applicantRole}</p>
        </div>
      )
    },
    { 
      header: 'Dept', 
      accessor: 'department',
      render: (item: LeaveApplication) => <span className="text-xs">{item.department}</span>
    },
    { 
      header: 'Type', 
      accessor: 'leaveType',
      render: (item: LeaveApplication) => <span className="text-sm font-medium">{LEAVE_TYPES[item.leaveType]?.label}</span>
    },
    { 
      header: 'Dates', 
      accessor: 'fromDate',
      render: (item: LeaveApplication) => (
        <div className="text-xs whitespace-nowrap text-text-secondary">
          {formatDate(item.fromDate)} 
          {item.fromDate !== item.toDate && <><br/>to {formatDate(item.toDate)}</>}
        </div>
      )
    },
    { header: 'Days', accessor: 'totalDays' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (item: LeaveApplication) => <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (item: LeaveApplication) => {
        // Can HoD act?
        const isHodPending = user.role === 'hod' && item.status === 'pending';
        // Can Principal act?
        const isPrinPending = user.role === 'principal' && (item.status === 'hod_approved' || item.status === 'pending');

        if (!isHodPending && !isPrinPending) return <span className="text-xs text-text-muted italic">Processed</span>;

        return (
          <div className="flex gap-1.5">
            <Button 
              variant="secondary" 
              size="sm" 
              className="px-2"
              title="Reject"
              onClick={(e) => { e.stopPropagation(); handleActionClick(item, 'reject'); }}
            >
              <X className="w-4 h-4 text-red-500" />
            </Button>
            
            {user.role === 'hod' && (
               <Button 
                 variant="secondary" 
                 size="sm" 
                 className="px-2"
                 title="Forward to Principal"
                 onClick={(e) => { e.stopPropagation(); handleActionClick(item, 'forward'); }}
               >
                 <Forward className="w-4 h-4 text-accent" />
               </Button>
            )}

            <Button 
              variant="primary" 
              size="sm" 
              className="px-2"
              title="Approve"
              onClick={(e) => { e.stopPropagation(); handleActionClick(item, 'approve'); }}
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  const getModalTitle = () => {
    switch (actionType) {
      case 'approve': return 'Approve Leave Request';
      case 'reject': return 'Reject Leave Request';
      case 'forward': return 'Forward to Principal';
      default: return 'Review Leave Request';
    }
  };

  const getConfirmButtonColor = () => {
    switch (actionType) {
      case 'approve': return 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent';
      case 'reject': return 'bg-red-600 hover:bg-red-700 text-white border-transparent';
      case 'forward': return 'bg-accent hover:bg-accent-hover text-white border-transparent';
      default: return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Leave Review" 
        subtitle={user.role === 'hod' ? 'Review and manage departmental leave requests.' : 'Review institution-wide escalated leave requests.'}
      />

      <div className="bg-surface-card border border-surface-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex px-4 pt-4 border-b border-surface-border gap-6 overflow-x-auto custom-scrollbar">
          {(['pending', 'approved', 'rejected', 'forwarded', 'all'] as Tab[]).map((tab) => {
             if (tab === 'forwarded' && user.role === 'principal') return null; // Principal doesn't need "forwarded" distinct from incoming
             return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Data Table */}
        <div className="p-1">
          <DataTable 
             columns={columns} 
             data={filteredLeaves} 
             className="border-0 shadow-none"
             loading={false}
          />
        </div>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={!!selectedLeave && !!actionType}
        onClose={() => { setSelectedLeave(null); setActionType(null); }}
        title={getModalTitle()}
      >
        {selectedLeave && (
          <div className="space-y-6">
            <div className="bg-surface-muted/50 p-4 rounded-lg border border-surface-border space-y-3">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold text-text-primary text-sm">{selectedLeave.applicantName}</h4>
                  <p className="text-xs text-text-muted capitalize">{selectedLeave.applicantRole} • {selectedLeave.department}</p>
                </div>
                <Badge variant={selectedLeave.status}>{selectedLeave.status.replace('_', ' ')}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-surface-border">
                <div>
                   <span className="text-text-muted text-xs block">Leave Type</span>
                   <span className="font-medium">{LEAVE_TYPES[selectedLeave.leaveType]?.label} ({selectedLeave.totalDays} days)</span>
                </div>
                <div>
                   <span className="text-text-muted text-xs block">Dates</span>
                   <span className="font-medium">{formatDate(selectedLeave.fromDate)} to {formatDate(selectedLeave.toDate)}</span>
                </div>
              </div>
              <div>
                 <span className="text-text-muted text-xs block">Reason</span>
                 <p className="text-sm text-text-secondary mt-0.5">{selectedLeave.reason}</p>
              </div>
              {selectedLeave.attachmentUrl && (
                <div className="pt-2 border-t border-surface-border">
                  <span className="text-text-muted text-xs block mb-1">Attachment</span>
                  <a 
                    href={`${BASE_URL.replace('/api', '')}${selectedLeave.attachmentUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline bg-accent/5 px-3 py-1.5 rounded"
                  >
                    <Paperclip className="w-4 h-4" />
                    View Document
                  </a>
                </div>
              )}
            </div>

            <Textarea 
              label="Add Remark (Reason/Notes)"
              placeholder={actionType === 'reject' ? "Please explain why the leave is rejected (required)..." : "Add any notes (optional)..."}
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setSelectedLeave(null); setActionType(null); }}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmAction} 
                className={getConfirmButtonColor()}
              >
                Confirm {actionType && actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
