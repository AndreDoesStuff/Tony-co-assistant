import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer } from 'react-konva';
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

interface DesignSession {
  id: string;
  name: string;
  timestamp: number;
  canvasState: any;
  chatHistory: ChatMessage[];
  suggestions: DesignSuggestion[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  suggestionId?: string;
}

interface CanvasElement {
  id: string;
  type: 'card' | 'header' | 'chart' | 'table' | 'sidebar';
  x: number;
  y: number;
  width: number;
  height: number;
  content: any;
  selected: boolean;
}

interface AIDesignSuggestionsCanvasProps {
  userId: string;
  className?: string;
}

const AIDesignSuggestionsCanvas: React.FC<AIDesignSuggestionsCanvasProps> = ({ 
  userId, 
  className = '' 
}) => {
  // State management
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [currentSession, setCurrentSession] = useState<DesignSession | null>(null);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  
  // Refs
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const service = new AIDesignSuggestionsService();

  // State for canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Constants
  const ZOOM_MIN = 0.25; // 25%
  const ZOOM_MAX = 3.0;  // 300%
  const ZOOM_STEP = 1.2;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
        
        if (stageRef.current) {
          stageRef.current.width(rect.width);
          stageRef.current.height(rect.height);
          stageRef.current.batchDraw();
        }
      }
    };

    // Initial size calculation
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize with mock dashboard
  useEffect(() => {
    initializeMockSession();
    loadSessions();
  }, []);

  const initializeMockSession = () => {
    const mockSession: DesignSession = {
      id: 'mock-session',
      name: 'Warehouse Dashboard',
      timestamp: Date.now(),
      canvasState: {},
      chatHistory: [
        {
          id: '1',
          type: 'user',
          content: 'Design a dashboard for warehouse operations',
          timestamp: Date.now() - 60000
        },
        {
          id: '2',
          type: 'ai',
          content: 'I\'ve created a warehouse operations dashboard with key metrics, charts, and activity tracking. You can now iterate on this design by asking for changes.',
          timestamp: Date.now() - 30000
        }
      ],
      suggestions: []
    };

    const mockElements: CanvasElement[] = [
      {
        id: 'header',
        type: 'header',
        x: 50,
        y: 50,
        width: 1200,
        height: 80,
        content: {
          title: 'Warehouse Operations Dashboard',
          filters: ['Date Range', 'Location', 'Category']
        },
        selected: false
      },
      {
        id: 'metric-1',
        type: 'card',
        x: 50,
        y: 150,
        width: 280,
        height: 120,
        content: {
          title: 'Total Orders',
          value: '1,247',
          change: '+12%',
          trend: 'up'
        },
        selected: false
      },
      {
        id: 'metric-2',
        type: 'card',
        x: 350,
        y: 150,
        width: 280,
        height: 120,
        content: {
          title: 'Pending Shipments',
          value: '89',
          change: '-5%',
          trend: 'down'
        },
        selected: false
      },
      {
        id: 'metric-3',
        type: 'card',
        x: 650,
        y: 150,
        width: 280,
        height: 120,
        content: {
          title: 'Inventory Value',
          value: '$2.4M',
          change: '+8%',
          trend: 'up'
        },
        selected: false
      },
      {
        id: 'metric-4',
        type: 'card',
        x: 950,
        y: 150,
        width: 280,
        height: 120,
        content: {
          title: 'Efficiency Score',
          value: '94%',
          change: '+2%',
          trend: 'up'
        },
        selected: false
      },
      {
        id: 'chart',
        type: 'chart',
        x: 50,
        y: 300,
        width: 600,
        height: 300,
        content: {
          title: 'Order Volume Trend',
          type: 'line',
          data: [
            { label: 'Mon', value: 120 },
            { label: 'Tue', value: 145 },
            { label: 'Wed', value: 98 },
            { label: 'Thu', value: 167 },
            { label: 'Fri', value: 134 },
            { label: 'Sat', value: 89 },
            { label: 'Sun', value: 67 }
          ]
        },
        selected: false
      },
      {
        id: 'table',
        type: 'table',
        x: 700,
        y: 300,
        width: 550,
        height: 300,
        content: {
          title: 'Recent Activity',
          headers: ['Order ID', 'Status', 'Location', 'Time'],
          rows: [
            ['#12345', 'Shipped', 'Zone A', '2 min ago'],
            ['#12344', 'Processing', 'Zone B', '5 min ago'],
            ['#12343', 'Delivered', 'Zone C', '12 min ago'],
            ['#12342', 'Shipped', 'Zone A', '18 min ago'],
            ['#12341', 'Processing', 'Zone B', '25 min ago']
          ]
        },
        selected: false
      }
    ];

    setCurrentSession(mockSession);
    setCanvasElements(mockElements);
    setChatHistory(mockSession.chatHistory);
  };

  const loadSessions = () => {
    const savedSessions = localStorage.getItem('ai-design-sessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
    }
  };

  const saveSession = useCallback(() => {
    if (!currentSession) return;

    const sessionToSave: DesignSession = {
      ...currentSession,
      canvasState: {
        elements: canvasElements,
        zoom,
        pan
      },
      chatHistory,
      suggestions
    };

    const updatedSessions = sessions.filter(s => s.id !== sessionToSave.id);
    const newSessions = [...updatedSessions, sessionToSave];
    
    setSessions(newSessions);
    localStorage.setItem('ai-design-sessions', JSON.stringify(newSessions));
  }, [currentSession, canvasElements, zoom, pan, chatHistory, suggestions, sessions]);

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setCanvasElements(session.canvasState?.elements || []);
      setChatHistory(session.chatHistory);
      setSuggestions(session.suggestions);
      setZoom(session.canvasState?.zoom || 1);
      setPan(session.canvasState?.pan || { x: 0, y: 0 });
    }
  };

  const createNewSession = () => {
    const newSession: DesignSession = {
      id: `session-${Date.now()}`,
      name: `Design Session ${sessions.length + 1}`,
      timestamp: Date.now(),
      canvasState: {},
      chatHistory: [],
      suggestions: []
    };

    setCurrentSession(newSession);
    setCanvasElements([]);
    setChatHistory([]);
    setSuggestions([]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCanvasClick = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedElement(null);
      setCanvasElements(prev => prev.map(el => ({ ...el, selected: false })));
    }
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    setCanvasElements(prev => 
      prev.map(el => ({ ...el, selected: el.id === elementId }))
    );
  };

  const handleDragEnd = (elementId: string, newX: number, newY: number) => {
    setCanvasElements(prev =>
      prev.map(el =>
        el.id === elementId ? { ...el, x: newX, y: newY } : el
      )
    );
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoom * ZOOM_STEP : zoom / ZOOM_STEP;
    setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom)));
  };

  const handlePan = (dx: number, dy: number) => {
    setPan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  // Reset view to center and default zoom
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle mouse wheel zoom (for mouse wheel and option+scroll)
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    // Handle mouse wheel events (deltaMode !== 0 means mouse wheel)
    if (e.evt.deltaMode !== 0 || e.evt.altKey || e.evt.ctrlKey) {
      const scaleBy = 1.1;
      const stage = e.target.getStage();
      
      if (!stage) return;
      
      const oldScale = stage.scaleX();
      const mousePointTo = {
        x: (stage.getPointerPosition()?.x || 0) / oldScale - stage.x() / oldScale,
        y: (stage.getPointerPosition()?.y || 0) / oldScale - stage.y() / oldScale,
      };

      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale));
      setZoom(clampedScale);

      const newPos = {
        x: -(mousePointTo.x - (stage.getPointerPosition()?.x || 0) / clampedScale) * clampedScale,
        y: -(mousePointTo.y - (stage.getPointerPosition()?.y || 0) / clampedScale) * clampedScale,
      };
      setPan(newPos);
    }
  };

  // Handle double-click to center and zoom
  const handleDoubleClick = (e: any) => {
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    
    // Center on clicked position and zoom in
    const newZoom = Math.min(ZOOM_MAX, zoom * 1.5);
    const stageCenter = {
      x: stage.width() / 2,
      y: stage.height() / 2
    };
    
    const newPan = {
      x: stageCenter.x - (pointerPos.x * newZoom),
      y: stageCenter.y - (pointerPos.y * newZoom)
    };
    
    setZoom(newZoom);
    setPan(newPan);
  };

  // Handle mouse events for panning
  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    if (!stage) return;
    
    // Left mouse button (button 0) for panning
    if (e.evt.button === 0) {
      e.evt.preventDefault();
      setIsPanning(true);
      setLastPanPoint({
        x: stage.getPointerPosition()?.x || 0,
        y: stage.getPointerPosition()?.y || 0
      });
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isPanning) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const currentPoint = {
      x: stage.getPointerPosition()?.x || 0,
      y: stage.getPointerPosition()?.y || 0
    };
    
    const dx = currentPoint.x - lastPanPoint.x;
    const dy = currentPoint.y - lastPanPoint.y;
    
    // Use requestAnimationFrame for smooth panning
    requestAnimationFrame(() => {
      setPan(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
    });
    
    setLastPanPoint(currentPoint);
  };

  const handleMouseUp = (e: any) => {
    setIsPanning(false);
  };

  // Handle right-click for context menu
  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    
    setContextMenuPosition({
      x: pointerPos.x,
      y: pointerPos.y
    });
    setShowContextMenu(true);
  };

  // Handle touch events for trackpad
  const handleTouchStart = (e: any) => {
    e.evt.preventDefault();
    const touches = e.evt.touches;
    
    // Only handle two-finger gestures
    if (touches.length === 2) {
      const stage = e.target.getStage();
      if (!stage) return;
      
      // Store initial touch positions
      stage.setAttr('touchStartPos', {
        x1: touches[0].clientX,
        y1: touches[0].clientY,
        x2: touches[1].clientX,
        y2: touches[1].clientY
      });
      
      // Store initial pinch distance
      const distance = Math.sqrt(
        Math.pow(touches[1].clientX - touches[0].clientX, 2) +
        Math.pow(touches[1].clientY - touches[0].clientY, 2)
      );
      stage.setAttr('lastPinchDistance', distance);
      stage.setAttr('initialPinchDistance', distance);
    }
  };

  const handleTouchMove = (e: any) => {
    e.evt.preventDefault();
    const touches = e.evt.touches;
    
    // Only handle two-finger gestures
    if (touches.length === 2) {
      const stage = e.target.getStage();
      if (!stage) return;
      
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const lastDistance = stage.getAttr('lastPinchDistance');
      const initialDistance = stage.getAttr('initialPinchDistance');
      
      // If distance changed significantly, it's a pinch gesture
      const distanceChange = Math.abs(distance - initialDistance);
      const isPinchGesture = distanceChange > 10; // Threshold for pinch detection
      
      if (isPinchGesture && lastDistance) {
        // Handle pinch zoom
        const scale = distance / lastDistance;
        const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * scale));
        
        // Center zoom on pinch center
        const pinchCenter = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2
        };
        
        const stageCenter = {
          x: stage.width() / 2,
          y: stage.height() / 2
        };
        
        const newPan = {
          x: stageCenter.x - (pinchCenter.x * newZoom),
          y: stageCenter.y - (pinchCenter.y * newZoom)
        };
        
        requestAnimationFrame(() => {
          setZoom(newZoom);
          setPan(newPan);
        });
        
        stage.setAttr('lastPinchDistance', distance);
      } else {
        // Handle two-finger pan - simplified and more direct approach
        const touchStartPos = stage.getAttr('touchStartPos');
        if (!touchStartPos) return;
        
        // Calculate the center point of the two fingers
        const currentCenter = {
          x: (touches[0].clientX + touches[1].clientX) / 2,
          y: (touches[0].clientY + touches[1].clientY) / 2
        };
        
        const startCenter = {
          x: (touchStartPos.x1 + touchStartPos.x2) / 2,
          y: (touchStartPos.y1 + touchStartPos.y2) / 2
        };
        
        // Calculate pan delta
        const dx = currentCenter.x - startCenter.x;
        const dy = currentCenter.y - startCenter.y;
        
        // Apply pan directly without requestAnimationFrame for immediate response
        setPan(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
        
        // Update touch start position for smooth panning
        stage.setAttr('touchStartPos', {
          x1: touches[0].clientX,
          y1: touches[0].clientY,
          x2: touches[1].clientX,
          y2: touches[1].clientY
        });
      }
    }
  };

  const handleTouchEnd = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    
    // Clear touch data
    stage.setAttr('touchStartPos', null);
    stage.setAttr('lastPinchDistance', null);
    stage.setAttr('initialPinchDistance', null);
  };

  // Handle double-tap with two fingers for zoom
  const handleDoubleTap = (e: any) => {
    const touches = e.evt.touches;
    if (touches.length === 2) {
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      
      // Zoom in on double-tap location
      const newZoom = Math.min(ZOOM_MAX, zoom * 1.5);
      const stageCenter = {
        x: stage.width() / 2,
        y: stage.height() / 2
      };
      
      const newPan = {
        x: stageCenter.x - (pointerPos.x * newZoom),
        y: stageCenter.y - (pointerPos.y * newZoom)
      };
      
      setZoom(newZoom);
      setPan(newPan);
    }
  };

  const handleUserInput = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: userInput,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Generate AI response and suggestions
      const context = {
        userId,
        preferences: {},
        skillLevel: 'intermediate',
        projectType: 'dashboard',
        currentDesign: { elements: canvasElements },
        platform: 'web',
        deviceType: 'desktop'
      };

      const aiSuggestions = await service.generateSuggestions(userId, context, 3);
      setSuggestions(prev => [...prev, ...aiSuggestions]);

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        type: 'ai',
        content: generateAIResponse(userInput, aiSuggestions),
        timestamp: Date.now(),
        suggestionId: aiSuggestions[0]?.id
      };

      setChatHistory(prev => [...prev, aiMessage]);

      // Apply suggestions to canvas if they're layout changes
      applySuggestionsToCanvas(aiSuggestions);

    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string, suggestions: DesignSuggestion[]): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('compact') || input.includes('smaller')) {
      return 'I\'ve made the cards more compact and reduced spacing between elements for a tighter layout.';
    } else if (input.includes('sidebar')) {
      return 'I\'ve added a sidebar navigation panel to the left side of the dashboard for better organization.';
    } else if (input.includes('color') || input.includes('theme')) {
      return 'I\'ve updated the color scheme to use a more modern blue and gray palette.';
    } else if (input.includes('chart') || input.includes('graph')) {
      return 'I\'ve enhanced the chart with better data visualization and interactive tooltips.';
    } else {
      return `I've analyzed your request and generated ${suggestions.length} design suggestions. You can review them in the suggestions panel and apply the ones you like.`;
    }
  };

  const applySuggestionsToCanvas = (newSuggestions: DesignSuggestion[]) => {
    const updatedElements = [...canvasElements];

    for (const suggestion of newSuggestions) {
      if (suggestion.type === 'layout' && suggestion.content.name?.includes('Compact')) {
        // Make cards more compact
        updatedElements.forEach(el => {
          if (el.type === 'card') {
            el.width = Math.min(el.width, 250);
            el.height = Math.min(el.height, 100);
          }
        });
      } else if (suggestion.type === 'component' && suggestion.content.name?.includes('Sidebar')) {
        // Add sidebar
        const sidebar: CanvasElement = {
          id: `sidebar-${Date.now()}`,
          type: 'sidebar',
          x: 0,
          y: 0,
          width: 250,
          height: 800,
          content: {
            title: 'Navigation',
            items: ['Dashboard', 'Orders', 'Inventory', 'Analytics', 'Settings']
          },
          selected: false
        };
        updatedElements.push(sidebar);
        
        // Adjust other elements
        updatedElements.forEach(el => {
          if (el.id !== sidebar.id) {
            el.x += 250;
          }
        });
      }
    }

    setCanvasElements(updatedElements);
  };

  const exportToFigma = () => {
    // This would integrate with Figma API
    const figmaData = {
      elements: canvasElements,
      layout: { zoom, pan },
      metadata: {
        sessionName: currentSession?.name,
        exportTime: Date.now()
      }
    };
    
    // For now, just download as JSON
    const dataStr = JSON.stringify(figmaData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSession?.name || 'design'}-figma-export.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCanvasElement = (element: CanvasElement) => {
    const isSelected = element.selected;
    
    switch (element.type) {
      case 'header':
        return (
          <Group key={element.id}>
            <Rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill="#f8fafc"
              stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
              onClick={() => handleElementClick(element.id)}
              draggable
              onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
            />
            <Text
              x={element.x + 20}
              y={element.y + 20}
              text={element.content.title}
              fontSize={24}
              fontFamily="Inter"
              fill="#1e293b"
              fontStyle="bold"
            />
            <Text
              x={element.x + 20}
              y={element.y + 50}
              text={`Filters: ${element.content.filters.join(', ')}`}
              fontSize={14}
              fontFamily="Inter"
              fill="#64748b"
            />
          </Group>
        );

      case 'card':
        return (
          <Group key={element.id}>
            <Rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill="white"
              stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.1}
              shadowOffset={{ x: 0, y: 2 }}
              onClick={() => handleElementClick(element.id)}
              draggable
              onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
            />
            <Text
              x={element.x + 20}
              y={element.y + 15}
              text={element.content.title}
              fontSize={14}
              fontFamily="Inter"
              fill="#64748b"
            />
            <Text
              x={element.x + 20}
              y={element.y + 40}
              text={element.content.value}
              fontSize={28}
              fontFamily="Inter"
              fill="#1e293b"
              fontStyle="bold"
            />
            <Text
              x={element.x + 20}
              y={element.y + 70}
              text={element.content.change}
              fontSize={14}
              fontFamily="Inter"
              fill={element.content.trend === 'up' ? "#10b981" : "#ef4444"}
            />
          </Group>
        );

      case 'chart':
        return (
          <Group key={element.id}>
            <Rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill="white"
              stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.1}
              shadowOffset={{ x: 0, y: 2 }}
              onClick={() => handleElementClick(element.id)}
              draggable
              onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
            />
            <Text
              x={element.x + 20}
              y={element.y + 20}
              text={element.content.title}
              fontSize={18}
              fontFamily="Inter"
              fill="#1e293b"
              fontStyle="bold"
            />
            {/* Simplified chart visualization */}
            <Rect
              x={element.x + 20}
              y={element.y + 60}
              width={element.width - 40}
              height={element.height - 80}
              fill="#f1f5f9"
              cornerRadius={4}
            />
            <Text
              x={element.x + 20}
              y={element.y + element.height - 20}
              text="Chart visualization would render here"
              fontSize={12}
              fontFamily="Inter"
              fill="#64748b"
            />
          </Group>
        );

      case 'table':
        return (
          <Group key={element.id}>
            <Rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill="white"
              stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.1}
              shadowOffset={{ x: 0, y: 2 }}
              onClick={() => handleElementClick(element.id)}
              draggable
              onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
            />
            <Text
              x={element.x + 20}
              y={element.y + 20}
              text={element.content.title}
              fontSize={18}
              fontFamily="Inter"
              fill="#1e293b"
              fontStyle="bold"
            />
            {/* Table headers */}
            {element.content.headers.map((header: string, index: number) => (
              <Text
                key={index}
                x={element.x + 20 + (index * 120)}
                y={element.y + 50}
                text={header}
                fontSize={12}
                fontFamily="Inter"
                fill="#64748b"
                fontStyle="bold"
              />
            ))}
            {/* Table rows */}
            {element.content.rows.slice(0, 3).map((row: string[], rowIndex: number) => (
              row.map((cell: string, cellIndex: number) => (
                <Text
                  key={`${rowIndex}-${cellIndex}`}
                  x={element.x + 20 + (cellIndex * 120)}
                  y={element.y + 80 + (rowIndex * 25)}
                  text={cell}
                  fontSize={12}
                  fontFamily="Inter"
                  fill="#1e293b"
                />
              ))
            ))}
          </Group>
        );

      case 'sidebar':
        return (
          <Group key={element.id}>
            <Rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill="#1e293b"
              stroke={isSelected ? "#3b82f6" : "#334155"}
              strokeWidth={isSelected ? 2 : 1}
              onClick={() => handleElementClick(element.id)}
              draggable
              onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
            />
            <Text
              x={element.x + 20}
              y={element.y + 30}
              text={element.content.title}
              fontSize={18}
              fontFamily="Inter"
              fill="white"
              fontStyle="bold"
            />
            {element.content.items.map((item: string, index: number) => (
              <Text
                key={index}
                x={element.x + 20}
                y={element.y + 70 + (index * 40)}
                text={item}
                fontSize={14}
                fontFamily="Inter"
                fill="#cbd5e1"
              />
            ))}
          </Group>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Chat Interface Panel - Left Side */}
      {/* 
      <div className={`${isChatCollapsed ? 'w-12' : 'w-96'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {!isChatCollapsed ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">AI Design Assistant</h2>
                <button
                  onClick={createNewSession}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <select
                value={currentSession?.id || ''}
                onChange={(e) => loadSession(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="">Select Session</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-xs p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
                  placeholder="Describe your design request..."
                  className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleUserInput}
                  disabled={isLoading || !userInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => setIsChatCollapsed(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Show Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      */}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Canvas */}
        <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden">
          <Stage
            ref={stageRef}
            width={canvasSize.width}
            height={canvasSize.height}
            scaleX={zoom}
            scaleY={zoom}
            x={pan.x}
            y={pan.y}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDblClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            style={{ cursor: isPanning ? 'grabbing' : 'default' }}
          >
            <Layer>
              {/* Grid background */}
              <Rect
                x={0}
                y={0}
                width={2000}
                height={2000}
                fill="#f8fafc"
              />
              
              {/* Canvas elements */}
              {canvasElements.map(renderCanvasElement)}
              
              {/* Transformer for selected elements */}
              {selectedElement && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Limit resize
                    return newBox.width < 50 || newBox.height < 50 ? oldBox : newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>

          {/* Floating Save/Export Pill - Top Left (Canvas Overlay) */}
          {/*
          <div className="absolute top-4 left-4 z-50">
            <div className="bg-white rounded-full shadow-xl border-2 border-gray-300 flex items-center space-x-1 p-1">
              <button
                onClick={saveSession}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Save Session"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </button>
              <button
                onClick={exportToFigma}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                title="Export to Figma"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>
          */}

          {/* Chat Toggle Button - Top Right (Canvas Overlay) */}
          {/*
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setIsChatCollapsed(!isChatCollapsed)}
              className="bg-white rounded-full shadow-xl border-2 border-gray-300 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title={isChatCollapsed ? "Show Chat" : "Hide Chat"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
          */}

          {/* Floating Zoom/Refresh Toolbar - Bottom Center (Canvas Overlay) */}
          {/*
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-full shadow-xl border-2 border-gray-300 flex items-center space-x-1 p-1">
              <button
                onClick={() => handleZoom('out')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Zoom Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <div className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full font-medium">
                {Math.round(zoom * 100)}%
              </div>
              
              <button
                onClick={() => handleZoom('in')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Zoom In"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button
                onClick={resetView}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Reset View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default AIDesignSuggestionsCanvas; 