import React from 'react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import ChatInterface from './components/ChatInterface';
import UXRepository from './components/UXRepository';
import SchoolBench from './components/SchoolBench';
import './App.css';

function App() {
  return (
    <FluentProvider theme={webDarkTheme}>
      <ChatInterface />
    </FluentProvider>
  );
}

export default App;
