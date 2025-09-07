/** @format */
import { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { BulkEmailForm } from '../../components/email/BulkEmailForm';
import { EmailLogs } from '../../components/email/EmailLogs';
import { Layout } from '../../components/layout/Layout';
import { emailApi } from '../../api/api';
import { useAuth } from '../../contexts/Authcontext';

const Dashboard = () => {
  const { user } = useAuth();
  const [refreshLogsKey, setRefreshLogsKey] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
  });

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      const logs = await emailApi.getLogs(user.id);

      const total = logs.length;
      const successful = logs.filter((log) => log.status === 'sent').length;
      const failed = logs.filter((log) => log.status === 'failed').length;
      const pending = logs.filter((log) => log.status === 'pending').length;

      setStats({ total, successful, failed, pending });
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, refreshLogsKey]);

  // After sending emails: refresh
  const handleEmailsSent = () => {
    setRefreshLogsKey((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            padding="sm"
            className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Emails</div>
          </Card>

          <Card
            padding="sm"
            className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.successful}
            </div>
            <div className="text-sm text-gray-600">Sent Successfully</div>
          </Card>

          <Card
            padding="sm"
            className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>

          <Card
            padding="sm"
            className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.failed}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </Card>
        </div>

        {/* Bulk Email Form */}
        <BulkEmailForm onEmailsSent={handleEmailsSent} />

        {/* Email Logs */}
        <EmailLogs refreshTrigger={refreshLogsKey} />
      </div>
    </Layout>
  );
};

export default Dashboard;
