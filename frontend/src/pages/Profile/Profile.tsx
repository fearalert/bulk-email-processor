/** @format */

import { useAuth } from '../../contexts/Authcontext';
import { Card } from '../../components/ui/Card';
import { User } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">You need to login to view your profile.</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card className="p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              <p className="text-gray-600">Manage your account details</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium text-gray-900">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="text-lg font-medium text-gray-900">{user.id}</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
