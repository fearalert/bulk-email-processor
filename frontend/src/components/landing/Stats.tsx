/** @format */

const stats = [
  {
    number: '10M+',
    label: 'Emails Delivered',
    description: 'Successfully sent to inboxes worldwide',
  },
  {
    number: '99.9%',
    label: 'Delivery Rate',
    description: 'Industry-leading inbox placement',
  },
  {
    number: '50K+',
    label: 'Happy Users',
    description: 'Businesses trust our platform',
  },
  {
    number: '<2s',
    label: 'Average Response',
    description: 'Lightning-fast email processing',
  },
];

export const Stats = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join the growing community of businesses that rely on our platform
            for their email marketing success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-xl font-semibold text-blue-100 mb-2">
                  {stat.label}
                </div>
                <div className="text-blue-200 text-sm">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
