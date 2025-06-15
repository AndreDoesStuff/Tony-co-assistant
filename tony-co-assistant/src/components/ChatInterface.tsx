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
} from '@fluentui/react-components';
import { SendRegular, AddRegular, ImageRegular, CopyRegular, EditRegular, CheckmarkRegular, DismissRegular, ArrowLeftRegular, PanelRightRegular } from '@fluentui/react-icons';
import styled from 'styled-components';
import UXRepository from './UXRepository';
import SchoolBench from './SchoolBench';

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
    maxWidth: '800px',
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
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: tokens.colorNeutralBackground2,
    color: '#fff',
    alignSelf: 'flex-end',
    borderRadius: '12px',
    padding: '12px 16px',
    margin: '8px 0',
    position: 'relative',
    minWidth: '120px',
    border: 'none',
    boxShadow: 'none',
  },
  aiMessage: {
    backgroundColor: tokens.colorNeutralBackground1,
    alignSelf: 'flex-start',
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
    minHeight: '150px',
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
    '& > div': {
      borderRadius: '12px',
      overflow: 'hidden',
    },
  },
  preMessage: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    fontSize: '14px',
    margin: 0,
  },
  userBubbleActions: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    gap: '4px',
    zIndex: 2,
  },
  bubbleIconButton: {
    background: 'none',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    color: '#fff',
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
  editTextarea: {
    width: '100%',
    minHeight: '60px',
    fontSize: '14px',
    fontFamily: 'inherit',
    borderRadius: '8px',
    border: 'none',
    padding: '8px',
    background: tokens.colorNeutralBackground2,
    color: '#fff',
    resize: 'vertical',
    marginBottom: '8px',
    boxSizing: 'border-box',
  },
});

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const styles = useStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedTab, setSelectedTab] = useState<TabValue>('ux-repository');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 500) + 'px';
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
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

  return (
    <div className={styles.root}>
      <div className={styles.chatContainer} style={{ width: sidebarOpen ? undefined : '100%' }}>
        {!sidebarOpen && (
          <button className={styles.sidebarShowBtn} onClick={() => setSidebarOpen(true)}>
            <PanelRightRegular />
          </button>
        )}
        <div className={styles.messageList}>
          {messages.map((message, idx) => {
            const isUser = message.sender === 'user';
            const isEditing = editingMessageId === message.id;
            const isCopied = copiedMessageId === message.id;
            if (isUser) {
              return (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles.userMessage}`}
                >
                  <div className={styles.userBubbleActions}>
                    <button
                      className={styles.bubbleIconButton}
                      title={isCopied ? 'Copied!' : 'Copy'}
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        setCopiedMessageId(message.id);
                        setTimeout(() => setCopiedMessageId(null), 1200);
                      }}
                    >
                      <CopyRegular />
                    </button>
                    {isEditing ? (
                      <>
                        <button
                          className={styles.bubbleIconButton}
                          title="Save"
                          onClick={() => {
                            setEditingMessageId(null);
                            // Save edit
                            const newMessages = [...messages];
                            newMessages[idx] = { ...message, content: editValue };
                            setMessages(newMessages);
                          }}
                        >
                          <CheckmarkRegular />
                        </button>
                        <button
                          className={styles.bubbleIconButton}
                          title="Cancel"
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditValue(message.content);
                          }}
                        >
                          <DismissRegular />
                        </button>
                      </>
                    ) : (
                      <button
                        className={styles.bubbleIconButton}
                        title="Edit"
                        onClick={() => {
                          setEditingMessageId(message.id);
                          setEditValue(message.content);
                        }}
                      >
                        <EditRegular />
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      className={styles.editTextarea}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <pre className={styles.preMessage}>{message.content}</pre>
                  )}
                </div>
              );
            }
            // AI message
            return (
              <div
                key={message.id}
                className={`${styles.message} ${styles.aiMessage}`}
              >
                <pre className={styles.preMessage}>{message.content}</pre>
              </div>
            );
          })}
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.inputFieldWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={handleKeyPress}
              rows={1}
              maxLength={5000}
            />
            <div className={styles.buttonStack}>
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
              <Button
                className={styles.iconButton}
                appearance="primary"
                icon={<SendRegular />}
                onClick={handleSendMessage}
                aria-label="Send message"
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