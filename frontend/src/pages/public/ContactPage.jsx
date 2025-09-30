import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Us',
      details: 'hello@insurai.com',
      subtext: 'Get in touch via email',
      action: 'mailto:hello@insurai.com'
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      subtext: '24/7 Customer Support',
      action: 'tel:+15551234567'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      details: '123 Innovation Drive',
      subtext: 'San Francisco, CA 94105',
      action: 'https://maps.google.com/?q=123+Innovation+Drive+San+Francisco+CA'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      details: 'Available 24/7',
      subtext: 'Instant support',
      action: '/chatbot'
    }
  ];

  const officeLocations = [
    {
      city: 'San Francisco',
      country: 'USA',
      address: '123 Innovation Drive, San Francisco, CA 94105',
      phone: '+1 (555) 123-4567',
      email: 'sf@insurai.com',
      flag: '🇺🇸'
    },
    {
      city: 'London',
      country: 'UK',
      address: '456 Tech Street, London EC2A 4DP',
      phone: '+44 20 7123 4567',
      email: 'london@insurai.com',
      flag: '🇬🇧'
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      address: '789 Business Boulevard, Singapore 018956',
      phone: '+65 6123 4567',
      email: 'singapore@insurai.com',
      flag: '🇸🇬'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales & Partnerships' },
    { value: 'support', label: 'Technical Support' },
    { value: 'media', label: 'Media & Press' },
    { value: 'careers', label: 'Careers' },
    { value: 'feedback', label: 'Feedback' }
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
              Contact{' '}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                InsurAI
              </span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-4xl mx-auto ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Get in Touch with Our Expert Team
            </p>
            <p className={`text-lg mb-12 max-w-3xl mx-auto ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Whether you have questions about our platform, need technical support, or want to explore partnership opportunities, we're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className={`py-16 ${
        isDark ? 'bg-slate-800/30' : 'bg-white/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              How Can We Help?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.action}
                className={`group block text-center p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50'
                    : 'bg-white border border-gray-200 hover:shadow-xl shadow-lg'
                }`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {info.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {info.title}
                </h3>
                <p className={`text-lg mb-1 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {info.details}
                </p>
                <p className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {info.subtext}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Office Locations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className={`p-8 rounded-2xl ${
              isDark
                ? 'bg-slate-800/50 border border-slate-700'
                : 'bg-white border border-gray-200 shadow-xl'
            }`}>
              <h3 className={`text-3xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Send us a Message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Your Company"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      Inquiry Type
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105'
                  } text-white shadow-lg hover:shadow-xl`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Office Locations */}
            <div>
              <h3 className={`text-3xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Our Global Offices
              </h3>
              
              <div className="space-y-6">
                {officeLocations.map((office, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isDark
                        ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50'
                        : 'bg-white border border-gray-200 hover:shadow-lg shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{office.flag}</div>
                      <div className="flex-1">
                        <h4 className={`text-xl font-semibold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {office.city}, {office.country}
                        </h4>
                        <p className={`text-sm mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-600'
                        }`}>
                          {office.address}
                        </p>
                        <div className="space-y-1">
                          <p className={`text-sm ${
                            isDark ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            📞 {office.phone}
                          </p>
                          <p className={`text-sm ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            📧 {office.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Time */}
              <div className={`mt-8 p-6 rounded-xl ${
                isDark
                  ? 'bg-blue-900/20 border border-blue-700/30'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-2 ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  ⚡ Quick Response Guarantee
                </h4>
                <p className={`text-sm ${
                  isDark ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  We typically respond to all inquiries within 4 hours during business hours, 
                  and within 24 hours for messages received outside business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-16 ${
        isDark ? 'bg-slate-800/30' : 'bg-white/50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: 'How quickly can I get started with InsurAI?',
                answer: 'You can get started immediately! Sign up for a free account and begin uploading policies within minutes. Our AI will start processing your data right away.'
              },
              {
                question: 'Is my data secure with InsurAI?',
                answer: 'Absolutely. We use bank-grade encryption, comply with all major data protection regulations (GDPR, CCPA), and undergo regular security audits.'
              },
              {
                question: 'Do you offer integration with existing systems?',
                answer: 'Yes! We provide comprehensive APIs and support integration with most major insurance and CRM systems. Our technical team can assist with the setup.'
              },
              {
                question: 'What kind of support do you provide?',
                answer: 'We offer 24/7 customer support via chat, email, and phone. Plus, dedicated account managers for enterprise customers and comprehensive documentation.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                <h4 className={`text-lg font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {faq.question}
                </h4>
                <p className={`${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;