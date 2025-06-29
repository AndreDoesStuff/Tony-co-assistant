import React, { useState } from 'react';
import { DesignSuggestion } from '../types/tony';

interface AIDesignSuggestionsPanelProps {
  suggestions: DesignSuggestion[];
  onApplySuggestion: (suggestion: DesignSuggestion) => void;
  onFeedback: (suggestionId: string, rating: number, comment?: string) => void;
  className?: string;
}

const AIDesignSuggestionsPanel: React.FC<AIDesignSuggestionsPanelProps> = ({
  suggestions,
  onApplySuggestion,
  onFeedback,
  className = ''
}) => {
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, number>>({});
  const [feedbackComments, setFeedbackComments] = useState<Record<string, string>>({});

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

  const getPriorityColor = (priority: DesignSuggestion['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleFeedbackSubmit = (suggestionId: string) => {
    const rating = feedbackRatings[suggestionId] || 0;
    const comment = feedbackComments[suggestionId] || '';
    
    if (rating > 0) {
      onFeedback(suggestionId, rating, comment);
      
      // Clear feedback form
      setFeedbackRatings(prev => ({ ...prev, [suggestionId]: 0 }));
      setFeedbackComments(prev => ({ ...prev, [suggestionId]: '' }));
    }
  };

  const handleApplySuggestion = (suggestion: DesignSuggestion) => {
    onApplySuggestion(suggestion);
    
    // Auto-expand to show implementation details
    setExpandedSuggestion(suggestion.id);
  };

  if (suggestions.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Yet</h3>
          <p className="text-sm text-gray-600">
            Start a conversation with the AI to generate design suggestions for your project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI Suggestions</h2>
          <span className="text-sm text-gray-500">{suggestions.length} suggestions</span>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="max-h-96 overflow-y-auto">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="border-b border-gray-100 last:border-b-0">
            <div className="p-4 hover:bg-gray-50 transition-colors">
              {/* Suggestion Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{suggestion.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority}
                </span>
              </div>

              {/* Confidence and Relevance */}
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Confidence:</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${suggestion.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{(suggestion.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Relevance:</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${suggestion.relevance * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{(suggestion.relevance * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mb-3">
                <button
                  onClick={() => handleApplySuggestion(suggestion)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Apply to Canvas
                </button>
                <button
                  onClick={() => setExpandedSuggestion(expandedSuggestion === suggestion.id ? null : suggestion.id)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  {expandedSuggestion === suggestion.id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedSuggestion === suggestion.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  {/* Reasoning */}
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-900 mb-2">Why this suggestion:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {suggestion.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Implementation Steps */}
                  {suggestion.implementation && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-900 mb-2">Implementation:</h4>
                      <div className="space-y-2">
                        {suggestion.implementation.steps.map((step) => (
                          <div key={step.order} className="flex items-start space-x-2">
                            <span className="text-xs font-medium text-gray-600 min-w-[16px]">{step.order}.</span>
                            <div>
                              <p className="text-xs font-medium text-gray-900">{step.title}</p>
                              <p className="text-xs text-gray-600">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback Section */}
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="text-xs font-medium text-gray-900 mb-2">Rate this suggestion:</h4>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRatings(prev => ({ ...prev, [suggestion.id]: star }))}
                          className={`text-lg ${star <= (feedbackRatings[suggestion.id] || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedbackComments[suggestion.id] || ''}
                      onChange={(e) => setFeedbackComments(prev => ({ ...prev, [suggestion.id]: e.target.value }))}
                      placeholder="Add a comment (optional)"
                      className="w-full p-2 text-xs border border-gray-300 rounded resize-none"
                      rows={2}
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleFeedbackSubmit(suggestion.id)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p>💡 Suggestions are generated based on your design context and AI analysis.</p>
          <p className="mt-1">Click "Apply to Canvas" to implement suggestions directly on your design.</p>
        </div>
      </div>
    </div>
  );
};

export default AIDesignSuggestionsPanel; 