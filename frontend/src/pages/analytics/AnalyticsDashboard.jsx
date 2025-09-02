
import React, { useState, useEffect, useCallback } from 'react';
import { aiHealthService } from '../../api/aiService';
import Spinner from '../../components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [claimsAnalytics, setClaimsAnalytics] = useState(null);
  const [chatAnalytics, setChatAnalytics] = useState(null);
  const [aiServiceStatus, setAiServiceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const loadClaimsAnalytics = useCallback(async () => {
    // Mock implementation - in production, this would call actual API
    return {
      total_claims_processed: 2847,
      fraud_detection_rate: 8.3,
      average_processing_time: "3.2 days",
      auto_approval_rate: 67.5,
      manual_review_rate: 24.2,
      rejection_rate: 8.3,
      claim_types_distribution: {
        auto: 42.1,
        health: 28.7,
        home: 19.3,
        life: 9.9
      },
      fraud_indicators_frequency: {
        inconsistent_information: 34.2,
        suspicious_timing: 28.1,
        unusual_claim_amount: 22.7,
        prior_claims_history: 15.0
      },
      settlement_accuracy: 94.2,
      monthly_trends: [
        { month: 'Jan', claims: 234, fraud: 19 },
        { month: 'Feb', claims: 267, fraud: 22 },
        { month: 'Mar', claims: 298, fraud: 25 },
        { month: 'Apr', claims: 312, fraud: 24 },
        { month: 'May', claims: 289, fraud: 21 },
        { month: 'Jun', claims: 342, fraud: 28 }
      ]
    };
  }, []);

  const loadChatAnalytics = useCallback(async () => {
    // Mock implementation - in production, this would call actual API
    return {
      overview: {
        total_conversations: 1245,
        total_messages: 5678,
        average_messages_per_conversation: 4.56,
        active_conversations_today: 67
      },
      intent_distribution: {
        claim_inquiry: 145,
        policy_question: 123,
        billing_inquiry: 98,
        complaint: 45,
        general_info: 234
      },
      sentiment_distribution: {
        positive: 456,
        neutral: 678,
        negative: 111
      },
      performance_metrics: {
        average_response_confidence: 0.847,
        human_escalation_rate: 0.15,
        conversation_resolution_rate: 87.3
      },
      user_satisfaction: {
        estimated_satisfaction: 4.2,
        positive_sentiment_ratio: 0.68,
        quick_resolution_rate: 0.73
      }
    };
  }, []);

  const loadAllAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [aiStatus, claims, chat] = await Promise.allSettled([
        aiHealthService.getStatus(),
        loadClaimsAnalytics(),
        loadChatAnalytics()
      ]);

      if (aiStatus.status === 'fulfilled') {
        setAiServiceStatus(aiStatus.value);
      }

      if (claims.status === 'fulfilled') {
        setClaimsAnalytics(claims.value);
      }

      if (chat.status === 'fulfilled') {
        setChatAnalytics(chat.value);
      }

      // Generate combined analytics
      setAnalyticsData({
        timeframe: selectedTimeframe,
        lastUpdated: new Date().toISOString(),
        summary: {
          totalClaims: claims.value?.total_claims_processed || 0,
          fraudDetectionRate: claims.value?.fraud_detection_rate || 0,
          avgProcessingTime: claims.value?.average_processing_time || 'N/A',
          customerSatisfaction: chat.value?.user_satisfaction?.estimated_satisfaction || 0
        }
      });

    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe, loadClaimsAnalytics, loadChatAnalytics]);

  useEffect(() => {
    loadAllAnalytics();
  }, [selectedTimeframe, loadAllAnalytics]);

  const renderMetricCard = (title, value, subtitle, trend, icon = "📊") => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{icon}</span>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  );

  const transformToChartData = (data) => {
    return Object.entries(data).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: typeof value === 'number' ? value : parseFloat(value) || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Spinner />
        <p className="mt-4 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadAllAnalytics} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">AI Analytics Dashboard</h1>
        <div className="flex space-x-4">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button 
            onClick={loadAllAnalytics} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* AI Service Status */}
      {aiServiceStatus && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AI Service Status</h2>
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${aiServiceStatus.ai_service_healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <span>{aiServiceStatus.ai_service_healthy ? '✅' : '❌'}</span>
              <span className="font-medium">
                {aiServiceStatus.ai_service_healthy ? 'All Services Operational' : 'Service Issues Detected'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Last checked: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Overview */}
      {analyticsData && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Key Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderMetricCard("Total Claims", analyticsData.summary.totalClaims.toLocaleString(), "Claims processed", 12, "📋")}
            {renderMetricCard("Fraud Detection", `${claimsAnalytics?.fraud_detection_rate || 0}%`, "Detection rate", -2, "🛡️")}
            {renderMetricCard("Avg Processing", analyticsData.summary.avgProcessingTime, "Time per claim", -15, "⏱️")}
            {renderMetricCard("Satisfaction", `${analyticsData.summary.customerSatisfaction}/5`, "AI interactions", 8, "😊")}
          </div>
        </div>
      )}

      {/* Claims Analytics */}
      {claimsAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Claim Types Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Claim Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transformToChartData(claimsAnalytics.claim_types_distribution)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {transformToChartData(claimsAnalytics.claim_types_distribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Claims Processing Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={claimsAnalytics.monthly_trends}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="claims" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Processing Efficiency */}
      {claimsAnalytics && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Processing Efficiency</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderMetricCard("Auto Approval", `${claimsAnalytics.auto_approval_rate}%`, "Automated decisions", null, "✅")}
            {renderMetricCard("Manual Review", `${claimsAnalytics.manual_review_rate}%`, "Human review required", null, "👥")}
            {renderMetricCard("Rejection Rate", `${claimsAnalytics.rejection_rate}%`, "Claims rejected", null, "❌")}
            {renderMetricCard("Accuracy", `${claimsAnalytics.settlement_accuracy}%`, "Prediction accuracy", null, "🎯")}
          </div>
        </div>
      )}

      {/* Chat Analytics */}
      {chatAnalytics && (
        <div>
          <h2 className="text-xl font-semibold mb-4">AI Chatbot Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversation Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Conversation Overview</h3>
              <div className="space-y-4">
                {renderMetricCard("Total Conversations", chatAnalytics.overview.total_conversations.toLocaleString(), "All time", null, "💬")}
                {renderMetricCard("Active Today", chatAnalytics.overview.active_conversations_today, "Current sessions", null, "🟢")}
                {renderMetricCard("Avg Messages", chatAnalytics.overview.average_messages_per_conversation.toFixed(1), "Per conversation", null, "📝")}
              </div>
            </div>

            {/* Intent Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Query Intent Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transformToChartData(chatAnalytics.intent_distribution)}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {renderMetricCard("Response Confidence", `${(chatAnalytics.performance_metrics.average_response_confidence * 100).toFixed(1)}%`, "AI confidence", null, "🎯")}
              {renderMetricCard("Escalation Rate", `${(chatAnalytics.performance_metrics.human_escalation_rate * 100).toFixed(1)}%`, "To human agents", null, "📞")}
              {renderMetricCard("Resolution Rate", `${chatAnalytics.performance_metrics.conversation_resolution_rate}%`, "Successful resolutions", null, "✅")}
              {renderMetricCard("Satisfaction", `${chatAnalytics.user_satisfaction.estimated_satisfaction}/5`, "User rating", null, "⭐")}
            </div>
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">🎯 Key Insights</h4>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Fraud detection rate improved by 15% this month</li>
            <li>• Customer satisfaction with AI chat is at 4.2/5</li>
            <li>• Auto-approval rate increased to 67.5%</li>
            <li>• Average processing time reduced to 3.2 days</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-green-900 mb-3">📈 Recommendations</h4>
          <ul className="text-green-800 space-y-2 text-sm">
            <li>• Focus on improving manual review efficiency</li>
            <li>• Enhance AI training for complex claim types</li>
            <li>• Implement proactive customer communication</li>
            <li>• Expand chatbot capabilities for billing inquiries</li>
          </ul>
        </div>
        
        <div className="bg-amber-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-amber-900 mb-3">⚠️ Areas of Concern</h4>
          <ul className="text-amber-800 space-y-2 text-sm">
            <li>• Slight increase in complaint escalations</li>
            <li>• Home insurance claims processing slower</li>
            <li>• Need better document verification tools</li>
            <li>• Manual review backlog building up</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4 border-t">
        <p>Last updated: {analyticsData?.lastUpdated ? new Date(analyticsData.lastUpdated).toLocaleString() : 'Unknown'}</p>
        <p>Data refreshes automatically every 5 minutes</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;