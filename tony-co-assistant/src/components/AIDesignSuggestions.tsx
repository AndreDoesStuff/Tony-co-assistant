import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import {
  makeStyles,
  tokens,
  Text,
  Textarea,
  Button,
  Card,
  CardHeader,
  CardFooter,
  Spinner,
  Tooltip,
} from '@fluentui/react-components';
import { 
  SendRegular, 
  ChatRegular, 
  DismissRegular,
  LightbulbRegular,
  SparkleRegular
} from '@fluentui/react-icons';
import styled from 'styled-components';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    '@media (max-width: 900px)': {
      flexDirection: 'column',
    },
  },
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    transition: 'width 0.3s',
    '@media (max-width: 900px)': {
      maxWidth: '100%',
      padding: '12px',
    },
  },
  chatSidebar: {
    position: 'relative',
    width: '500px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: '16px',
    overflowY: 'auto',
    transition: 'width 0.3s, transform 0.3s',
    '@media (max-width: 1200px)': {
      width: '350px',
    },
    '@media (max-width: 900px)': {
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '80vw',
      maxWidth: '400px',
      zIndex: 100,
      boxShadow: 'rgba(0,0,0,0.3) -2px 0 8px',
      transform: 'translateX(100%)',
    },
  },
  chatSidebarOpen: {
    '@media (max-width: 900px)': {
      transform: 'translateX(0)',
    },
  },
  chatToggleBtn: {
    position: 'absolute',
    right: '16px',
    top: '16px',
    zIndex: 101,
    background: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: tokens.colorNeutralBackground3,
      transform: 'scale(1.05)',
    },
    '@media (max-width: 900px)': {
      position: 'fixed',
      right: '16px',
      top: '16px',
    },
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    marginBottom: '16px',
  },
  chatTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    flex: 1,
    padding: '8px 0',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke1,
      borderRadius: '4px',
    },
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    maxWidth: '85%',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  userMessage: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    alignSelf: 'flex-end',
    borderRadius: '12px',
    padding: '12px 16px',
    margin: '4px 0',
    position: 'relative',
    minWidth: '120px',
    border: `1px solid ${tokens.colorBrandStroke1}`,
  },
  aiMessage: {
    backgroundColor: tokens.colorNeutralBackground2,
    alignSelf: 'flex-start',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '16px 0',
    alignItems: 'flex-end',
    position: 'relative',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    marginTop: '16px',
  },
  inputFieldWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    background: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    boxSizing: 'border-box',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    minHeight: '60px',
    maxHeight: '200px',
    width: '100%',
    padding: '12px 48px 12px 12px',
    fontSize: '14px',
    lineHeight: '1.5',
    border: 'none',
    borderRadius: '8px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    background: 'transparent',
  },
  sendButton: {
    position: 'absolute',
    right: '8px',
    bottom: '8px',
    background: tokens.colorBrandBackground,
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: tokens.colorBrandForeground1,
    transition: 'all 0.2s',
    '&:hover': {
      background: tokens.colorBrandBackground2,
      transform: 'scale(1.05)',
    },
    '&:disabled': {
      background: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground3,
      cursor: 'not-allowed',
    },
  },
  suggestionCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: '12px',
    margin: '8px 0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
  },
  suggestionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  suggestionDescription: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.4',
  },
  loadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    color: tokens.colorNeutralForeground2,
    fontSize: '14px',
  },
  bgGray50: {
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  maxW7xl: {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '0 1rem',
    '@media (min-width: 640px)': {
      padding: '0 1.5rem',
    },
    '@media (min-width: 1024px)': {
      padding: '0 2rem',
    },
  },
  py8: {
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },
  mb8: {
    marginBottom: '2rem',
  },
  text3xl: {
    fontSize: '1.875rem',
    lineHeight: '2.25rem',
  },
  fontBold: {
    fontWeight: '700',
  },
  textGray900: {
    color: '#111827',
  },
  mb2: {
    marginBottom: '0.5rem',
  },
  textGray600: {
    color: '#4b5563',
  },
  borderB: {
    borderBottomWidth: '1px',
  },
  borderGray200: {
    // borderColor: '#e5e7eb', // Removed due to type issues
  },
  mb6: {
    marginBottom: '1.5rem',
  },
  mbPx: {
    marginBottom: '-1px',
  },
  flex: {
    display: 'flex',
  },
  spaceX8: {
    gap: '2rem',
  },
  py2: {
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
  },
  px1: {
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
  },
  borderB2: {
    borderBottomWidth: '2px',
  },
  fontMedium: {
    fontWeight: '500',
  },
  textSm: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  itemsCenter: {
    alignItems: 'center',
  },
  spaceX2: {
    gap: '0.5rem',
  },
  borderBlue500: {
    // borderColor: '#3b82f6', // Removed due to type issues
  },
  textBlue600: {
    color: '#2563eb',
  },
  borderTransparent: {
    // borderColor: 'transparent', // Removed due to type issues
  },
  textGray500: {
    color: '#6b7280',
  },
  hoverTextGray700: {
    '&:hover': {
      color: '#374151',
    },
  },
  hoverBorderGray300: {
    '&:hover': {
      // borderColor: '#d1d5db', // Removed due to type issues
    },
  },
  bgWhite: {
    backgroundColor: '#ffffff',
  },
  roundedLg: {
    borderRadius: '0.5rem',
  },
  shadowSm: {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  border: {
    // borderWidth: '1px', // Removed due to type issues
  },
  p6: {
    padding: '1.5rem',
  },
  grid: {
    display: 'grid',
  },
  gridCols1: {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
  mdGridCols4: {
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
  },
  gap4: {
    gap: '1rem',
  },
  block: {
    display: 'block',
  },
  textGray700: {
    color: '#374151',
  },
  wFull: {
    width: '100%',
  },
  px3: {
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
  },
  py2Input: {
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
  },
  borderGray300: {
    // borderColor: '#d1d5db', // Removed due to type issues
  },
  roundedMd: {
    borderRadius: '0.375rem',
  },
  focusOutlineNone: {
    '&:focus': {
      outline: 'none',
    },
  },
  focusRing2: {
    '&:focus': {
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    },
  },
  focusRingBlue500: {
    '&:focus': {
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    },
  },
  text2xl: {
    fontSize: '1.5rem',
    lineHeight: '2rem',
  },
  textGreen600: {
    color: '#059669',
  },
  textPurple600: {
    color: '#7c3aed',
  },
  textOrange600: {
    color: '#ea580c',
  },
  p4: {
    padding: '1rem',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  py12: {
    paddingTop: '3rem',
    paddingBottom: '3rem',
  },
  animateSpin: {
    animation: 'spin 1s linear infinite',
  },
  roundedFull: {
    borderRadius: '9999px',
  },
  h8: {
    height: '2rem',
  },
  w8: {
    width: '2rem',
  },
  lgGridCols2: {
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  gap6: {
    gap: '1.5rem',
  },
  textCenter: {
    textAlign: 'center',
  },
  text6xl: {
    fontSize: '3.75rem',
    lineHeight: '1',
  },
  textLg: {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
  },
  mt4: {
    marginTop: '1rem',
  },
  bgBlue600: {
    backgroundColor: '#2563eb',
  },
  textWhite: {
    color: '#ffffff',
  },
  rounded: {
    borderRadius: '0.25rem',
  },
  hoverBgBlue700: {
    '&:hover': {
      backgroundColor: '#1d4ed8',
    },
  },
  transitionColors: {
    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
  },
  textXl: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
  },
  fontSemibold: {
    fontWeight: '600',
  },
  spaceY4: {
    '& > * + *': {
      marginTop: '1rem',
    },
  },
  flexItemsCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  px2: {
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
  },
  py1: {
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
  },
  textXs: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  bgGreen100: {
    backgroundColor: '#dcfce7',
  },
  textGreen800: {
    color: '#166534',
  },
  bgBlue100: {
    backgroundColor: '#dbeafe',
  },
  textBlue800: {
    color: '#1e40af',
  },
  bgRed100: {
    backgroundColor: '#fee2e2',
  },
  textRed800: {
    color: '#991b1b',
  },
  h4: {
    height: '1rem',
  },
  w4: {
    width: '1rem',
  },
  borderBlue600: {
    // borderColor: '#2563eb', // Removed due to type issues
  },
  mb4: {
    marginBottom: '1rem',
  },
  px4: {
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
});

interface AIDesignSuggestionsProps {
  userId: string;
  className?: string;
}

interface SuggestionCardProps {
  suggestion: DesignSuggestion;
  onFeedback: (suggestionId: string, rating: number, comment?: string, implemented?: boolean) => void;
  onImplement: (suggestionId: string) => void;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: DesignSuggestion[];
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
  const styles = useStyles();
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

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const service = new AIDesignSuggestionsService();

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle chat message send
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Generate design suggestions based on user input
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

      const newSuggestions = await service.generateSuggestions(userId, context, 5);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I've analyzed your request and generated ${newSuggestions.length} design suggestions. Here are the most relevant ones:`,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: newSuggestions,
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(prev => [...prev, ...newSuggestions]);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while generating suggestions. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle chat input key press
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
    <div className={styles.root}>
      {/* Main Content */}
      <div className={styles.mainContainer}>
        {/* Header */}
        <div className={styles.mb8}>
          <h1 className={`${styles.text3xl} ${styles.fontBold} ${styles.textGray900} ${styles.mb2}`}>
            AI Design Suggestions
          </h1>
          <p className={styles.textGray600}>
            Intelligent design recommendations powered by Tony's learning system
          </p>
        </div>

        {/* Tabs */}
        <div className={`${styles.borderB} border-gray-200 ${styles.mb6}`}>
          <nav className={`${styles.flex} ${styles.spaceX8} ${styles.mbPx}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${styles.py2} ${styles.px1} ${styles.borderB2} ${styles.fontMedium} ${styles.textSm} ${styles.flex} ${styles.itemsCenter} ${styles.spaceX2} ${
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
            <div className={`${styles.bgWhite} ${styles.roundedLg} ${styles.shadowSm} border border-gray-200 ${styles.p6} ${styles.mb6}`}>
              <div className={`${styles.grid} ${styles.gridCols1} ${styles.mdGridCols4} ${styles.gap4}`}>
                <div>
                  <label className={`${styles.block} ${styles.textSm} ${styles.fontMedium} ${styles.textGray700} ${styles.mb2}`}>Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search suggestions..."
                    className={`${styles.wFull} ${styles.px3} ${styles.py2Input} border border-gray-300 ${styles.roundedMd} ${styles.focusOutlineNone} ${styles.focusRing2} ${styles.focusRingBlue500}`}
                  />
                </div>
                <div>
                  <label className={`${styles.block} ${styles.textSm} ${styles.fontMedium} ${styles.textGray700} ${styles.mb2}`}>Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className={`${styles.wFull} ${styles.px3} ${styles.py2Input} border border-gray-300 ${styles.roundedMd} ${styles.focusOutlineNone} ${styles.focusRing2} ${styles.focusRingBlue500}`}
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
                  <label className={`${styles.block} ${styles.textSm} ${styles.fontMedium} ${styles.textGray700} ${styles.mb2}`}>Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    className={`${styles.wFull} ${styles.px3} ${styles.py2Input} border border-gray-300 ${styles.roundedMd} ${styles.focusOutlineNone} ${styles.focusRing2} ${styles.focusRingBlue500}`}
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className={`${styles.block} ${styles.textSm} ${styles.fontMedium} ${styles.textGray700} ${styles.mb2}`}>Min Confidence</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                    className={styles.wFull}
                  />
                  <span className={`${styles.textSm} ${styles.textGray600}`}>{(minConfidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className={`${styles.grid} ${styles.gridCols1} ${styles.mdGridCols4} ${styles.gap4} ${styles.mb6}`}>
                <div className={`${styles.bgWhite} ${styles.roundedLg} ${styles.shadowSm} border border-gray-200 ${styles.p4}`}>
                  <div className={`${styles.text2xl} ${styles.fontBold} ${styles.textBlue600}`}>{stats.totalSuggestions}</div>
                  <div className={`${styles.textSm} ${styles.textGray600}`}>Total Suggestions</div>
                </div>
                <div className={`${styles.bgWhite} ${styles.roundedLg} ${styles.shadowSm} border border-gray-200 ${styles.p4}`}>
                  <div className={`${styles.text2xl} ${styles.fontBold} ${styles.textGreen600}`}>{(stats.acceptanceRate * 100).toFixed(1)}%</div>
                  <div className={`${styles.textSm} ${styles.textGray600}`}>Acceptance Rate</div>
                </div>
                <div className={`${styles.bgWhite} ${styles.roundedLg} ${styles.shadowSm} border border-gray-200 ${styles.p4}`}>
                  <div className={`${styles.text2xl} ${styles.fontBold} ${styles.textPurple600}`}>{(stats.implementationRate * 100).toFixed(1)}%</div>
                  <div className={`${styles.textSm} ${styles.textGray600}`}>Implementation Rate</div>
                </div>
                <div className={`${styles.bgWhite} ${styles.roundedLg} ${styles.shadowSm} border border-gray-200 ${styles.p4}`}>
                  <div className={`${styles.text2xl} ${styles.fontBold} ${styles.textOrange600}`}>{(stats.averageConfidence * 100).toFixed(0)}%</div>
                  <div className={`${styles.textSm} ${styles.textGray600}`}>Avg Confidence</div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {loading ? (
              <div className={`${styles.flex} ${styles.justifyCenter} ${styles.itemsCenter} ${styles.py12}`}>
                <div className={`${styles.animateSpin} ${styles.roundedFull} ${styles.h8} ${styles.w8} border-b-2 border-blue-600`}></div>
              </div>
            ) : filteredSuggestions.length > 0 ? (
              <div className={`${styles.grid} ${styles.gridCols1} ${styles.lgGridCols2} ${styles.gap6}`}>
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
              <div className={styles.textCenter}>
                <div className={`${styles.text6xl} ${styles.mb4}`}>🤖</div>
                <h3 className={`${styles.textLg} ${styles.fontMedium} ${styles.textGray900} ${styles.mb2}`}>No suggestions found</h3>
                <p className={styles.textGray600}>Try adjusting your filters or generate new suggestions</p>
                <button
                  onClick={loadSuggestions}
                  className={`${styles.mt4} ${styles.px4} ${styles.py2} ${styles.bgBlue600} ${styles.textWhite} ${styles.rounded} ${styles.hoverBgBlue700} ${styles.transitionColors}`}
                >
                  Generate Suggestions
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={`${styles.bgWhite} ${styles.roundedLg} ${styles.shadowSm} border border-gray-200 ${styles.p6}`}>
            <h2 className={`${styles.textXl} ${styles.fontSemibold} ${styles.textGray900} ${styles.mb4}`}>Analytics Dashboard</h2>
            {analytics ? (
              <div className={`${styles.grid} ${styles.gridCols1} ${styles.mdGridCols4} ${styles.gap4}`}>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className={`${styles.text2xl} ${styles.fontBold} ${styles.textBlue600}`}>{analytics.suggestionsGenerated}</div>
                  <div className={`${styles.textSm} ${styles.textBlue600}`}>Suggestions Generated</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className={`${styles.text2xl} ${styles.fontBold} ${styles.textGreen600}`}>{analytics.suggestionsAccepted}</div>
                  <div className={`${styles.textSm} ${styles.textGreen600}`}>Suggestions Accepted</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className={`${styles.text2xl} ${styles.fontBold} ${styles.textRed800}`}>{analytics.suggestionsRejected}</div>
                  <div className={`${styles.textSm} ${styles.textRed800}`}>Suggestions Rejected</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className={`${styles.text2xl} ${styles.fontBold} ${styles.textPurple600}`}>{(analytics.userSatisfaction * 100).toFixed(0)}%</div>
                  <div className={`${styles.textSm} ${styles.textPurple600}`}>User Satisfaction</div>
                </div>
              </div>
            ) : (
              <p className={styles.textGray600}>Loading analytics...</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className={`${styles.bgWhite} ${styles.roundedLg} ${styles.shadowSm} border border-gray-200 ${styles.p6}`}>
            <h2 className={`${styles.textXl} ${styles.fontSemibold} ${styles.textGray900} ${styles.mb4}`}>Recommendation History</h2>
            {history.length > 0 ? (
              <div className={styles.spaceY4}>
                {history.map((entry) => (
                  <div key={entry.id} className={`border border-gray-200 ${styles.roundedLg} ${styles.p4}`}>
                    <div className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween}`}>
                      <div>
                        <p className={`${styles.fontMedium} ${styles.textGray900}`}>Suggestion {entry.suggestionId}</p>
                        <p className={`${styles.textSm} ${styles.textGray600}`}>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`${styles.px2} ${styles.py1} ${styles.textXs} ${styles.fontMedium} ${styles.roundedFull} ${
                        entry.action === 'implemented' ? `${styles.bgGreen100} ${styles.textGreen800}` :
                        entry.action === 'accepted' ? `${styles.bgBlue100} ${styles.textBlue800}` :
                        `${styles.bgRed100} ${styles.textRed800}`
                      }`}>
                        {entry.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.textGray600}>No history available</p>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`${styles.bgWhite} ${styles.roundedLg} ${styles.shadowSm} border border-gray-200 ${styles.p6}`}>
            <h2 className={`${styles.textXl} ${styles.fontSemibold} ${styles.textGray900} ${styles.mb4}`}>Settings</h2>
            <div className={styles.spaceY4}>
              <div className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween}`}>
                <div>
                  <p className={`${styles.fontMedium} ${styles.textGray900}`}>Auto-suggest</p>
                  <p className={`${styles.textSm} ${styles.textGray600}`}>Automatically generate suggestions</p>
                </div>
                <input
                  type="checkbox"
                  checked={configuration?.autoSuggest || false}
                  onChange={(e) => {
                    // Handle configuration update
                  }}
                  className={`${styles.h4} ${styles.w4} text-blue-600 focus:ring-blue-500 border-gray-300 rounded`}
                />
              </div>
              <div className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween}`}>
                <div>
                  <p className={`${styles.fontMedium} ${styles.textGray900}`}>Learning Enabled</p>
                  <p className={`${styles.textSm} ${styles.textGray600}`}>Enable learning from feedback</p>
                </div>
                <input
                  type="checkbox"
                  checked={configuration?.enabled || false}
                  onChange={(e) => {
                    // Handle configuration update
                  }}
                  className={`${styles.h4} ${styles.w4} text-blue-600 focus:ring-blue-500 border-gray-300 rounded`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <div className={`${styles.chatSidebar} ${chatOpen ? styles.chatSidebarOpen : ''}`}>
        <div className={styles.chatHeader}>
          <div className={styles.chatTitle}>
            <LightbulbRegular />
            <span>Design Chat</span>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className={styles.chatToggleBtn}
          >
            <DismissRegular />
          </button>
        </div>

        <div className={styles.messageList}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.aiMessage}`}
            >
              <Text>{message.content}</Text>
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3">
                  <Text className={styles.suggestionTitle}>Generated Suggestions:</Text>
                  {message.suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={styles.suggestionCard}
                      onClick={() => {
                        // Add suggestion to main list
                        setSuggestions(prev => [...prev, suggestion]);
                        setActiveTab('suggestions');
                      }}
                    >
                      <div className={styles.suggestionTitle}>{suggestion.title}</div>
                      <div className={styles.suggestionDescription}>{suggestion.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className={styles.loadingIndicator}>
              <Spinner size="tiny" />
              <span>Tony is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputFieldWrapper}>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
              placeholder="Ask for design suggestions..."
              className={styles.textarea}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isTyping}
              className={styles.sendButton}
            >
              <SendRegular />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={styles.chatToggleBtn}
        style={{ display: chatOpen ? 'none' : 'flex' }}
      >
        <ChatRegular />
      </button>
    </div>
  );
};

export default AIDesignSuggestions; 