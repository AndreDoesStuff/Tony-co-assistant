import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer } from 'react-konva';
import {
  makeStyles,
  tokens,
  Text as FluentText,
  Button,
  Card,
  CardHeader,
  CardFooter,
  Spinner,
  Tooltip,
  Toast,
  ToastTitle,
  ToastBody,
} from '@fluentui/react-components';
import { 
  ChatRegular, 
  SparkleRegular, 
  SaveRegular, 
  FolderOpenRegular,
  PanelRightExpandRegular,
  PanelRightContractRegular,
  SendRegular,
  DeleteRegular,
  InfoRegular 
} from '@fluentui/react-icons';
import styled from 'styled-components';
import { DesignSuggestion } from '../types/tony';
import AIDesignSuggestionsPanel from './AIDesignSuggestionsPanel';
import { AIDesignSuggestionsService } from '../services/AIDesignSuggestionsService';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  canvasContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  canvasContainerFull: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    gap: '16px',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  zoomControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '6px',
    padding: '4px',
  },
  canvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  chatPanel: {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '400px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground2,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    transition: 'all 0.3s ease',
    zIndex: 1000,
    boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
  },
  chatPanelCollapsed: {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '0',
    minWidth: '0',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground2,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    transition: 'all 0.3s ease',
    zIndex: 1000,
    boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  chatContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHistory: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke1,
      borderRadius: '4px',
      '&:hover': {
        background: tokens.colorNeutralStroke2,
      },
    },
  },
  chatInput: {
    padding: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  messageContainer: {
    display: 'flex',
    gap: '8px',
  },
  messageContainerUser: {
    justifyContent: 'flex-end',
  },
  messageContainerAI: {
    justifyContent: 'flex-start',
  },
  message: {
    maxWidth: '280px',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.4',
    wordWrap: 'break-word',
  },
  messageUser: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
  },
  messageAI: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '4px',
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontSize: '14px',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
    fontFamily: 'inherit',
    '&:focus': {
      outline: 'none',
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
  },
  sendButton: {
    minWidth: '44px',
    height: '44px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseButton: {
    minWidth: '32px',
    height: '32px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  tab: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground2,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: `2px solid transparent`,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
      color: tokens.colorNeutralForeground1,
    },
  },
  tabActive: {
    color: tokens.colorBrandForeground1,
    borderBottom: `2px solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground,
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  sessionItem: {
    padding: '12px 16px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '8px',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
  },
  sessionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  sessionTitle: {
    fontWeight: '600',
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  sessionDate: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  sessionCount: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '2px 6px',
    borderRadius: '4px',
  },
});

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${tokens.colorNeutralStroke1};
  border-radius: 8px;
  background-color: ${tokens.colorNeutralBackground1};
  color: ${tokens.colorNeutralForeground1};
  font-size: 14px;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: ${tokens.colorBrandStroke1};
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${tokens.colorNeutralStroke1};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${tokens.colorNeutralStroke2};
  }
`;

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
  type: 'card' | 'header' | 'chart' | 'table' | 'sidebar' | 'button' | 'input' | 'navigation';
  x: number;
  y: number;
  width: number;
  height: number;
  content: any;
  selected: boolean;
  style?: any;
}

interface AIDesignSuggestionsEnhancedProps {
  userId: string;
  className?: string;
}

