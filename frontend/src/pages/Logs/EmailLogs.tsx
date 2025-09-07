/** @format */
import { useState, useEffect } from 'react';
import { EmailLogs } from '../../components/email/EmailLogs';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../contexts/Authcontext';

const LogsPage = () => {
  const { user } = useAuth();
  const [refreshLogsKey, _setRefreshLogsKey] = useState(0);

  useEffect(() => {}, [user, refreshLogsKey]);

  return (
    <Layout>
      <EmailLogs refreshTrigger={refreshLogsKey} />
    </Layout>
  );
};

export default LogsPage;
