/** @format */

import { LogOut, Mail, User } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Bulk Email Processor
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{'rohandhakal@gmail.com'}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Handle logout logic here
              }}
              icon={<LogOut className="h-4 w-4" />}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
