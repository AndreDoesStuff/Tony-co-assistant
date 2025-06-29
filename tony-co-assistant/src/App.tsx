import React, { useState, useEffect } from 'react';
import { FluentProvider, webDarkTheme, Button, Tooltip } from '@fluentui/react-components';
import ChatInterface from './components/ChatInterface';
import UXRepository from './components/UXRepository';
import SchoolBench from './components/SchoolBench';
import DesignAssetLibrary from './components/DesignAssetLibrary';
import TonySystemStatus from './components/TonySystemStatus';
import { KnowledgeGraphUI } from './components/KnowledgeGraphUI';
import { AdvancedLearningUI } from './components/AdvancedLearningUI';
import { SystemOptimizerUI } from './components/SystemOptimizerUI';
import { UserExperienceEnhancementUI } from './components/UserExperienceEnhancementUI';
import AIDesignSuggestionsEnhanced from './components/AIDesignSuggestionsEnhanced';
import {
  ChatRegular,
  BookOpenRegular,
  BookRegular,
  LibraryRegular,
  BrainRegular,
  LightbulbRegular,
  RocketRegular,
  SettingsRegular,
  PersonRegular,
  PanelLeftExpandRegular,
  PanelLeftContractRegular,
  PanelRightExpandRegular,
  PanelRightContractRegular,
  SparkleRegular,
} from '@fluentui/react-icons';
import './App.css';
import { tonyStore } from './store/TonyStore';

const NAV_ITEMS = [
  { key: 'chat', label: 'Chat Interface', icon: <ChatRegular /> },
  { key: 'ai-design-suggestions', label: 'AI Design Canvas', icon: <SparkleRegular /> },
  { key: 'asset-library', label: 'Design Assets', icon: <LibraryRegular /> },
  // { key: 'knowledge-graph', label: 'Knowledge Graph', icon: <BrainRegular /> },
  // { key: 'advanced-learning', label: 'Advanced Learning', icon: <LightbulbRegular /> },
  // { key: 'system-optimizer', label: 'System Optimizer', icon: <RocketRegular /> },
  // { key: 'ux-enhancement', label: 'UX Enhancement', icon: <PersonRegular /> },
];

function App() {
  const [isSystemStatusVisible, setIsSystemStatusVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chat');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('Initializing Tony Co-Assistant...');
        await tonyStore.initialize();
        setIsInitialized(true);
        console.log('Tony Co-Assistant initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Tony Co-Assistant:', error);
      }
    };

    initializeSystem();

    // Cleanup on unmount
    return () => {
      tonyStore.cleanup();
    };
  }, []);

  const toggleSystemStatus = () => {
    setIsSystemStatusVisible(!isSystemStatusVisible);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'chat':
        return <ChatInterface />;
      case 'ai-design-suggestions':
        return <AIDesignSuggestionsEnhanced userId="user-123" />;
      case 'ux-repository':
        return <UXRepository />;
      case 'school-bench':
        return <SchoolBench />;
      case 'asset-library':
        return <DesignAssetLibrary />;
      case 'knowledge-graph':
        return <KnowledgeGraphUI />;
      case 'advanced-learning':
        return <AdvancedLearningUI />;
      case 'system-optimizer':
        return <SystemOptimizerUI />;
      case 'ux-enhancement':
        return <UserExperienceEnhancementUI />;
      default:
        return <ChatInterface />;
    }
  };

  if (!isInitialized) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-content">
            <h2>Tony Co-Assistant</h2>
            <p>Initializing system components...</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FluentProvider theme={webDarkTheme}>
      <div className="app" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {/* Sidebar Navigation */}
        <nav
          className={`sidebar-nav${sidebarExpanded ? ' expanded' : ' collapsed'}`}
          style={{
            width: sidebarExpanded ? 220 : 64,
            background: '#181a20',
            borderRight: '1px solid #222',
            display: 'flex',
            flexDirection: 'column',
            alignItems: sidebarExpanded ? 'flex-start' : 'center',
            padding: '12px 0',
            transition: 'width 0.2s',
            zIndex: 10
          }}
        >
          <Button
            appearance="subtle"
            icon={sidebarExpanded ? <PanelLeftContractRegular /> : <PanelLeftExpandRegular />}
            onClick={() => setSidebarExpanded((v) => !v)}
            style={{ margin: sidebarExpanded ? '0 0 16px 12px' : '0 0 16px 0', alignSelf: sidebarExpanded ? 'flex-start' : 'center' }}
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          />
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.key} content={item.label} relationship="label" positioning="after">
              <Button
                appearance={selectedTab === item.key ? 'primary' : 'subtle'}
                icon={item.icon}
                onClick={() => setSelectedTab(item.key)}
                style={{
                  width: sidebarExpanded ? 200 : 48,
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                  margin: '4px 0',
                  padding: sidebarExpanded ? '8px 16px' : '8px',
                  borderRadius: 8,
                  fontWeight: selectedTab === item.key ? 600 : 400,
                  fontSize: 16,
                  gap: 16,
                  background: selectedTab === item.key ? '#23263a' : 'transparent',
                  color: selectedTab === item.key ? '#fff' : '#b0b3c6',
                  transition: 'all 0.15s',
                  minHeight: 44
                }}
              >
                {sidebarExpanded && <span style={{ marginLeft: 12 }}>{item.label}</span>}
              </Button>
            </Tooltip>
          ))}
        </nav>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <main className="app-main" style={{ flex: 1, height: '100%', width: '100%', overflow: 'hidden', background: '#181a20', padding: 0, margin: 0 }}>
            {renderContent()}
          </main>
          {/* System Status Panel */}
          <TonySystemStatus 
            isVisible={isSystemStatusVisible}
            onToggle={toggleSystemStatus}
          />
          {/* Toggle Button */}
          <button 
            className="system-status-toggle"
            onClick={toggleSystemStatus}
            title="Toggle System Status"
          >
            ⚙️
          </button>
        </div>
      </div>
    </FluentProvider>
  );
}

export default App;
