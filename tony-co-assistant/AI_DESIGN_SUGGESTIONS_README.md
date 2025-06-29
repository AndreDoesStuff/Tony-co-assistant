# AI Design Suggestions Feature

## Overview
The AI Design Suggestions feature provides an intelligent canvas interface for design collaboration with AI assistance. It includes a right-side chat interface similar to Figma's assistant, a left-side canvas with zoom and pan capabilities, and session management functionality.

## Features

### Canvas Interface
- **Interactive Canvas**: Drag, drop, and manipulate design elements
- **Zoom & Pan Controls**: Multiple input methods for navigation
- **Session Management**: Save and load design sessions
- **Export Functionality**: Export designs to Figma-compatible JSON

### AI Chat Assistant
- **Real-time Chat**: Communicate with AI about design changes
- **Suggestion Generation**: AI generates design suggestions based on your input
- **Suggestion Panel**: Review and apply AI-generated suggestions
- **Session History**: Track conversation history across sessions

## Input Controls

### 🖱️ Mouse Controls
- **Left-click + drag**: Pan around the canvas
- **Scroll wheel**: Zoom in and out, centered on the cursor position
- **Double-click**: Center and zoom in on the clicked location
- **Right-click**: Open context menu (placeholder for now)

### 🖲️ Trackpad Controls (Mac/Windows)
- **Two-finger drag**: Pan in all directions
- **Pinch-to-zoom**: Zoom in and out smoothly, centered around the pinch
- **Double-tap with two fingers**: Zoom in
- **Option + scroll (or Ctrl + scroll)**: Zoom on pointer, for compatibility with external trackpads

### 🧭 Additional Behaviors
- **Zoom limits**: Minimum 25%, maximum 300%
- **Reset view button**: Centers and resets zoom to 100%
- **Floating zoom label**: Shows current zoom level near zoom controls
- **Performance optimization**: Uses requestAnimationFrame for smooth panning and zooming
- **Cross-browser compatibility**: Works seamlessly across common browsers and input devices

## Usage

### Getting Started
1. Open the AI Design Suggestions interface
2. The canvas loads with a default mock dashboard
3. Use the input controls to navigate around the canvas
4. Start chatting with the AI assistant on the right panel

### Working with AI
1. Type your design request in the chat input
2. AI will generate suggestions and respond
3. Review suggestions in the Suggestions tab
4. Apply suggestions directly to the canvas
5. Provide feedback on suggestions to improve AI learning

### Session Management
1. Save your current session using the "Save Session" button
2. Switch between sessions using the session selector
3. Create new sessions for different projects
4. Export designs to Figma-compatible format

## Technical Implementation

### Components
- `AIDesignSuggestionsCanvas.tsx`: Basic canvas implementation
- `AIDesignSuggestionsEnhanced.tsx`: Full-featured implementation with chat
- `AIDesignSuggestionsPanel.tsx`: Suggestions display and management
- `AIDesignSuggestionsService.ts`: AI service integration

### Dependencies
- React Konva for canvas rendering
- Konva for 2D graphics
- React Flow for additional canvas features
- Fabric.js for advanced canvas capabilities

### State Management
- Canvas elements and their properties
- Zoom and pan state
- Chat history and AI responses
- Session data and suggestions
- Input mode tracking (pan/zoom states)

## Development

### Running the Application
```bash
npm start
```

### Testing
```bash
npm test
```

### Building
```bash
npm run build
```

## Future Enhancements
- Real-time collaboration features
- Advanced AI model integration
- More export formats
- Custom design element libraries
- Performance optimizations for large canvases

# AI Design Suggestions Canvas

A comprehensive AI-powered design canvas that allows users to create, iterate, and collaborate on design layouts through natural language conversations and intelligent suggestions.

## Features

### 🎨 Interactive Canvas
- **Zoom & Pan**: Full canvas navigation with mouse wheel zoom and drag pan
- **Drag & Drop**: Move design elements around the canvas
- **Selection**: Click to select and transform elements
- **Real-time Rendering**: Smooth canvas updates with Konva.js

### 💬 AI Chat Interface
- **Natural Language**: Describe design requests in plain English
- **Context-Aware**: AI understands current design state and context
- **Iterative Design**: Continue conversations to refine designs
- **Smart Responses**: AI provides relevant suggestions and explanations

### 🧠 Intelligent Suggestions
- **Pattern Recognition**: AI identifies design patterns and best practices
- **Context Analysis**: Suggestions based on current design elements
- **Confidence Scoring**: Each suggestion includes confidence and relevance metrics
- **Implementation Guides**: Step-by-step instructions for applying suggestions

### 💾 Session Management
- **Save & Load**: Persist design sessions with localStorage
- **Multiple Sessions**: Work on multiple design projects
- **Session History**: Track chat history and design evolution
- **Export Options**: Export designs to Figma-compatible format

### 📊 Mock Dashboard Example
The canvas comes pre-loaded with a warehouse operations dashboard including:
- Header with filters
- 4 metric cards (Total Orders, Pending Shipments, Inventory Value, Efficiency Score)
- Order Volume Trend chart
- Recent Activity table

