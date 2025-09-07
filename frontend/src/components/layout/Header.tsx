/** @format */

import { useState } from 'react';
import { LogOut, Mail, User, Menu } from 'lucide-react';
import { authApi } from '../../api/api';
import { useAuth } from '../../contexts/Authcontext';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Bulk Email Processor
            </h1>
          </div>

          {/* Desktop Menu */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link
                to="/email-logs"
                className="text-gray-700 hover:text-blue-600">
                Email Logs
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-600">
                Profile
              </Link>

              {/* <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div> */}
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {isAuthenticated && (
            <div className="md:hidden">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden flex flex-col space-y-2 mt-2 pb-3 border-t border-gray-200">
            <Link
              to="/dashboard"
              className="px-2 py-1 text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link
              to="/email-logs"
              className="px-2 py-1 text-gray-700 hover:text-blue-600">
              Email Logs
            </Link>
            <Link
              to="/profile"
              className="px-2 py-1 text-gray-700 hover:text-blue-600">
              Profile
            </Link>

            <div className="flex items-center space-x-2 px-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="mx-2 flex items-center space-x-1"
              onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
