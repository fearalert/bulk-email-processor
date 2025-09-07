/** @format */

import { Mail } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

const EmailVerification = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-6">
          A verification link has been sent to your email. Please check your
          inbox and follow the instructions to activate your account.
        </p>
        <Link to="/login">
          <Button className="w-full">Back to Login</Button>
        </Link>
      </Card>
    </div>
  );
};

export default EmailVerification;