## Architecture

### Components

#### `AIDesignSuggestionsEnhanced.tsx`
Main component that orchestrates the entire design canvas experience:
- Canvas rendering with Konva.js
- Chat interface management
- Session persistence
- AI integration

#### `AIDesignSuggestionsPanel.tsx`
Dedicated panel for displaying and managing AI suggestions:
- Suggestion cards with confidence metrics
- Implementation guides
- Feedback collection
- Apply to canvas functionality

#### `AIDesignSuggestionsCanvas.tsx`
Canvas-specific component with advanced features:
- Zoom and pan controls
- Element selection and transformation
- Drag and drop functionality
- Export capabilities

### State Management

```typescript
interface DesignSession {
  id: string;
  name: string;
  timestamp: number;
  canvasState: any;
  chatHistory: ChatMessage[];
  suggestions: DesignSuggestion[];
}

interface CanvasElement {
  id: string;
  type: 'card' | 'header' | 'chart' | 'table' | 'sidebar' | 'button';
  x: number;
  y: number;
  width: number;
  height: number;
  content: any;
  selected: boolean;
  style?: any;
}
```

### AI Integration

The system integrates with the existing AI Design Suggestions service to:
- Generate contextual suggestions based on user input
- Analyze current design state
- Provide implementation guidance
- Collect feedback for continuous improvement

## Usage

### Getting Started

1. **Navigate to AI Design Canvas**: Click on "AI Design Canvas" in the sidebar
2. **Explore the Mock Dashboard**: The canvas loads with a pre-built warehouse dashboard
3. **Start Chatting**: Use the chat interface to describe design changes
4. **Apply Suggestions**: Review and apply AI-generated suggestions

### Example Conversations

```
User: "Make the cards more compact"
AI: "I've made the cards more compact and reduced spacing between elements for a tighter layout. Check the suggestions panel for more options."

User: "Add a sidebar"
AI: "I've added a sidebar navigation panel to the left side of the dashboard for better organization. You can customize it further in the suggestions panel."

User: "Change the color scheme"
AI: "I've updated the color scheme to use a more modern blue and gray palette. Review the suggestions for additional styling options."
```

### Canvas Controls

- **Zoom**: Use mouse wheel or zoom buttons in toolbar
- **Pan**: Click and drag on empty canvas areas
- **Select**: Click on any design element
- **Move**: Drag selected elements to new positions
- **Resize**: Use transform handles on selected elements

### Session Management

- **Save Session**: Click "Save Session" to persist current state
- **Load Session**: Use the session dropdown to switch between saved sessions
- **New Session**: Click the "+" button to start a fresh design
- **Export**: Click "Export to Figma" to download design data

## Technical Implementation

### Dependencies

```json
{
  "react-konva": "^18.2.10",
  "konva": "^9.3.0",
  "reactflow": "^11.10.1"
}
```

### Canvas Rendering

The canvas uses Konva.js for high-performance 2D rendering:
- **Stage**: Main canvas container
- **Layer**: Rendering layer for elements
- **Group**: Container for related elements
- **Rect**: Background and card elements
- **Text**: Labels and content
- **Transformer**: Selection and transformation handles

### AI Service Integration

```typescript
const service = new AIDesignSuggestionsService();

// Generate suggestions
const suggestions = await service.generateSuggestions(userId, context, 5);

// Apply feedback
service.addSuggestionFeedback(suggestionId, userId, rating, comment);
```

### Local Storage

Sessions are persisted using localStorage:
```typescript
// Save session
localStorage.setItem('ai-design-sessions', JSON.stringify(sessions));

// Load sessions
const savedSessions = localStorage.getItem('ai-design-sessions');
```

## Development

### Running Tests

```bash
npm test -- AIDesignSuggestionsEnhanced.test.tsx
```

### Adding New Element Types

1. Define the element type in the `CanvasElement` interface
2. Add rendering logic in `renderCanvasElement()`
3. Update the `applySuggestionsToCanvas()` function
4. Add corresponding AI suggestion handling

### Customizing AI Responses

Modify the `generateAIResponse()` function to handle new user input patterns:
```typescript
const generateAIResponse = (userInput: string, suggestions: DesignSuggestion[]): string => {
  const input = userInput.toLowerCase();
  
  if (input.includes('your-pattern')) {
    return 'Your custom response';
  }
  // ... existing patterns
};
```

## Future Enhancements

### Planned Features

- **Real-time Collaboration**: Multi-user editing capabilities
- **Advanced Charts**: Interactive data visualizations
- **Component Library**: Pre-built design components
- **Version Control**: Design iteration history
- **Cloud Sync**: Remote session storage
- **Figma Plugin**: Direct integration with Figma

### AI Improvements

- **Design Pattern Recognition**: Automatic pattern detection
- **Accessibility Suggestions**: WCAG compliance recommendations
- **Performance Optimization**: Layout efficiency suggestions
- **Brand Consistency**: Style guide enforcement
- **User Behavior Analysis**: Usage pattern learning

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is part of the Tony Co-Assistant system and follows the same licensing terms. 