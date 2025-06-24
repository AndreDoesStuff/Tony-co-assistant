import React, { useState, useRef, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Textarea,
  Button,
  Card,
  CardHeader,
  CardPreview,
  CardFooter,
  TabList,
  Tab,
  SelectTabEvent,
  SelectTabData,
  TabValue,
  Spinner,
} from '@fluentui/react-components';
import { SendRegular, AddRegular, ImageRegular, CopyRegular, EditRegular, CheckmarkRegular, DismissRegular, ArrowLeftRegular, PanelRightRegular } from '@fluentui/react-icons';
import styled from 'styled-components';
import UXRepository from './UXRepository';
import SchoolBench from './SchoolBench';
import { mockResponses } from '../data/mockResponses';
import TonyTypingIndicator from './TonyTypingIndicator';

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
  chatContainer: {
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
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    flex: 1,
    padding: '20px 0',
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
    maxWidth: '80%',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    margin: '0 24px',
  },
  userMessage: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: '#fff',
    alignSelf: 'flex-end',
    borderRadius: '12px',
    padding: '12px 16px',
    margin: '8px 0',
    position: 'relative',
    minWidth: '120px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: 'none',
  },
  aiMessage: {
    backgroundColor: tokens.colorNeutralBackground1,
    alignSelf: 'flex-start',
    border: 'none'
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '16px 0',
    alignItems: 'flex-end',
    position: 'relative',
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
    minHeight: '135px',
    maxHeight: '500px',
    width: '100%',
    padding: '12px 56px 12px 12px',
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
  buttonStack: {
    position: 'absolute',
    right: '12px',
    bottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 2,
    alignItems: 'center',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
    borderRadius: '4px',
    transition: 'background 0.2s',
    '&:hover': {
      background: tokens.colorNeutralBackground3,
      color: tokens.colorBrandForeground2,
    },
  },
  hiddenInput: {
    display: 'none',
  },
  sidebar: {
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
  sidebarOpen: {
    '@media (max-width: 900px)': {
      transform: 'translateX(0)',
    },
  },
  sidebarToggleBtn: {
    position: 'absolute',
    right: '16px',
    top: '16px',
    zIndex: 101,
    background: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  sidebarShowBtn: {
    position: 'fixed',
    right: '16px',
    top: '16px',
    zIndex: 101,
    background: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tabList: {
    backgroundColor: tokens.colorNeutralBackground1,
    marginBottom: '24px',
  },
  accordionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  preMessage: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    fontSize: '14px',
    margin: 0,
  },
  userBubbleActions: {
    position: 'absolute',
    bottom: '-32px',
    right: '0',
    display: 'flex',
    gap: '4px',
    zIndex: 2,
  },
  bubbleIconButton: {
    background: tokens.colorNeutralBackground1,
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    borderRadius: '4px',
    transition: 'background 0.2s',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: tokens.colorNeutralBackground2,
    },
  },
  editIndicator: {
    position: 'absolute',
    top: '-32px',
    left: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: tokens.colorNeutralForeground1,
    fontSize: '14px',
    padding: '4px 8px',
    background: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '4px',
  },
  editTextarea: {
    width: '100%',
    minHeight: '60px',
    fontSize: '14px',
    fontFamily: 'inherit',
    borderRadius: '8px',
    border: 'none',
    padding: '8px',
    background: tokens.colorNeutralBackground1,
    color: '#fff',
    resize: 'both',
    marginBottom: '8px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    transform: 'scaleX(-1)',
    '&::-webkit-resizer': {
      transform: 'scaleX(-1)',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${tokens.colorBrandStroke1}`,
    },
  },
  loadingMessage: {
    backgroundColor: tokens.colorNeutralBackground1,
    alignSelf: 'flex-start',
    padding: '12px 16px',
    borderRadius: '8px',
    maxWidth: '80%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loadingText: {
    color: tokens.colorNeutralForeground2,
  },
  ellipsis: {
    display: 'inline-block',
    position: 'relative',
    width: '16px',
    height: '8px',
    verticalAlign: 'bottom',
    marginLeft: '2px',
    '& span': {
      position: 'absolute',
      width: '3px',
      height: '3px',
      borderRadius: '50%',
      background: tokens.colorNeutralForeground2,
      bottom: '0',
      '&:nth-child(1)': {
        left: '0px',
        animation: 'ellipsis1 1.2s infinite',
      },
      '&:nth-child(2)': {
        left: '6px',
        animation: 'ellipsis2 1.2s infinite',
      },
      '&:nth-child(3)': {
        left: '12px',
        animation: 'ellipsis3 1.2s infinite',
      },
    },
    '@keyframes ellipsis1': {
      '0%': { opacity: '0.2' },
      '20%': { opacity: '1' },
      '40%': { opacity: '0.2' },
      '100%': { opacity: '0.2' }
    },
    '@keyframes ellipsis2': {
      '0%': { opacity: '0.2' },
      '20%': { opacity: '0.2' },
      '40%': { opacity: '1' },
      '60%': { opacity: '0.2' },
      '100%': { opacity: '0.2' }
    },
    '@keyframes ellipsis3': {
      '0%': { opacity: '0.2' },
      '40%': { opacity: '0.2' },
      '60%': { opacity: '1' },
      '80%': { opacity: '0.2' },
      '100%': { opacity: '0.2' }
    }
  },
});

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AnimatedEllipsis: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.ellipsis}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const styles = useStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedTab, setSelectedTab] = useState<TabValue>('ux-repository');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 500) + 'px';
    }
  }, [inputValue]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    if (editingMessageId) {
      // Update existing message
      const newMessages = messages.map(msg => 
        msg.id === editingMessageId 
          ? { ...msg, content: inputValue }
          : msg
      );
      setMessages(newMessages);
      setEditingMessageId(null);
    } else {
      // Add new message
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputValue,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setIsLoading(true);

      // Add mock AI response after a short delay
      setTimeout(() => {
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        setIsLoading(false);
      }, 3000);
    }
    setInputValue('');
  };

  const handleTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      e.target.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      e.target.value = '';
    }
  };

  const handleEditClick = (message: Message) => {
    setEditingMessageId(message.id);
    setInputValue(message.content);
    textareaRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInputValue('');
  };

  return (
    <div className={styles.root}>
      <div className={styles.chatContainer} style={{ width: sidebarOpen ? undefined : '100%' }}>
        {!sidebarOpen && (
          <button className={styles.sidebarShowBtn} onClick={() => setSidebarOpen(true)}>
            <PanelRightRegular />
          </button>
        )}
        <div className={styles.messageList}>
          {messages.map((message) => {
            const isUser = message.sender === 'user';
            if (isUser) {
              return (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles.userMessage}`}
                >
                  <pre className={styles.preMessage}>{message.content}</pre>
                  <div className={styles.userBubbleActions}>
                    <button
                      className={styles.bubbleIconButton}
                      title="Copy"
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                      }}
                    >
                      <CopyRegular />
                    </button>
                    <button
                      className={styles.bubbleIconButton}
                      title="Edit"
                      onClick={() => handleEditClick(message)}
                    >
                      <EditRegular />
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={message.id}
                className={`${styles.message} ${styles.aiMessage}`}
              >
                <pre className={styles.preMessage}>{message.content}</pre>
              </div>
            );
          })}
          {isLoading && <TonyTypingIndicator />}
          <div ref={endOfMessagesRef} />
        </div>
        <div className={styles.inputContainer}>
          {editingMessageId && (
            <div className={styles.editIndicator}>
              <EditRegular />
              <span>Editing message</span>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: tokens.colorNeutralForeground1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <DismissRegular />
              </button>
            </div>
          )}
          <div className={styles.inputFieldWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={editingMessageId ? "Edit your message..." : "Type your message..."}
              onKeyPress={handleKeyPress}
              rows={1}
              maxLength={5000}
            />
            <div className={styles.buttonStack}>
              {!editingMessageId && (
                <>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={handleFileButtonClick}
                    aria-label="Add file"
                  >
                    <AddRegular />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className={styles.hiddenInput}
                    accept=".txt,.md,.json,.csv,.docx,.pdf,.yaml,.pptx,.xml"
                    multiple
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={handleImageButtonClick}
                    aria-label="Add image"
                  >
                    <ImageRegular />
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    className={styles.hiddenInput}
                    accept=".png,.jpg,.jpeg,.webp,.svg"
                    multiple
                    onChange={handleImageChange}
                  />
                </>
              )}
              <Button
                className={styles.iconButton}
                appearance="primary"
                icon={<SendRegular />}
                onClick={handleSendMessage}
                aria-label={editingMessageId ? "Save changes" : "Send message"}
              />
            </div>
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className={
            sidebarOpen
              ? `${styles.sidebar} ${styles.sidebarOpen}`
              : styles.sidebar
          }
        >
          <button className={styles.sidebarToggleBtn} onClick={() => setSidebarOpen(false)}>
            <ArrowLeftRegular />
          </button>
          <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect} className={styles.tabList}>
            <Tab value="ux-repository">🧠 UX-Repository</Tab>
            <Tab value="school-bench">🎓 School Bench</Tab>
          </TabList>
          <div className={styles.accordionList}>
            {selectedTab === 'ux-repository' && <UXRepository />}
            {selectedTab === 'school-bench' && <SchoolBench />}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;