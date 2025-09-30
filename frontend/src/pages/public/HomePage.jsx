import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const HomePage = () => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Claims Processing',
      description: 'Intelligent claim processing with advanced fraud detection and automated approval workflows.',
      details: 'Our AI analyzes claims in real-time, detecting patterns and anomalies to ensure fair and fast processing.'
    },
    {
      icon: '📊',
      title: 'Smart Analytics Dashboard',
      description: 'Real-time insights, risk assessment, and comprehensive reporting for informed decision-making.',
      details: 'Get detailed analytics on policy performance, claim trends, and risk metrics to optimize your insurance strategy.'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-grade security with end-to-end encryption and compliance with industry standards.',
      details: 'Your data is protected with military-grade encryption, multi-factor authentication, and regular security audits.'
    },
    {
      icon: '🏆',
      title: 'Award-Winning Platform',
      description: 'Recognized for innovation in insurance technology and customer satisfaction.',
      details: 'Winner of multiple industry awards for digital transformation and customer experience excellence.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast Processing',
      description: 'Process claims and policies in minutes, not days, with our optimized workflow engine.',
      details: 'Our advanced algorithms and streamlined processes reduce processing time by up to 90%.'
    },
    {
      icon: '🌐',
      title: 'Global Coverage',
      description: 'Comprehensive insurance solutions with international coverage and local expertise.',
      details: 'Operating in 50+ countries with local compliance and 24/7 multilingual support.'
    }
  ];

  const stats = [
    { value: '1M+', label: 'Policies Managed', icon: '📋' },
    { value: '99.9%', label: 'Uptime Guarantee', icon: '⚡' },
    { value: '24/7', label: 'Customer Support', icon: '🎧' },
    { value: '50+', label: 'Countries Served', icon: '🌍' }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo Animation */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="text-8xl mb-4 animate-pulse">🛡️</div>
                <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${
                  isDark ? 'bg-blue-400' : 'bg-blue-500'
                }`}></div>
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                InsurAI
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
              The Future of Insurance Management
            </p>
            
            <p className={`text-lg mb-12 max-w-4xl mx-auto ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Revolutionizing insurance with artificial intelligence, machine learning, and cutting-edge technology. 
              Experience seamless policy management, instant claim processing, and intelligent risk assessment.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/about"
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 border-2 ${
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                Learn More
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center p-6 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDark 
                      ? 'bg-slate-800/50 border border-slate-700' 
                      : 'bg-white/70 border border-gray-200 shadow-lg'
                  }`}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className={`text-2xl font-bold mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${
        isDark ? 'bg-slate-800/30' : 'bg-white/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose InsurAI?
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Experience the next generation of insurance technology with features designed for the modern world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50'
                    : 'bg-white border border-gray-200 hover:shadow-xl shadow-lg'
                }`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-base mb-4 ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
                <p className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {feature.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${
        isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
      }`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Insurance Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who have revolutionized their insurance management with InsurAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              Start Your Free Trial
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;