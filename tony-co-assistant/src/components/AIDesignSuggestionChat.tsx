import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  makeStyles,
  tokens,
  Text,
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  Spinner,
  Badge,
  Divider,
  Tooltip,
  Dropdown,
  Option,
  Tab,
  TabList,
  TabValue,
  SelectTabData,
  SelectTabEvent,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  SendRegular,
  LightbulbRegular,
  SparkleRegular,
  BrainRegular,
  LibraryRegular,
  SettingsRegular,
  HistoryRegular,
  BookmarkRegular,
  ShareRegular,
  CopyRegular,
  EditRegular,
  DeleteRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  PersonRegular,
  BotRegular,
  ChatRegular,
} from '@fluentui/react-icons';
import styled from 'styled-components';
import { 
  DesignSuggestion, 
  SuggestionContext, 
  Asset,
  UXPattern,
  UXInsight,
  UserInteraction,
  AIDesignSuggestions
} from '../types/tony';
import { AIDesignSuggestionsService } from '../services/AIDesignSuggestionsService';
import { eventBus } from '../events/EventBus';
import { tonyStore } from '../store/TonyStore';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#181a20',
    color: '#ffffff',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#23263a',
    borderBottom: '1px solid #333',
    minHeight: '64px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: 600,
    fontSize: '20px',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  tabsContainer: {
    borderBottom: '1px solid #333',
    backgroundColor: '#23263a',
  },
  tabContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  message: {
    display: 'flex',
    gap: '12px',
    maxWidth: '100%',
  },
  messageUser: {
    flexDirection: 'row-reverse',
  },
  messageAssistant: {
    flexDirection: 'row',
  },
  messageAvatar: {
    flexShrink: 0,
  },
  messageContent: {
    flex: 1,
    maxWidth: 'calc(100% - 48px)',
  },
  messageBubble: {
    padding: '12px 16px',
    borderRadius: '12px',
    wordWrap: 'break-word',
    maxWidth: '100%',
  },
  messageBubbleUser: {
    backgroundColor: '#0078d4',
    color: '#ffffff',
    borderBottomRightRadius: '4px',
  },
  messageBubbleAssistant: {
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    borderBottomLeftRadius: '4px',
  },
  messageTime: {
    fontSize: '11px',
    color: '#999',
    marginTop: '4px',
    textAlign: 'right',
  },
  messageTimeUser: {
    textAlign: 'right',
  },
  messageTimeAssistant: {
    textAlign: 'left',
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid #333',
    backgroundColor: '#23263a',
  },
  inputWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    border: '1px solid #555',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    '&:focus': {
      outline: 'none',
    },
  },
  sendButton: {
    flexShrink: 0,
    minWidth: '40px',
    height: '40px',
    borderRadius: '8px',
  },
  suggestionCard: {
    marginTop: '8px',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  suggestionHeader: {
    padding: '12px 16px',
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #333',
  },
  suggestionTitle: {
    fontWeight: '600',
    marginBottom: '4px',
  },
  suggestionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#999',
  },
  suggestionContent: {
    padding: '16px',
  },
  suggestionDescription: {
    marginBottom: '12px',
    lineHeight: '1.5',
  },
  suggestionActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  reasoningList: {
    marginTop: '8px',
    paddingLeft: '16px',
  },
  reasoningItem: {
    marginBottom: '4px',
    fontSize: '13px',
    color: '#ccc',
  },
  contextInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#999',
    marginTop: '8px',
  },
  loadingMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#2d2d2d',
    borderRadius: '12px',
    borderBottomLeftRadius: '4px',
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  typingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#999',
    animation: 'typing 1.4s infinite ease-in-out',
    '&:nth-child(1)': { animationDelay: '-0.32s' },
    '&:nth-child(2)': { animationDelay: '-0.16s' },
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '32px',
    textAlign: 'center',
    color: '#999',
  },
  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: '0.5',
  },
  quickPrompts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
  },
  quickPrompt: {
    padding: '8px 12px',
    backgroundColor: '#2d2d2d',
    border: '1px solid #333',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#3d3d3d',
    },
  },
  historyItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #333',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#2d2d2d',
    },
  },
  historyQuery: {
    fontWeight: '500',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  historyTime: {
    fontSize: '11px',
    color: '#999',
  },
  settingsSection: {
    padding: '16px',
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #333',
  },
  settingLabel: {
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: '12px',
    color: '#999',
    marginTop: '2px',
  },
  input: {
    flex: 1,
    border: '1px solid #555',
    borderRadius: '4px',
    padding: '8px 12px',
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    fontSize: '14px',
    '&:focus': {
      outline: 'none',
    },
  },
  tabButton: {
    flex: 1,
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#3d3d3d',
    },
    '&.active': {
      backgroundColor: '#0078d4',
      color: '#ffffff',
    },
  },
  reasoningLabel: {
    fontWeight: 600,
    fontSize: '12px',
    marginBottom: '4px',
  },
  quickPromptsLabel: {
    fontWeight: 600,
    fontSize: '12px',
    marginBottom: '8px',
  },
  historyTitle: {
    fontWeight: 600,
    fontSize: '16px',
    marginBottom: '16px',
  },
  settingsTitle: {
    fontWeight: 600,
    fontSize: '16px',
    marginBottom: '16px',
  },
  emptyStateText: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px',
  },
});

