/** @format */

import { Zap, Upload, Clock, Mail, Target, Globe } from 'lucide-react';
import { Card } from '../ui/Card';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Send thousands of emails in minutes with our optimized delivery infrastructure.',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Upload,
    title: 'Easy Import',
    description:
      'Upload CSV files or paste email lists directly. We handle validation automatically.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: Clock,
    title: 'Instant Delivery',
    description:
      'Advanced queue management ensures your emails are delivered without delays.',
    color: 'from-red-400 to-rose-500',
  },
  {
    icon: Mail,
    title: 'Beautiful Templates',
    description:
      'Choose from professionally designed templates or create your own custom designs.',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    icon: Target,
    title: 'Smart Targeting',
    description:
      'Segment your audience and personalize messages for better engagement rates.',
    color: 'from-pink-400 to-red-500',
  },
  {
    icon: Globe,
    title: 'Global Delivery',
    description:
      'Reliable email delivery worldwide with multiple server locations and redundancy.',
    color: 'from-emerald-400 to-teal-500',
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Scale Your Outreach
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features you
            need to run successful email campaigns at any scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50">
                <div className="text-center">
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
