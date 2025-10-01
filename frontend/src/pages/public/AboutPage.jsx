import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const AboutPage = () => {
  const { isDark } = useTheme();

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '👩‍💼',
      bio: 'Former McKinsey consultant with 15+ years in insurance and fintech. Led digital transformation at Fortune 500 companies.'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'CTO & AI Lead',
      image: '👨‍💻',
      bio: 'PhD in Machine Learning from Stanford. Previously led AI initiatives at Google and developed cutting-edge insurance algorithms.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: '👩‍💻',
      bio: 'Product management veteran with deep insurance domain expertise. Former VP of Product at leading insurtech companies.'
    },
    {
      name: 'David Kim',
      role: 'Head of Security',
      image: '👨‍🔬',
      bio: 'Cybersecurity expert with 12+ years protecting financial institutions. Certified ethical hacker and security architect.'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'InsurAI was founded with a vision to revolutionize insurance through artificial intelligence.',
      icon: '🚀'
    },
    {
      year: '2021',
      title: 'First AI Model',
      description: 'Launched our first AI-powered claims processing model with 95% accuracy rate.',
      icon: '🤖'
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Raised $50M in Series A funding to expand our AI capabilities and market reach.',
      icon: '💰'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Expanded to 25 countries and processed over 1 million policies.',
      icon: '🌍'
    },
    {
      year: '2024',
      title: 'Industry Recognition',
      description: 'Named "Best InsurTech Innovation" by the Global Insurance Awards.',
      icon: '🏆'
    },
    {
      year: '2025',
      title: 'AI Revolution',
      description: 'Launched next-generation AI platform with predictive analytics and automated underwriting.',
      icon: '⚡'
    }
  ];

  const values = [
    {
      title: 'Innovation First',
      description: 'We constantly push the boundaries of what\'s possible in insurance technology.',
      icon: '💡'
    },
    {
      title: 'Customer-Centric',
      description: 'Every decision we make is focused on improving our customers\' experience.',
      icon: '❤️'
    },
    {
      title: 'Transparency',
      description: 'We believe in clear, honest communication and transparent business practices.',
      icon: '🔍'
    },
    {
      title: 'Security & Trust',
      description: 'Your data security and privacy are our highest priorities.',
      icon: '🛡️'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container-responsive text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            About InsurAI
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed px-4 sm:px-8 lg:px-16 text-gray-600 dark:text-slate-300 max-w-4xl mx-auto">
            Revolutionizing insurance management with artificial intelligence and smart automation.
            Making insurance accessible, understandable, and efficient for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-20">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="px-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Our Mission
              </h2>
              <p className="text-lg sm:text-xl leading-relaxed mb-6 text-gray-600 dark:text-slate-300">
                At InsurAI, we believe insurance should be simple, transparent, and intelligent. 
                Our mission is to harness the power of artificial intelligence to create an 
                insurance experience that truly serves people's needs.
              </p>
              <p className="text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-slate-300">
                We're building the future of insurance - one where claims are processed instantly, 
                policies are personalized, and customer service is available 24/7 through intelligent automation.
              </p>
            </div>
            <div className="px-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 lg:p-10 shadow-xl">
                <h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
                  Why We Started
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-gray-600 dark:text-slate-300">
                  After experiencing the frustration of traditional insurance processes firsthand, 
                  our founders realized that technology could solve these age-old problems. 
                  We started InsurAI to create the insurance company we wished existed.
                </p>
                <div className="mt-6 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-slate-800 transition-colors duration-300">
        <div className="container-responsive">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 lg:mb-16 px-4 text-gray-900 dark:text-white">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg group"
              >
                <div className="text-5xl sm:text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-20">
        <div className="container-responsive">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 lg:mb-16 px-4 text-gray-900 dark:text-white">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg group"
              >
                <div className="text-6xl sm:text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {member.image}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-base sm:text-lg font-medium mb-4 text-blue-600 dark:text-blue-400">
                  {member.role}
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-slate-300">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-slate-800 transition-colors duration-300">
        <div className="container-responsive">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 lg:mb-16 px-4 text-gray-900 dark:text-white">
            Our Journey
          </h2>
          <div className="max-w-4xl mx-auto px-4">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500 hidden sm:block"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex flex-col sm:flex-row items-start mb-12 last:mb-0 group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-2xl mb-4 sm:mb-0 sm:mr-8 shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {milestone.icon}
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-1">
                    <div className="text-sm font-semibold mb-2 text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                      {milestone.title}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white">
        <div className="container-responsive text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 px-4">
            Join Us in Revolutionizing Insurance
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl mb-8 lg:mb-12 px-4 text-blue-100 max-w-3xl mx-auto">
            Be part of the future where insurance is intelligent, accessible, and truly customer-centric.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
            <a
              href="/careers"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-xl transform"
            >
              <span>View Careers</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 transform"
            >
              <span>Get in Touch</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20">
        <div className="container-responsive">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '1M+', label: 'Policies Processed' },
              { value: '25+', label: 'Countries Served' },
              { value: '95%', label: 'AI Accuracy Rate' },
              { value: '24/7', label: 'Customer Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-base sm:text-lg text-gray-600 dark:text-slate-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;