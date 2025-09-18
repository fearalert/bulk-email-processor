/** @format */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/Authcontext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const sanitizeInput = (value: string) => value.trim().replace(/<[^>]*>/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanToken = sanitizeInput(token);
    const cleanPassword = sanitizeInput(newPassword);
    const cleanConfirm = sanitizeInput(confirmPassword);

    if (!cleanToken) {
      toast.error('Reset token is required');
      return;
    }
    if (!cleanPassword) {
      toast.error('Password is required');
      return;
    }
    if (cleanPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (cleanPassword !== cleanConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(cleanToken, cleanPassword);
      toast.success('Password reset successful! You can now login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Reset Your Password
          </h2>
          <p className="text-gray-600 mt-2">Enter a new password to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6">
          <Input
            label="Reset Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter the token from your email"
            icon={<Key className="h-5 w-5 text-gray-400" />}
            required
          />
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}>
            Reset Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
