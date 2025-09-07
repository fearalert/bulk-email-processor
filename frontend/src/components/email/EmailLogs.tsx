/** @format */
import { useEffect, useState } from 'react';
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';
import { emailApi } from '../../api/api';
import { useAuth } from '../../contexts/Authcontext';
import { useSocket } from '../../hooks/useSocket';
import type { EmailLog } from '../../types';

interface EmailLogsProps {
  refreshTrigger?: number;
}

export const EmailLogs = ({ refreshTrigger }: EmailLogsProps) => {
  const { user } = useAuth();
  const { connected, on, off } = useSocket();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    if (!user) return;
    try {
      const data = await emailApi.getLogs(user.id);
      setLogs(data);
    } catch {
      toast.error('Failed to fetch email logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch or on refreshTrigger
  useEffect(() => {
    fetchLogs();
  }, [user, refreshTrigger]);

  // Real-time updates
  useEffect(() => {
    if (!connected || !user) return;

    const handleEmailStatusUpdate = (data: {
      logId: number;
      status: string;
      email: string;
    }) => {
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === data.logId
            ? {
                ...log,
                status: data.status as any,
                updated_at: new Date().toISOString(),
              }
            : log
        )
      );
      toast.success(`Email to ${data.email} ${data.status}`);
    };

    const handleBulkEmailProgress = (data: {
      processed: number;
      total: number;
      userId: number;
    }) => {
      if (data.userId === user.id) {
        toast.loading(`Processing emails: ${data.processed}/${data.total}`, {
          id: 'bulk-progress',
        });
        if (data.processed === data.total) {
          toast.dismiss('bulk-progress');
          toast.success('Bulk email processing completed!');
          fetchLogs();
        }
      }
    };

    on('emailStatusUpdate', handleEmailStatusUpdate);
    on('bulkEmailProgress', handleBulkEmailProgress);

    return () => {
      off('emailStatusUpdate', handleEmailStatusUpdate);
      off('bulkEmailProgress', handleBulkEmailProgress);
    };
  }, [connected, user, on, off]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const getStatusIcon = (status: string) =>
    status === 'sent' ? (
      <CheckCircle className="h-4 w-4" />
    ) : status === 'failed' ? (
      <XCircle className="h-4 w-4" />
    ) : (
      <Clock className="h-4 w-4" />
    );

  const getStatusVariant = (status: string) =>
    status === 'sent' ? 'success' : status === 'failed' ? 'error' : 'warning';

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  if (loading)
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Email Logs</h2>
          <div
            className={`flex items-center space-x-2 text-sm ${
              connected ? 'text-green-600' : 'text-red-600'
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>{connected ? 'Live Updates' : 'Disconnected'}</span>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          icon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            No email logs found. Send some emails to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <p className="font-medium text-gray-900">{log.email_to}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(log.created_at)}</span>
                      {log.status === 'failed' &&
                        log.updated_at !== log.created_at && (
                          <span>• Updated: {formatDate(log.updated_at)}</span>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    Template #{log.template_id}
                  </span>
                  <Badge variant={getStatusVariant(log.status)}>
                    {log.status}
                  </Badge>
                </div>
              </div>
              {log.error_message && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  <strong>Error:</strong> {log.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
