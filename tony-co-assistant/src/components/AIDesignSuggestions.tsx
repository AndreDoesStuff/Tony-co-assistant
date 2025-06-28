import React, { useState, useEffect, useCallback } from 'react';
import { 
  DesignSuggestion, 
  SuggestionContext, 
  ContextAnalysis, 
  SuggestionEngine,
  RecommendationHistory,
  SuggestionPerformance,
  SuggestionConfig
} from '../types/tony';
import { AIDesignSuggestionsService } from '../services/AIDesignSuggestionsService';
import { eventBus } from '../events/EventBus';

interface AIDesignSuggestionsProps {
  userId: string;
  className?: string;
}

interface SuggestionCardProps {
  suggestion: DesignSuggestion;
  onFeedback: (suggestionId: string, rating: number, comment?: string, implemented?: boolean) => void;
  onImplement: (suggestionId: string) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onFeedback, onImplement }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const getPriorityColor = (priority: DesignSuggestion['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: DesignSuggestion['type']) => {
    switch (type) {
      case 'pattern': return '🔧';
      case 'component': return '🧩';
      case 'layout': return '📐';
      case 'style': return '🎨';
      case 'interaction': return '👆';
      case 'asset': return '🖼️';
      case 'best_practice': return '⭐';
      default: return '💡';
    }
  };

  const handleFeedbackSubmit = () => {
    onFeedback(suggestion.id, rating, comment, false);
    setShowFeedback(false);
    setRating(0);
    setComment('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
            <p className="text-sm text-gray-600">{suggestion.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(suggestion.priority)}`}>
          {suggestion.priority}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Confidence: {(suggestion.confidence * 100).toFixed(0)}%</span>
          <span>Relevance: {(suggestion.relevance * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Reasoning:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {suggestion.reasoning.map((reason, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Feedback
          </button>
        </div>
        <button
          onClick={() => onImplement(suggestion.id)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Implement
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Implementation Guide:</h4>
          <div className="space-y-2">
            {suggestion.implementation.steps.map((step) => (
              <div key={step.order} className="flex items-start space-x-2">
                <span className="text-sm font-medium text-gray-600 min-w-[20px]">{step.order}.</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.tips.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">Tips:</p>
                      <ul className="text-xs text-gray-600">
                        {step.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Rate this suggestion:</h4>
          <div className="flex items-center space-x-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
            rows={2}
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleFeedbackSubmit}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={() => setShowFeedback(false)}
              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AIDesignSuggestions: React.FC<AIDesignSuggestionsProps> = ({ userId, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'analytics' | 'history' | 'settings'>('suggestions');
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<DesignSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DesignSuggestion['type'] | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<DesignSuggestion['priority'] | 'all'>('all');
  const [minConfidence, setMinConfidence] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<RecommendationHistory[]>([]);
  const [configuration, setConfiguration] = useState<SuggestionConfig | null>(null);

  const service = new AIDesignSuggestionsService();

  // Load suggestions
  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const context = {
        preferences: {},
        skillLevel: 'intermediate',
        projectType: 'web',
        platform: 'web',
        deviceType: 'desktop',
        currentDesign: {},
        designSystem: {},
        availableAssets: [],
        userInteractions: [],
        interactionPatterns: [],
        userBehavior: {},
        learnedPatterns: [],
        knowledgeBase: [],
        userProgress: {},
        strengths: [],
        weaknesses: []
      };

      const newSuggestions = await service.generateSuggestions(userId, context, 10);
      setSuggestions(newSuggestions);
      setFilteredSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, service]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await service.getSuggestionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [service]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await service.getSuggestionAnalytics('week');
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [service]);

  // Load history
  const loadHistory = useCallback(async () => {
    try {
      const historyData = await service.getRecommendationHistory(userId);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [userId, service]);

  // Filter suggestions
  useEffect(() => {
    let filtered = suggestions;

    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(s => s.type === selectedType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(s => s.priority === selectedPriority);
    }

    if (minConfidence > 0) {
      filtered = filtered.filter(s => s.confidence >= minConfidence);
    }

    setFilteredSuggestions(filtered);
  }, [suggestions, searchQuery, selectedType, selectedPriority, minConfidence]);

  // Load data on mount
  useEffect(() => {
    loadSuggestions();
    loadStats();
    loadAnalytics();
    loadHistory();
  }, [loadSuggestions, loadStats, loadAnalytics, loadHistory]);

  // Handle suggestion feedback
  const handleSuggestionFeedback = async (
    suggestionId: string,
    rating: number,
    comment?: string,
    implemented: boolean = false
  ) => {
    try {
      await service.addSuggestionFeedback(suggestionId, userId, rating, comment, implemented);
      
      // Update local state
      setSuggestions(prev => prev.map(s => {
        if (s.id === suggestionId) {
          return {
            ...s,
            feedback: [...s.feedback, {
              userId,
              rating,
              comment,
              implemented,
              effectiveness: rating / 5,
              timestamp: Date.now()
            }]
          };
        }
        return s;
      }));

      // Reload stats
      loadStats();
      loadAnalytics();
      loadHistory();

      // Emit event
      eventBus.publishSimple(
        'suggestion_feedback_added',
        'AIDesignSuggestions',
        { suggestionId, userId, rating, implemented },
        { component: 'AIDesignSuggestions' }
      );
    } catch (error) {
      console.error('Failed to add feedback:', error);
    }
  };

  // Handle suggestion implementation
  const handleSuggestionImplementation = async (suggestionId: string) => {
    try {
      await service.addSuggestionFeedback(suggestionId, userId, 5, 'Implemented', true, 1.0);
      
      // Update local state
      setSuggestions(prev => prev.map(s => {
        if (s.id === suggestionId) {
          return {
            ...s,
            feedback: [...s.feedback, {
              userId,
              rating: 5,
              comment: 'Implemented',
              implemented: true,
              effectiveness: 1.0,
              timestamp: Date.now()
            }]
          };
        }
        return s;
      }));

      // Reload data
      loadStats();
      loadAnalytics();
      loadHistory();

      // Emit event
      eventBus.publishSimple(
        'suggestion_implemented',
        'AIDesignSuggestions',
        { suggestionId, userId },
        { component: 'AIDesignSuggestions' }
      );
    } catch (error) {
      console.error('Failed to implement suggestion:', error);
    }
  };

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', icon: '💡' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Design Suggestions</h1>
          <p className="text-gray-600">Intelligent design recommendations powered by Tony's learning system</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'suggestions' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search suggestions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="pattern">Pattern</option>
                    <option value="component">Component</option>
                    <option value="layout">Layout</option>
                    <option value="style">Style</option>
                    <option value="interaction">Interaction</option>
                    <option value="asset">Asset</option>
                    <option value="best_practice">Best Practice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Confidence</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">{(minConfidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalSuggestions}</div>
                  <div className="text-sm text-gray-600">Total Suggestions</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-green-600">{(stats.acceptanceRate * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Acceptance Rate</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-purple-600">{(stats.implementationRate * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Implementation Rate</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-orange-600">{(stats.averageConfidence * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onFeedback={handleSuggestionFeedback}
                    onImplement={handleSuggestionImplementation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions found</h3>
                <p className="text-gray-600">Try adjusting your filters or generate new suggestions</p>
                <button
                  onClick={loadSuggestions}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Generate Suggestions
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.suggestionsGenerated}</div>
                  <div className="text-sm text-blue-600">Suggestions Generated</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.suggestionsAccepted}</div>
                  <div className="text-sm text-green-600">Suggestions Accepted</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{analytics.suggestionsRejected}</div>
                  <div className="text-sm text-red-600">Suggestions Rejected</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{(analytics.userSatisfaction * 100).toFixed(0)}%</div>
                  <div className="text-sm text-purple-600">User Satisfaction</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Loading analytics...</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendation History</h2>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Suggestion {entry.suggestionId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.action === 'implemented' ? 'bg-green-100 text-green-800' :
                        entry.action === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No history available</p>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-suggest</p>
                  <p className="text-sm text-gray-600">Automatically generate suggestions</p>
                </div>
                <input
                  type="checkbox"
                  checked={configuration?.autoSuggest || false}
                  onChange={(e) => {
                    // Handle configuration update
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Learning Enabled</p>
                  <p className="text-sm text-gray-600">Enable learning from feedback</p>
                </div>
                <input
                  type="checkbox"
                  checked={configuration?.enabled || false}
                  onChange={(e) => {
                    // Handle configuration update
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDesignSuggestions; 