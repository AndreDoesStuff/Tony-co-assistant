import React, { useState, useEffect } from 'react';
import { FluentProvider, webDarkTheme, Tab, TabList, TabValue } from '@fluentui/react-components';
import ChatInterface from './components/ChatInterface';
import UXRepository from './components/UXRepository';
import SchoolBench from './components/SchoolBench';
import DesignAssetLibrary from './components/DesignAssetLibrary';
import TonySystemStatus from './components/TonySystemStatus';
import './App.css';
import { tonyStore } from './store/TonyStore';

function App() {
  const [isSystemStatusVisible, setIsSystemStatusVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabValue>('chat');

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
      case 'ux-repository':
        return <UXRepository />;
      case 'school-bench':
        return <SchoolBench />;
      case 'asset-library':
        return <DesignAssetLibrary />;
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
      <div className="app">
        <div className="app-layout">
          {/* Navigation Tabs */}
          <div className="app-navigation">
            <TabList selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value)}>
              <Tab value="chat">Chat Interface</Tab>
              <Tab value="ux-repository">UX Repository</Tab>
              <Tab value="school-bench">School Bench</Tab>
              <Tab value="asset-library">Design Asset Library</Tab>
            </TabList>
          </div>

          {/* Main Content */}
          <main className="app-main">
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
