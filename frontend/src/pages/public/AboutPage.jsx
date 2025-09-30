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
      icon: '💡',
      color: 'blue'
    },
    {
      title: 'Customer-Centric',
      description: 'Every decision we make is focused on improving our customers\' experience.',
      icon: '❤️',
      color: 'red'
    },
    {
      title: 'Transparency',
      description: 'We believe in clear, honest communication and transparent business practices.',
      icon: '🔍',
      color: 'green'
    },
    {
      title: 'Security & Trust',
      description: 'Your data security and privacy are our highest priorities.',
      icon: '🛡️',
      color: 'purple'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                InsurAI
              </span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-4xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Pioneering the Future of Insurance with Artificial Intelligence
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`py-16 ${
        isDark ? 'bg-slate-800/30' : 'bg-white/50'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-4xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Our Mission
              </h2>
              <p className={`text-lg mb-6 ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                At InsurAI, we're on a mission to democratize insurance through the power of artificial intelligence. 
                We believe that everyone deserves access to fair, transparent, and efficient insurance services.
              </p>
              <p className={`text-lg mb-6 ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Our cutting-edge AI technology eliminates traditional barriers, reduces costs, and accelerates 
                processing times while maintaining the highest standards of accuracy and security.
              </p>
              <p className={`text-lg ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                We're not just building software; we're crafting the future of insurance—one algorithm at a time.
              </p>
            </div>
            <div className={`text-center p-8 rounded-2xl ${
              isDark 
                ? 'bg-slate-800/50 border border-slate-700' 
                : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              <div className="text-6xl mb-6">🎯</div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Our Vision
              </h3>
              <p className={`text-lg ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                To become the world's most trusted AI-powered insurance platform, 
                making insurance accessible, affordable, and intelligent for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Our Core Values
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              These values guide every decision we make and every product we build.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className={`text-center p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50'
                    : 'bg-white border border-gray-200 hover:shadow-xl shadow-lg'
                }`}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {value.title}
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className={`py-16 ${
        isDark ? 'bg-slate-800/30' : 'bg-white/50'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Our Journey
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              From startup to industry leader - here's how we've grown and evolved.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full ${
              isDark ? 'bg-slate-600' : 'bg-gray-300'
            }`}></div>

            {milestones.map((milestone, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'justify-start' : 'justify-end'
              }`}>
                <div className={`w-5/12 ${
                  index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'
                }`}>
                  <div className={`p-6 rounded-xl ${
                    isDark
                      ? 'bg-slate-800/50 border border-slate-700'
                      : 'bg-white border border-gray-200 shadow-lg'
                  }`}>
                    <div className="text-3xl mb-3">{milestone.icon}</div>
                    <div className={`text-sm font-semibold mb-2 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {milestone.year}
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {milestone.title}
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 ${
                  isDark 
                    ? 'bg-blue-500 border-slate-800' 
                    : 'bg-blue-500 border-white'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Meet Our Team
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              World-class experts passionate about revolutionizing the insurance industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50'
                    : 'bg-white border border-gray-200 hover:shadow-xl shadow-lg'
                }`}
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className={`text-xl font-semibold mb-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {member.name}
                </h3>
                <p className={`text-sm mb-3 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {member.role}
                </p>
                <p className={`text-sm ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 ${
        isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
      }`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Us on Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of the insurance revolution and experience the future today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              Get Started Today
            </a>
            <a
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105"
            >
              Contact Our Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;