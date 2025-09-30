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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Hero Section */}
      <section className={`py-16 sm:py-20 ${
        isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100'
      }`}>
        <div className="container-responsive text-center">
          <h1 className="text-responsive-2xl font-bold mb-4 sm:mb-6 px-4">
            About InsurAI
          </h1>
          <p className={`text-lg sm:text-xl leading-relaxed px-4 sm:px-8 lg:px-16 ${
            isDark ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Revolutionizing insurance management with artificial intelligence and smart automation.
            Making insurance accessible, understandable, and efficient for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16">
        <div className="container-responsive">
          <div className="grid-responsive">
            <div className="px-4">
              <h2 className="text-responsive-xl font-bold mb-4 sm:mb-6">Our Mission</h2>
              <p className={`text-base sm:text-lg leading-relaxed mb-6 ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                At InsurAI, we believe insurance should be simple, transparent, and intelligent. 
                Our mission is to harness the power of artificial intelligence to create an 
                insurance experience that truly serves people's needs.
              </p>
              <p className={`text-base sm:text-lg leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                We're building the future of insurance - one where claims are processed instantly, 
                policies are personalized, and customer service is available 24/7 through intelligent automation.
              </p>
            </div>
            <div className={`px-4 rounded-xl p-6 sm:p-8 ${
              isDark ? 'bg-slate-800' : 'bg-blue-50'
            }`}>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Why We Started</h3>
              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-gray-600'
              }`}>
                After experiencing the frustration of traditional insurance processes firsthand, 
                our founders realized that technology could solve these age-old problems. 
                We started InsurAI to create the insurance company we wished existed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={`py-12 sm:py-16 ${
        isDark ? 'bg-slate-800' : 'bg-gray-50'
      }`}>
        <div className="container-responsive">
          <h2 className="text-responsive-xl font-bold text-center mb-8 sm:mb-12 px-4">Our Values</h2>
          <div className="grid-responsive">
            {values.map((value, index) => (
              <div key={index} className={`rounded-xl p-6 sm:p-8 text-center transition-transform hover:scale-105 ${
                isDark ? 'bg-slate-900' : 'bg-white'
              } shadow-lg hover:shadow-xl`}>
                <div className="text-3xl sm:text-4xl mb-4">{value.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">{value.title}</h3>
                <p className={`text-sm sm:text-base ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16">
        <div className="container-responsive">
          <h2 className="text-responsive-xl font-bold text-center mb-8 sm:mb-12 px-4">Meet Our Team</h2>
          <div className="grid-responsive">
            {teamMembers.map((member, index) => (
              <div key={index} className={`rounded-xl p-6 sm:p-8 text-center transition-transform hover:scale-105 ${
                isDark ? 'bg-slate-800' : 'bg-white'
              } shadow-lg hover:shadow-xl`}>
                <div className="text-4xl sm:text-5xl mb-4">{member.image}</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{member.name}</h3>
                <p className={`text-sm sm:text-base font-medium mb-3 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {member.role}
                </p>
                <p className={`text-sm leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className={`py-12 sm:py-16 ${
        isDark ? 'bg-slate-800' : 'bg-gray-50'
      }`}>
        <div className="container-responsive">
          <h2 className="text-responsive-xl font-bold text-center mb-8 sm:mb-12 px-4">Our Journey</h2>
          <div className="max-w-4xl mx-auto px-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center sm:items-start mb-8 sm:mb-12 last:mb-0">
                <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-0 sm:mr-6 ${
                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                } text-white`}>
                  {milestone.icon}
                </div>
                <div className="text-center sm:text-left">
                  <div className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {milestone.year}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{milestone.title}</h3>
                  <p className={`text-sm sm:text-base ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 sm:py-20 ${
        isDark ? 'bg-gradient-to-r from-slate-900 to-slate-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
      }`}>
        <div className="container-responsive text-center">
          <h2 className="text-responsive-xl font-bold text-white mb-4 sm:mb-6 px-4">
            Join Us in Revolutionizing Insurance
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
            Be part of the future where insurance is intelligent, accessible, and truly customer-centric.
          </p>
          <div className="flex-responsive justify-center px-4">
            <a
              href="/careers"
              className="mobile-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-xl text-center"
            >
              View Careers
            </a>
            <a
              href="/contact"
              className="mobile-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 text-center"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;