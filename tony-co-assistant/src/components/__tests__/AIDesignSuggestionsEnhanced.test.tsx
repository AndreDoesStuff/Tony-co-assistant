import React from 'react';
import { render, screen } from '@testing-library/react';
import AIDesignSuggestionsEnhanced from '../AIDesignSuggestionsEnhanced';

// Mock the dependencies
jest.mock('react-konva', () => ({
  Stage: ({ children }: any) => <div data-testid="stage">{children}</div>,
  Layer: ({ children }: any) => <div data-testid="layer">{children}</div>,
  Rect: () => <div data-testid="rect" />,
  Text: () => <div data-testid="text" />,
  Group: ({ children }: any) => <div data-testid="group">{children}</div>,
  Transformer: () => <div data-testid="transformer" />
}));

jest.mock('../AIDesignSuggestionsPanel', () => {
  return function MockAIDesignSuggestionsPanel() {
    return <div data-testid="ai-design-suggestions-panel">AI Design Suggestions Panel</div>;
  };
});

jest.mock('../../services/AIDesignSuggestionsService', () => {
  return jest.fn().mockImplementation(() => ({
    generateSuggestions: jest.fn().mockResolvedValue([]),
    addSuggestionFeedback: jest.fn()
  }));
});

jest.mock('../../events/EventBus', () => ({
  eventBus: {
    publishSimple: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn()
  }
}));

describe('AIDesignSuggestionsEnhanced', () => {
  const defaultProps = {
    userId: 'test-user-123',
    className: 'test-class'
  };

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });

    // Mock window.innerWidth and innerHeight
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  it('renders without crashing', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    // Check that the main component renders
    expect(screen.getByText('AI Design Canvas')).toBeInTheDocument();
  });

  it('displays the mock session name', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(screen.getByText('Warehouse Dashboard')).toBeInTheDocument();
  });

  it('shows the toolbar with zoom controls', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('displays the canvas stage', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(screen.getByTestId('stage')).toBeInTheDocument();
  });

  it('shows the chat interface by default', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(screen.getByText('AI Design Assistant')).toBeInTheDocument();
  });

  it('displays tab navigation', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Suggestions (0)')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
  });

  it('shows save and export buttons', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(screen.getByText('Save Session')).toBeInTheDocument();
    expect(screen.getByText('Export to Figma')).toBeInTheDocument();
  });

  it('displays the mock chat history', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(screen.getByText(/Design a dashboard for warehouse operations/)).toBeInTheDocument();
    expect(screen.getByText(/I've created a warehouse operations dashboard/)).toBeInTheDocument();
  });

  it('shows the user input field', () => {
    render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Describe your design request...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<AIDesignSuggestionsEnhanced {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('test-class');
  });
}); 