const AIDesignSuggestionsEnhanced: React.FC<AIDesignSuggestionsEnhancedProps> = ({ 
  userId, 
  className = '' 
}) => {
  const styles = useStyles();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [sessions, setSessions] = useState<DesignSession[]>([]);
  const [currentSession, setCurrentSession] = useState<DesignSession | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions' | 'sessions'>('chat');
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Refs
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
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

  // Initialize mock session
  const initializeMockSession = () => {
    const mockSession: DesignSession = {
      id: 'mock-dashboard',
      name: 'Mock Dashboard',
      timestamp: Date.now(),
      canvasState: {},
      chatHistory: [
        {
          id: '1',
          type: 'ai',
          content: 'Welcome to the AI Design Canvas! I can help you create and refine your designs. Try asking me to add elements, suggest improvements, or export your design to Figma.',
          timestamp: Date.now() - 60000,
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
        width: 800,
        height: 80,
        content: { title: 'Dashboard', subtitle: 'Analytics Overview' },
        selected: false,
        style: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }
      },
      {
        id: 'metric1',
        type: 'card',
        x: 50,
        y: 150,
        width: 180,
        height: 120,
        content: { title: 'Total Users', value: '12,847', change: '+12%' },
        selected: false,
        style: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }
      },
      {
        id: 'metric2',
        type: 'card',
        x: 250,
        y: 150,
        width: 180,
        height: 120,
        content: { title: 'Revenue', value: '$45,231', change: '+8%' },
        selected: false,
        style: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }
      },
      {
        id: 'metric3',
        type: 'card',
        x: 450,
        y: 150,
        width: 180,
        height: 120,
        content: { title: 'Conversion', value: '3.2%', change: '+2%' },
        selected: false,
        style: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }
      },
      {
        id: 'chart',
        type: 'chart',
        x: 50,
        y: 300,
        width: 400,
        height: 250,
        content: { type: 'line', data: [65, 59, 80, 81, 56, 55, 40] },
        selected: false,
        style: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }
      },
      {
        id: 'table',
        type: 'table',
        x: 480,
        y: 300,
        width: 350,
        height: 250,
        content: { 
          headers: ['Name', 'Status', 'Date'],
          rows: [
            ['John Doe', 'Active', '2024-01-15'],
            ['Jane Smith', 'Pending', '2024-01-14'],
            ['Bob Johnson', 'Active', '2024-01-13']
          ]
        },
        selected: false,
        style: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }
      },
      {
        id: 'sidebar',
        type: 'sidebar',
        x: 50,
        y: 580,
        width: 200,
        height: 300,
        content: { items: ['Dashboard', 'Analytics', 'Reports', 'Settings'] },
        selected: false,
        style: { backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }
      }
    ];

    setCanvasElements(mockElements);
    setChatHistory(mockSession.chatHistory);
    setCurrentSession(mockSession);
    setSessions([mockSession]);
  };

  useEffect(() => {
    initializeMockSession();
    loadSessions();
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (selectedElement && transformerRef.current) {
      const node = stageRef.current?.findOne(`#${selectedElement}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedElement]);

  const loadSessions = () => {
    const savedSessions = localStorage.getItem('ai-design-sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
    }
  };

  const saveSession = () => {
    if (!currentSession) return;

    const sessionToSave = {
      ...currentSession,
      canvasState: { elements: canvasElements, zoom, pan },
      chatHistory,
      suggestions,
      timestamp: Date.now()
    };

    const updatedSessions = sessions.filter(s => s.id !== currentSession.id);
    updatedSessions.push(sessionToSave);
    
    setSessions(updatedSessions);
    setCurrentSession(sessionToSave);
    localStorage.setItem('ai-design-sessions', JSON.stringify(updatedSessions));
    setToastMessage('Session saved successfully!');
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setChatHistory(session.chatHistory);
      setSuggestions(session.suggestions);
      if (session.canvasState) {
        setCanvasElements(session.canvasState.elements || []);
        setZoom(session.canvasState.zoom || 1);
        setPan(session.canvasState.pan || { x: 0, y: 0 });
      }
    }
  };

  const createNewSession = () => {
    const newSession: DesignSession = {
      id: `session-${Date.now()}`,
      name: `New Session ${sessions.length + 1}`,
      timestamp: Date.now(),
      canvasState: {},
      chatHistory: [],
      suggestions: []
    };

    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
    setCanvasElements([]);
    setChatHistory([]);
    setSuggestions([]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCanvasClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedElement(null);
    }
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
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

  // Handle keyboard events for space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  const handleUserInput = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userInput, suggestions);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: Date.now()
      };

      setChatHistory(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // Generate new suggestions
      const newSuggestions = generateSuggestions(userInput);
      setSuggestions(prev => [...prev, ...newSuggestions]);
    }, 1500);
  };

  const generateAIResponse = (userInput: string, suggestions: DesignSuggestion[]): string => {
    const responses = [
      "I've analyzed your request and generated some design suggestions. You can view them in the Suggestions tab.",
      "Great idea! I've created some design elements based on your description. Check the canvas for the new additions.",
      "I understand what you're looking for. Let me suggest some improvements to enhance the user experience.",
      "Based on your input, I've identified several opportunities to improve the design. Take a look at the suggestions.",
      "I've processed your request and created some design variations. You can apply them directly to the canvas."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateSuggestions = (userInput: string): DesignSuggestion[] => {
    const suggestionTypes: ('layout' | 'style' | 'interaction' | 'component' | 'pattern')[] = 
      ['layout', 'style', 'interaction', 'component', 'pattern'];
    
    return suggestionTypes.map((type, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Improvement`,
      description: `Suggested ${type} enhancement based on your request: "${userInput}"`,
      content: {
        name: `${type} enhancement`,
        description: `Improve ${type} based on user request`
      },
      confidence: 0.7 + Math.random() * 0.3,
      relevance: 0.6 + Math.random() * 0.4,
      priority: 'medium' as const,
      context: {
        userContext: { userId, preferences: {}, skillLevel: 'intermediate' as const, projectType: 'dashboard', goals: [], constraints: [] },
        designContext: { currentDesign: {}, designSystem: {}, availableAssets: [], designPatterns: [], styleGuide: {}, platform: 'web' as const, deviceType: 'desktop' },
        interactionContext: { userInteractions: [], interactionPatterns: [], userBehavior: {}, painPoints: [], successMetrics: {} },
        learningContext: { learnedPatterns: [], knowledgeBase: [], userProgress: {}, strengths: [], weaknesses: [] },
        constraints: { technical: [], business: [], accessibility: [], performance: [], budget: [], timeline: [] }
      },
      sources: ['ai-analysis', 'user-input'],
      reasoning: [`This ${type} improvement will enhance the user experience based on your request`],
      alternatives: [`Alternative ${type} approach 1`, `Alternative ${type} approach 2`],
      implementation: {
        steps: [
          { order: 1, title: 'Analyze current design', description: 'Review existing elements', code: '', tips: ['Consider user feedback'] },
          { order: 2, title: 'Apply changes', description: 'Implement the suggested improvements', code: '', tips: ['Test thoroughly'] }
        ],
        codeExamples: [],
        resources: [],
        estimatedTime: 30,
        difficulty: 'medium' as const,
        prerequisites: []
      },
      feedback: [],
      createdAt: Date.now(),
      lastUpdated: Date.now()
    }));
  };

  const applySuggestionsToCanvas = (newSuggestions: DesignSuggestion[]) => {
    newSuggestions.forEach(suggestion => {
      switch (suggestion.type) {
        case 'layout':
          // Add layout elements
          const layoutElement: CanvasElement = {
            id: `layout-${Date.now()}`,
            type: 'card',
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50,
            width: 200,
            height: 150,
            content: { title: 'New Layout Element', description: suggestion.description },
            selected: false,
            style: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }
          };
          setCanvasElements(prev => [...prev, layoutElement]);
          break;
        case 'style':
          // Update color scheme
          setCanvasElements(prev => 
            prev.map(el => ({
              ...el,
              style: { ...el.style, backgroundColor: '#f0f9ff' }
            }))
          );
          break;
        case 'component':
          // Update typography
          setCanvasElements(prev => 
            prev.map(el => ({
              ...el,
              style: { ...el.style, fontFamily: 'Inter, sans-serif' }
            }))
          );
          break;
        case 'pattern':
          // Adjust spacing
          setCanvasElements(prev => 
            prev.map(el => ({
              ...el,
              x: el.x + 20,
              y: el.y + 20
            }))
          );
          break;
        case 'interaction':
          // Add interactive elements
          const interactionElement: CanvasElement = {
            id: `interaction-${Date.now()}`,
            type: 'button',
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50,
            width: 120,
            height: 40,
            content: { text: 'Interactive Button' },
            selected: false,
            style: { backgroundColor: '#3b82f6', color: '#ffffff' }
          };
          setCanvasElements(prev => [...prev, interactionElement]);
          break;
      }
    });
  };

  const handleApplySuggestion = (suggestion: DesignSuggestion) => {
    applySuggestionsToCanvas([suggestion]);
    setSuggestions(prev => 
      prev.map(s => s.id === suggestion.id ? { ...s, feedback: [...s.feedback, { userId, rating: 5, comment: 'Applied to canvas', implemented: true, effectiveness: 1, timestamp: Date.now() }] } : s)
    );
    setToastMessage(`Applied: ${suggestion.title}`);
  };

  const handleSuggestionFeedback = (suggestionId: string, rating: number, comment?: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { 
        ...s, 
        feedback: [...s.feedback, { 
          userId, 
          rating, 
          comment, 
          implemented: false, 
          effectiveness: 0, 
          timestamp: Date.now() 
        }] 
      } : s)
    );
    setToastMessage('Feedback submitted!');
  };

  const exportToFigma = () => {
    const figmaData = {
      name: currentSession?.name || 'AI Design',
      elements: canvasElements.map(el => ({
        id: el.id,
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        content: el.content,
        style: el.style
      })),
      zoom,
      pan
    };

    const dataStr = JSON.stringify(figmaData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSession?.name || 'ai-design'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage('Design exported to Figma JSON!');
  };

  const renderCanvasElement = (element: CanvasElement) => {
    const isSelected = selectedElement === element.id;
    
    switch (element.type) {
      case 'header':
        return (
          <Group
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            draggable
            onClick={() => handleElementClick(element.id)}
            onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
          >
            <Rect
              width={element.width}
              height={element.height}
              fill={element.style?.backgroundColor || '#f8fafc'}
              stroke={isSelected ? '#3b82f6' : '#e2e8f0'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
            />
            <Text
              x={20}
              y={20}
              text={element.content.title}
              fontSize={24}
              fontFamily="Inter, sans-serif"
              fill="#1f2937"
              fontStyle="bold"
            />
            <Text
              x={20}
              y={50}
              text={element.content.subtitle}
              fontSize={16}
              fontFamily="Inter, sans-serif"
              fill="#6b7280"
            />
          </Group>
        );

      case 'card':
        return (
          <Group
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            draggable
            onClick={() => handleElementClick(element.id)}
            onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
          >
            <Rect
              width={element.width}
              height={element.height}
              fill={element.style?.backgroundColor || '#ffffff'}
              stroke={isSelected ? '#3b82f6' : '#e2e8f0'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
            />
            <Text
              x={16}
              y={16}
              text={element.content.title}
              fontSize={14}
              fontFamily="Inter, sans-serif"
              fill="#374151"
              fontStyle="bold"
            />
            <Text
              x={16}
              y={40}
              text={element.content.value}
              fontSize={24}
              fontFamily="Inter, sans-serif"
              fill="#1f2937"
              fontStyle="bold"
            />
            <Text
              x={16}
              y={70}
              text={element.content.change}
              fontSize={12}
              fontFamily="Inter, sans-serif"
              fill="#10b981"
            />
          </Group>
        );

      case 'chart':
        return (
          <Group
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            draggable
            onClick={() => handleElementClick(element.id)}
            onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
          >
            <Rect
              width={element.width}
              height={element.height}
              fill={element.style?.backgroundColor || '#ffffff'}
              stroke={isSelected ? '#3b82f6' : '#e2e8f0'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
            />
            <Text
              x={16}
              y={16}
              text="Analytics Chart"
              fontSize={16}
              fontFamily="Inter, sans-serif"
              fill="#374151"
              fontStyle="bold"
            />
            <Rect
              x={16}
              y={40}
              width={element.width - 32}
              height={element.height - 60}
              fill="#f3f4f6"
              cornerRadius={4}
            />
          </Group>
        );

      case 'table':
        return (
          <Group
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            draggable
            onClick={() => handleElementClick(element.id)}
            onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
          >
            <Rect
              width={element.width}
              height={element.height}
              fill={element.style?.backgroundColor || '#ffffff'}
              stroke={isSelected ? '#3b82f6' : '#e2e8f0'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
            />
            <Text
              x={16}
              y={16}
              text="Recent Activity"
              fontSize={16}
              fontFamily="Inter, sans-serif"
              fill="#374151"
              fontStyle="bold"
            />
            {element.content.headers.map((header: string, index: number) => (
              <Text
                key={index}
                x={16 + index * 100}
                y={40}
                text={header}
                fontSize={12}
                fontFamily="Inter, sans-serif"
                fill="#6b7280"
                fontStyle="bold"
              />
            ))}
          </Group>
        );

      case 'sidebar':
        return (
          <Group
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            draggable
            onClick={() => handleElementClick(element.id)}
            onDragEnd={(e) => handleDragEnd(element.id, e.target.x(), e.target.y())}
          >
            <Rect
              width={element.width}
              height={element.height}
              fill={element.style?.backgroundColor || '#f1f5f9'}
              stroke={isSelected ? '#3b82f6' : '#e2e8f0'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={8}
            />
            <Text
              x={16}
              y={16}
              text="Navigation"
              fontSize={16}
              fontFamily="Inter, sans-serif"
              fill="#374151"
              fontStyle="bold"
            />
            {element.content.items.map((item: string, index: number) => (
              <Text
                key={index}
                x={16}
                y={50 + index * 30}
                text={item}
                fontSize={14}
                fontFamily="Inter, sans-serif"
                fill="#6b7280"
              />
            ))}
          </Group>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
      {/* Chat Panel - Right Side Overlay */}
      <div className={isChatCollapsed ? styles.chatPanelCollapsed : styles.chatPanel}>
        {!isChatCollapsed && (
          <>
            <div className={styles.chatHeader}>
              <FluentText size={400} weight="semibold">
                AI Design Assistant
              </FluentText>
              <Button
                appearance="subtle"
                size="small"
                icon={<PanelRightContractRegular />}
                onClick={() => setIsChatCollapsed(true)}
                className={styles.collapseButton}
              />
            </div>

            <div className={styles.tabContainer}>
              <button
                onClick={() => setActiveTab('chat')}
                className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`${styles.tab} ${activeTab === 'suggestions' ? styles.tabActive : ''}`}
              >
                Suggestions ({suggestions.length})
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`}
              >
                Sessions
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'chat' && (
                <div className={styles.chatContent}>
                  <div className={styles.chatHistory} ref={chatHistoryRef}>
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`${styles.messageContainer} ${
                          message.type === 'user' ? styles.messageContainerUser : styles.messageContainerAI
                        }`}
                      >
                        <div
                          className={`${styles.message} ${
                            message.type === 'user' ? styles.messageUser : styles.messageAI
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={styles.messageTime}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className={styles.messageContainer}>
                        <div className={styles.message}>
                          <div className="flex items-center space-x-2">
                            <Spinner size="tiny" />
                            <span>AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.chatInput}>
                    <div className={styles.inputContainer}>
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleUserInput()}
                        placeholder="Describe your design request..."
                        className={styles.input}
                        rows={1}
                        disabled={isLoading}
                      />
                      <Button
                        appearance="primary"
                        icon={<SendRegular />}
                        onClick={handleUserInput}
                        disabled={isLoading || !userInput.trim()}
                        className={styles.sendButton}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="p-4">
                  <div className="space-y-4">
                    {suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="shadow-sm">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <SparkleRegular className="text-blue-600" />
                              <span className="font-medium">{suggestion.title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="small"
                                appearance="subtle"
                                onClick={() => handleApplySuggestion(suggestion)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <div className="p-4 pt-0">
                          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Confidence: {suggestion.confidence}%</span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleSuggestionFeedback(suggestion.id, 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                👍
                              </button>
                              <button
                                onClick={() => handleSuggestionFeedback(suggestion.id, -1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                👎
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {suggestions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <SparkleRegular className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No suggestions yet. Start a conversation to get AI design suggestions!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Saved Sessions</h3>
                      <Button
                        size="small"
                        appearance="primary"
                        onClick={createNewSession}
                      >
                        New Session
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            currentSession?.id === session.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => loadSession(session.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{session.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(session.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="small"
                                appearance="subtle"
                                icon={<FolderOpenRegular />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadSession(session.id);
                                }}
                              />
                              <Button
                                size="small"
                                appearance="subtle"
                                icon={<DeleteRegular />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add delete functionality
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {sessions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FolderOpenRegular className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>No saved sessions yet. Create your first session!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {isChatCollapsed && (
          <div className="flex items-center justify-center h-full">
            <Button
              appearance="subtle"
              size="small"
              icon={<PanelRightExpandRegular />}
              onClick={() => setIsChatCollapsed(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1100,
                minWidth: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(36, 37, 46, 0.95)',
                border: '1px solid #444',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
              title={isChatCollapsed ? 'Open Chat' : 'Close Chat'}
            />
          </div>
        )}
      </div>

      {/* Canvas Container - Full Width */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ height: '100vh' }}>
        {/* Floating Chat Toggle Button - Top Right (Canvas Overlay) */}
        <Button
          appearance="subtle"
          size="small"
          icon={isChatCollapsed ? <PanelRightExpandRegular /> : <PanelRightContractRegular />}
          onClick={() => setIsChatCollapsed((prev) => !prev)}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1100,
            minWidth: '32px',
            height: '32px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'rgba(36, 37, 46, 0.95)',
            border: '1px solid #444',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
          title={isChatCollapsed ? 'Open Chat' : 'Close Chat'}
        />
        {/* Canvas */}
        <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden">
          <Stage
            ref={stageRef}
            width={window.innerWidth - (isChatCollapsed ? 48 : 400)}
            height={window.innerHeight}
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

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast>
          <ToastTitle>{toastMessage}</ToastTitle>
        </Toast>
      )}
    </div>
  );
};

export default AIDesignSuggestionsEnhanced; 