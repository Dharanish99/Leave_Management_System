import { useState, useMemo, useEffect } from 'react';
import { useAuditLogStore } from '../../store/auditLogStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Download, Filter, FileText } from 'lucide-react';
import type { AuditLog } from '../../types';

export function AuditLogPage() {
  const { logs, fetchLogs, exportCSV } = useAuditLogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          log.actorName.toLowerCase().includes(q) ||
          log.targetId?.toLowerCase().includes(q) ||
          log.detail?.toLowerCase().includes(q);
        
        if (!matchesSearch) return false;
      }

      if (actionFilter !== 'All' && log.action !== actionFilter) {
        return false;
      }

      return true;
    });
  }, [logs, searchQuery, actionFilter]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map(l => l.action));
    return ['All', ...Array.from(actions)];
  }, [logs]);

  const handleExport = () => {
    exportCSV({ action: actionFilter !== 'All' ? actionFilter : undefined } as any);
  };

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'info';
    if (action.includes('LOGOUT')) return 'default';
    if (action.includes('APPROVED')) return 'approved';
    if (action.includes('REJECTED') || action.includes('DELETED')) return 'rejected';
    if (action.includes('APPLIED') || action.includes('FORWARDED')) return 'pending';
    return 'default';
  };

  return (
    <div className="animate-fade-in max-w-[1200px] mx-auto flex flex-col gap-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="System Audit Log" 
          subtitle="Immutable trail of all critical system actions restricted to administrators." 
        />
        <Button onClick={handleExport} variant="secondary" className="shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="card w-full border-t border-surface-border">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by actor, target ID, or detail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-9"
            />
          </div>
          
          <div className="relative w-full">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="input-field w-full pl-9 appearance-none"
            >
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action === 'All' ? 'All Actions' : action.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <DataTable
            data={filteredLogs}
            columns={[
              {
                header: 'Timestamp',
                accessor: 'timestamp',
                sortable: true,
                render: (row: AuditLog) => (
                  <span className="text-sm border-b border-dashed border-text-muted/30 pb-0.5 cursor-help" title={new Date(row.timestamp).toLocaleString()}>
                    {new Date(row.timestamp).toLocaleString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )
              },
              {
                header: 'Actor',
                accessor: 'actorName',
                sortable: true,
                render: (row: AuditLog) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">{row.actorName}</span>
                    <span className="text-[10px] uppercase text-text-muted bg-surface-muted px-1.5 py-0.5 rounded w-max mt-1">
                      {row.actorId}
                    </span>
                  </div>
                )
              },
              {
                header: 'Action',
                accessor: 'action',
                sortable: true,
                render: (row: AuditLog) => (
                  <Badge variant={getActionColor(row.action) as any}>
                    {row.action}
                  </Badge>
                )
              },
              {
                header: 'Target Type',
                accessor: 'targetType',
                render: (row: AuditLog) => (
                  <div className="flex items-center gap-1.5 text-text-secondary text-sm capitalize whitespace-nowrap">
                    {row.targetType === 'leave' && <FileText className="w-3 h-3 text-text-muted" />}
                    {row.targetType}
                  </div>
                )
              },
              {
                header: 'Details',
                accessor: 'detail',
                render: (row: AuditLog) => (
                  <div className="min-w-[200px] max-w-[350px] break-words text-sm text-text-secondary pt-1">
                    {row.detail || '-'}
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