const StyledCard = styled(Card)`
  box-shadow: none;
  border: 1px solid #333;
`;

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: DesignSuggestion[];
  context?: any;
}

interface AIDesignSuggestionChatProps {
  className?: string;
}

const AIDesignSuggestionChat: React.FC<AIDesignSuggestionChatProps> = ({ className = '' }) => {
  const styles = useStyles();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabValue>('chat');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState({
    autoSuggest: true,
    maxSuggestions: 3,
    confidenceThreshold: 0.7,
    includeAssets: true,
    includePatterns: true,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const service = new AIDesignSuggestionsService();
  const { dispatchToast } = useToastController();
  const toastId = useId('toast');

  const quickPrompts = [
    "Suggest a modern login form design",
    "What color scheme would work best for a fintech app?",
    "Recommend UI patterns for mobile navigation",
    "How can I improve the accessibility of my form?",
    "Suggest components for a dashboard layout",
    "What's the best way to display user feedback?",
  ];

  useEffect(() => {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('ai-design-chat-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }

    // Load settings
    const savedSettings = localStorage.getItem('ai-design-chat-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    // Subscribe to events
    const subscription = eventBus.subscribe('asset-library-updated', handleAssetLibraryUpdate);
    return () => {
      eventBus.unsubscribe(subscription.id);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Save chat history to localStorage
    localStorage.setItem('ai-design-chat-history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('ai-design-chat-settings', JSON.stringify(settings));
  }, [settings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAssetLibraryUpdate = (event: any) => {
    // Update context when asset library changes
    console.log('Asset library updated, refreshing context...');
  };

  const handleTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get context from Tony's systems
      const context = await buildContext();
      
      // Generate suggestions
      const suggestions = await service.generateSuggestions(
        'current-user',
        {
          query: userMessage.content,
          context,
          settings,
        },
        settings.maxSuggestions
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateResponse(userMessage.content, suggestions),
        timestamp: Date.now(),
        suggestions,
        context,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setChatHistory(prev => [userMessage, assistantMessage, ...prev.slice(0, 98)]); // Keep last 100 messages
      
      dispatchToast(
        <Toast>
          <ToastTitle>Design suggestions generated</ToastTitle>
          <ToastBody>Found {suggestions.length} relevant suggestions for your query.</ToastBody>
        </Toast>,
        { intent: 'success' }
      );

    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error while generating design suggestions. Please try again or check your connection.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      dispatchToast(
        <Toast>
          <ToastTitle>Error</ToastTitle>
          <ToastBody>Failed to generate design suggestions. Please try again.</ToastBody>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const buildContext = async () => {
    const state = tonyStore.getState();
    
    return {
      uxRepository: {
        patterns: state.ux?.patterns || [],
        insights: state.ux?.insights || [],
        interactions: state.ux?.interactions || [],
      },
      designAssets: {
        assets: state.assets?.assets || [],
        categories: state.assets?.categories || [],
        tags: state.assets?.tags || [],
      },
      designSystem: {
        patterns: state.design?.patterns || [],
        components: state.design?.components || [],
        styles: state.design?.styles || {},
      },
      learningSystem: {
        patterns: state.learning?.patterns || [],
        knowledgeBase: state.learning?.knowledgeBase || [],
      },
      userPreferences: {
        skillLevel: 'intermediate',
        projectType: 'web',
        preferences: {},
      },
    };
  };

  const generateResponse = (query: string, suggestions: DesignSuggestion[]): string => {
    if (suggestions.length === 0) {
      return "I couldn't find any specific design suggestions for your query. Could you provide more details about what you're looking for?";
    }

    const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= settings.confidenceThreshold);
    
    if (highConfidenceSuggestions.length === 0) {
      return "I found some suggestions, but they have lower confidence levels. You might want to refine your query or check the suggestions below for inspiration.";
    }

    return `I found ${suggestions.length} design suggestions for you. Here are the most relevant ones based on your query and the available design assets:`;
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const handleSuggestionFeedback = async (suggestionId: string, rating: number, comment?: string) => {
    try {
      await service.addSuggestionFeedback(suggestionId, 'current-user', rating, comment);
      
      dispatchToast(
        <Toast>
          <ToastTitle>Feedback submitted</ToastTitle>
          <ToastBody>Thank you for your feedback! It helps improve future suggestions.</ToastBody>
        </Toast>,
        { intent: 'success' }
      );
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleSuggestionImplementation = async (suggestionId: string) => {
    try {
      // Emit event for suggestion implementation
      eventBus.publishSimple('suggestion-implemented', 'ai-design-chat', {
        suggestionId,
        timestamp: Date.now(),
      });
      
      dispatchToast(
        <Toast>
          <ToastTitle>Suggestion implemented</ToastTitle>
          <ToastBody>The suggestion has been marked as implemented.</ToastBody>
        </Toast>,
        { intent: 'success' }
      );
    } catch (error) {
      console.error('Failed to mark suggestion as implemented:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: ChatMessage) => (
    <div key={message.id} className={`${styles.message} ${message.type === 'user' ? styles.messageUser : styles.messageAssistant}`}>
      <div className={styles.messageAvatar}>
        <Avatar
          size={32}
          icon={message.type === 'user' ? <PersonRegular /> : <BotRegular />}
          color={message.type === 'user' ? 'brand' : 'neutral'}
        />
      </div>
      <div className={styles.messageContent}>
        <div className={`${styles.messageBubble} ${message.type === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}>
          <Text>{message.content}</Text>
        </div>
        <div className={`${styles.messageTime} ${message.type === 'user' ? styles.messageTimeUser : styles.messageTimeAssistant}`}>
          {formatTime(message.timestamp)}
        </div>
        
        {message.suggestions && message.suggestions.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            {message.suggestions.map((suggestion) => (
              <StyledCard key={suggestion.id}>
                <div className={styles.suggestionHeader}>
                  <div className={styles.suggestionTitle}>
                    {suggestion.title}
                  </div>
                  <div className={styles.suggestionMeta}>
                    <Badge appearance="filled" color={suggestion.priority === 'critical' ? 'danger' : suggestion.priority === 'high' ? 'warning' : 'informative'}>
                      {suggestion.priority}
                    </Badge>
                    <span>Confidence: {(suggestion.confidence * 100).toFixed(0)}%</span>
                    <span>Relevance: {(suggestion.relevance * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionDescription}>
                    {suggestion.description}
                  </div>
                  
                  {suggestion.reasoning.length > 0 && (
                    <div>
                      <div className={styles.reasoningLabel}>Reasoning:</div>
                      <ul className={styles.reasoningList}>
                        {suggestion.reasoning.map((reason, index) => (
                          <li key={index} className={styles.reasoningItem}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className={styles.suggestionActions}>
                    <Button size="small" appearance="primary" onClick={() => handleSuggestionImplementation(suggestion.id)}>
                      Implement
                    </Button>
                    <Button size="small" appearance="subtle" onClick={() => handleSuggestionFeedback(suggestion.id, 5)}>
                      Rate
                    </Button>
                    <Tooltip content="Copy suggestion details" relationship="label">
                      <Button size="small" appearance="subtle" icon={<CopyRegular />} />
                    </Tooltip>
                  </div>
                </div>
              </StyledCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatTab = () => (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <LightbulbRegular />
            </div>
            <div className={styles.headerTitle}>AI Design Suggestions</div>
            <Text>Ask Tony for design suggestions based on UX patterns and available assets.</Text>
            
            <div className={styles.quickPrompts}>
              <div className={styles.quickPromptsLabel}>Quick prompts:</div>
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className={styles.quickPrompt}
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        
        {isLoading && (
          <div className={styles.loadingMessage}>
            <Avatar size={32} icon={<BotRegular />} color="neutral" />
            <div className={styles.typingIndicator}>
              <Text>Tony is thinking</Text>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask for design suggestions..."
            className={styles.textarea}
            rows={1}
          />
          <Button
            appearance="primary"
            icon={<SendRegular />}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={styles.sendButton}
          />
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className={styles.tabContent}>
      <div style={{ padding: '16px' }}>
        <div className={styles.historyTitle}>Chat History</div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {chatHistory.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <ChatRegular />
            </div>
            <Text>No chat history yet</Text>
            <div className={styles.emptyStateText}>Your conversations will appear here</div>
          </div>
        ) : (
          chatHistory.map((message) => (
            <div key={message.id} className={styles.historyItem}>
              <div className={styles.historyQuery}>
                {message.type === 'user' ? message.content : `Response with ${message.suggestions?.length || 0} suggestions`}
              </div>
              <div className={styles.historyTime}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.settingsSection}>
        <div className={styles.settingsTitle}>Settings</div>
        
        <div className={styles.settingItem}>
          <div>
            <div className={styles.settingLabel}>Auto-suggest</div>
            <div className={styles.settingDescription}>Automatically suggest designs based on context</div>
          </div>
          <Button
            appearance={settings.autoSuggest ? 'primary' : 'subtle'}
            size="small"
            onClick={() => setSettings(prev => ({ ...prev, autoSuggest: !prev.autoSuggest }))}
          >
            {settings.autoSuggest ? 'On' : 'Off'}
          </Button>
        </div>
        
        <div className={styles.settingItem}>
          <div>
            <div className={styles.settingLabel}>Max suggestions</div>
            <div className={styles.settingDescription}>Maximum number of suggestions per query</div>
          </div>
          <Dropdown
            value={settings.maxSuggestions.toString()}
            onOptionSelect={(_, data) => setSettings(prev => ({ ...prev, maxSuggestions: parseInt(data.optionValue || '3') }))}
          >
            <Option value="1">1</Option>
            <Option value="3">3</Option>
            <Option value="5">5</Option>
            <Option value="10">10</Option>
          </Dropdown>
        </div>
        
        <div className={styles.settingItem}>
          <div>
            <div className={styles.settingLabel}>Confidence threshold</div>
            <div className={styles.settingDescription}>Minimum confidence level for suggestions</div>
          </div>
          <Text>{(settings.confidenceThreshold * 100).toFixed(0)}%</Text>
        </div>
        
        <div className={styles.settingItem}>
          <div>
            <div className={styles.settingLabel}>Include assets</div>
            <div className={styles.settingDescription}>Consider design assets in suggestions</div>
          </div>
          <Button
            appearance={settings.includeAssets ? 'primary' : 'subtle'}
            size="small"
            onClick={() => setSettings(prev => ({ ...prev, includeAssets: !prev.includeAssets }))}
          >
            {settings.includeAssets ? 'On' : 'Off'}
          </Button>
        </div>
        
        <div className={styles.settingItem}>
          <div>
            <div className={styles.settingLabel}>Include patterns</div>
            <div className={styles.settingDescription}>Consider UX patterns in suggestions</div>
          </div>
          <Button
            appearance={settings.includePatterns ? 'primary' : 'subtle'}
            size="small"
            onClick={() => setSettings(prev => ({ ...prev, includePatterns: !prev.includePatterns }))}
          >
            {settings.includePatterns ? 'On' : 'Off'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <SparkleRegular />
          <span>AI Design Suggestions</span>
        </div>
        <div className={styles.headerActions}>
          <Tooltip content="Settings" relationship="label">
            <Button appearance="subtle" size="small" icon={<SettingsRegular />} />
          </Tooltip>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabsContainer}>
          <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect}>
            <Tab value="chat" icon={<LightbulbRegular />}>Chat</Tab>
            <Tab value="history" icon={<HistoryRegular />}>History</Tab>
            <Tab value="settings" icon={<SettingsRegular />}>Settings</Tab>
          </TabList>
        </div>

        <div className={styles.tabContent}>
          {selectedTab === 'chat' && renderChatTab()}
          {selectedTab === 'history' && renderHistoryTab()}
          {selectedTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
};

export default AIDesignSuggestionChat; 