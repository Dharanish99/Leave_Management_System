import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { exportToCSV } from '../../lib/utils';
import { Plus, Search, Edit2, Key, UserX, UserCheck, Trash2, Download } from 'lucide-react';
import { toast } from '../../hooks/useToast';
import type { User } from '../../types';

type Tab = 'All' | 'Principal' | 'HoD' | 'Staff' | 'Student';

export function UserManagementPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { users, deactivateUser, activateUser, deleteUser, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. Filter Users by Role Access
  const accessibleUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'principal') return users;
    // HoD sees only their department, but not themselves in the management list
    return users.filter((u) => u.department === currentUser.department && u.id !== currentUser.id);
  }, [users, currentUser]);

  // 2. Filter by Search, Dept, Status, and Tab
  const filteredUsers = useMemo(() => {
    return accessibleUsers.filter((user) => {
      // Tab matching
      if (activeTab !== 'All' && user.role.toLowerCase() !== activeTab.toLowerCase()) return false;
      
      // Status matching
      if (statusFilter === 'Active' && !user.isActive) return false;
      if (statusFilter === 'Inactive' && user.isActive) return false;
      
      // Dept matching
      if (departmentFilter !== 'All' && user.department !== departmentFilter) return false;
      
      // Search matching
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.employeeId?.toLowerCase() || '').includes(query) ||
          (user.studentId?.toLowerCase() || '').includes(query)
        );
      }
      return true;
    });
  }, [accessibleUsers, activeTab, statusFilter, departmentFilter, searchQuery]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(accessibleUsers.map((u) => u.department).filter(Boolean));
    return ['All', ...Array.from(depts)];
  }, [accessibleUsers]);

  const handleToggleStatus = (user: User) => {
    if (user.isActive) {
      deactivateUser(user.id);
      toast.success('User Deactivated', `${user.name} has been marked as inactive.`);
    } else {
      activateUser(user.id);
      toast.success('User Activated', `${user.name} has been re-activated.`);
    }
  };

  const handleResetPassword = (user: User) => {
    // Mock functionality
    toast.success('Password Reset', `A password reset link has been sent to ${user.email}.`);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to permanently delete ${user.name}?`)) {
      deleteUser(user.id);
      toast.success('User Deleted', `${user.name} has been deleted.`);
    }
  };

  const handleBulkDeactivate = () => {
    selectedIds.forEach(id => deactivateUser(id));
    setSelectedIds([]);
    toast.success('Bulk Action', `Deactivated ${selectedIds.length} users.`);
  };

  const handleBulkExport = () => {
    const selectedUsers = users.filter(u => selectedIds.includes(u.id));
    // map it nicely to pseudo AuditLog format for exportToCSV generically
    const formattedData = selectedUsers.map(u => ({
      timestamp: new Date().toISOString(),
      actorName: 'SYSTEM_EXPORT',
      action: 'USER_DATA_EXPORT',
      targetType: 'user',
      detail: `ID: ${u.id} Name: ${u.name} Role: ${u.role} Dept: ${u.department}`,
      id: u.id,
      actorId: 'system',
      targetId: u.id
    }));
    exportToCSV(formattedData as any, 'users_export.csv');
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="User Management" 
          subtitle="Manage roles, access, and system users." 
        />
        <Button onClick={() => navigate('/users/add')} className="shadow-md">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="bg-warm-100 border border-warm-300 shadow-card rounded-xl w-full overflow-hidden p-6">
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-surface-border pb-4 mb-4 custom-scrollbar">
          {(['All', 'Principal', 'HoD', 'Staff', 'Student'] as Tab[]).map((tab) => {
            // HoD cannot see Principal or other HoDs easily if not in dept, but we keep tabs and just show 0
            if (currentUser?.role === 'hod' && (tab === 'Principal' || tab === 'HoD')) return null;
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-ember-50 text-ember-600 font-semibold'
                    : 'text-warm-500 hover:bg-warm-200 hover:text-ink-900'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-9"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input-field"
          >
            {uniqueDepartments.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          
          <div className="flex items-center gap-2 lg:justify-end">
            {selectedIds.length > 0 && (
              <>
                <Button variant="danger" onClick={handleBulkDeactivate} size="sm">
                  Deactivate ({selectedIds.length})
                </Button>
                <Button variant="secondary" onClick={handleBulkExport} size="sm">
                  <Download className="w-4 h-4" /> CSV
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <DataTable
            data={filteredUsers}
            columns={[
              {
                header: '',
                accessor: '_selection',
                render: (row) => (
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds([...selectedIds, row.id]);
                      else setSelectedIds(selectedIds.filter(id => id !== row.id));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-ember-500 border-warm-300 rounded bg-warm-50 focus:ring-ember-500"
                  />
                )
              },
              {
                header: 'User',
                accessor: 'name',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={row.name} size="sm" src={row.avatar} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{row.name}</p>
                      <p className="text-xs text-text-muted">{row.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Role',
                accessor: 'role',
                render: (row) => (
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    row.role === 'principal' ? 'bg-ink-950 text-warm-50' : 
                    row.role === 'hod' ? 'bg-warm-800 text-warm-50' :
                    row.role === 'staff' ? 'bg-warm-200 text-warm-800' : 'bg-ember-50 text-ember-600'
                  }`}>
                    {row.role.toUpperCase()}
                  </span>
                ),
              },
              {
                header: 'Department',
                accessor: 'department',
                render: (row) => <span className="text-sm">{row.department}</span>,
              },
              {
                header: 'ID',
                accessor: 'employeeId',
                render: (row) => <span className="text-sm font-mono text-text-muted">{row.employeeId || row.studentId}</span>,
              },
              {
                header: 'Status',
                accessor: 'isActive',
                render: (row) => (
                  <Badge variant={row.isActive ? 'approved' : 'rejected'}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                accessor: 'id',
                render: (row) => (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/users/edit/${row.id}`); }} title="Edit User">
                      <Edit2 className="w-4 h-4 text-text-muted" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleToggleStatus(row); }} title={row.isActive ? 'Deactivate' : 'Activate'}>
                      {row.isActive ? <UserX className="w-4 h-4 text-text-muted" /> : <UserCheck className="w-4 h-4 text-accent" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleResetPassword(row); }} title="Reset Password">
                      <Key className="w-4 h-4 text-text-muted" />
                    </Button>
                    {currentUser?.role === 'principal' && (
                      <Button variant="ghost" size="sm" title="Delete User" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>
                        <Trash2 className="w-4 h-4 text-status-rejected" />
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
