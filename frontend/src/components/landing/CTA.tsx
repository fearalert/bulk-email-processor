/** @format */

import { Link } from 'react-router-dom';
import { Send, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 lg:p-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400 to-pink-500 rounded-full opacity-10 transform -translate-x-12 translate-y-12"></div>

          <div className="relative">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Ready to Transform Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Email Marketing?
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of businesses already using our platform to reach
              their audience effectively. Start your free trial today and see
              the difference.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                  icon={<Send className="h-5 w-5" />}>
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  icon={<ArrowRight className="h-5 w-5" />}>
                  Sign In Now
                </Button>
              </Link>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              No credit card required • Free forever plan available • Cancel
              anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
