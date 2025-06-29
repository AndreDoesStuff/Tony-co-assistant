import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIDesignSuggestionChat from '../AIDesignSuggestionChat';

// Mock the dependencies
jest.mock('../../services/AIDesignSuggestionsService');
jest.mock('../../events/EventBus');
jest.mock('../../store/TonyStore');

describe('AIDesignSuggestionChat', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders AI Design Suggestions header', () => {
    render(<AIDesignSuggestionChat />);
    
    expect(screen.getByText('AI Design Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('displays empty state when no messages', () => {
    render(<AIDesignSuggestionChat />);
    
    expect(screen.getByText('Ask Tony for design suggestions based on UX patterns and available assets.')).toBeInTheDocument();
    expect(screen.getByText('Quick prompts:')).toBeInTheDocument();
  });

  test('shows quick prompts', () => {
    render(<AIDesignSuggestionChat />);
    
    expect(screen.getByText('Suggest a color palette for a modern app')).toBeInTheDocument();
    expect(screen.getByText('Recommend layout patterns for mobile')).toBeInTheDocument();
    expect(screen.getByText('Find accessible design components')).toBeInTheDocument();
  });

  test('allows input and send functionality', () => {
    render(<AIDesignSuggestionChat />);
    
    const input = screen.getByPlaceholderText('Ask for design suggestions...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    expect(input).toBeInTheDocument();
    expect(sendButton).toBeDisabled(); // Should be disabled when input is empty
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(sendButton).not.toBeDisabled();
  });

  test('switches between tabs', () => {
    render(<AIDesignSuggestionChat />);
    
    // Initially on Chat tab
    expect(screen.getByText('Ask Tony for design suggestions based on UX patterns and available assets.')).toBeInTheDocument();
    
    // Switch to History tab
    fireEvent.click(screen.getByText('History'));
    expect(screen.getByText('Chat History')).toBeInTheDocument();
    expect(screen.getByText('No chat history yet')).toBeInTheDocument();
    
    // Switch to Settings tab
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Auto-suggest')).toBeInTheDocument();
  });

  test('handles quick prompt clicks', () => {
    render(<AIDesignSuggestionChat />);
    
    const quickPrompt = screen.getByText('Suggest a color palette for a modern app');
    fireEvent.click(quickPrompt);
    
    // Should populate the input with the quick prompt
    const input = screen.getByPlaceholderText('Ask for design suggestions...');
    expect(input).toHaveValue('Suggest a color palette for a modern app');
  });

  test('displays full-page layout correctly', () => {
    render(<AIDesignSuggestionChat />);
    
    // Check that the component has the full-page structure
    const root = screen.getByText('AI Design Suggestions').closest('div');
    expect(root).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    });
  });
}); 