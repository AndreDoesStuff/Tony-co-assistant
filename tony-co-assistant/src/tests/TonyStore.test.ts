import { TonyStore } from '../store/TonyStore';
import { EventBus } from '../events/EventBus';

describe('TonyStore', () => {
  let store: TonyStore;
  let eventBus: EventBus;

  beforeEach(() => {
    store = new TonyStore();
    eventBus = new EventBus();
  });

  test('should initialize with default state', () => {
    const state = store.getState();
    
    expect(state.system.status).toBe('initializing');
    expect(state.system.version).toBe('1.0.0');
    expect(state.memory.nodes.size).toBe(0);
    expect(state.learning.patterns).toEqual([]);
    expect(state.design.patterns).toEqual([]);
    expect(state.ux.interactions).toEqual([]);
    expect(state.school.lessons).toEqual([]);
    expect(state.assets.assets).toEqual([]);
  });

  test('should subscribe to state changes', () => {
    const mockListener = jest.fn();
    const unsubscribe = store.subscribe(mockListener);
    
    // Trigger a state change
    store.updateSystemStatus('ready');
    
    expect(mockListener).toHaveBeenCalled();
    expect(mockListener.mock.calls[0][0].system.status).toBe('ready');
    
    unsubscribe();
  });

  test('should handle system initialization', async () => {
    await store.initialize();
    
    const state = store.getState();
    expect(state.system.status).toBe('ready');
  });

  test('should update user session', () => {
    const initialState = store.getState();
    const initialTime = initialState.user.session.lastActivity;
    
    // Wait a bit to ensure time difference
    setTimeout(() => {
      store.updateUserSession();
      
      const newState = store.getState();
      expect(newState.user.session.lastActivity).toBeGreaterThan(initialTime);
    }, 10);
  });

  test('should update user preferences', () => {
    const newPreferences = { theme: 'dark', language: 'en' };
    store.updateUserPreferences(newPreferences);
    
    const state = store.getState();
    expect(state.user.preferences).toEqual(newPreferences);
  });

  test('should get system health', () => {
    const health = store.getSystemHealth();
    expect(health).toBeDefined();
    expect(health.componentCount).toBe(6);
    expect(health.isInitialized).toBeDefined();
  });

  test('should get component by name', () => {
    const memorySystem = store.getComponent('MemorySystem');
    expect(memorySystem).toBeDefined();
  });

  test('should handle cleanup', async () => {
    await store.initialize();
    await store.cleanup();
    
    const state = store.getState();
    expect(state.system.status).toBe('inactive');
  });
});

describe('Event Bus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  test('should subscribe to events', () => {
    const mockHandler = jest.fn();
    const subscription = eventBus.subscribe('test_event', mockHandler);
    
    expect(subscription.eventType).toBe('test_event');
    expect(subscription.active).toBe(true);
    expect(eventBus.getSubscriptionCount('test_event')).toBe(1);
  });

  test('should unsubscribe from events', () => {
    const mockHandler = jest.fn();
    const subscription = eventBus.subscribe('test_event', mockHandler);
    
    const result = eventBus.unsubscribe(subscription.id);
    
    expect(result).toBe(true);
    expect(eventBus.getSubscriptionCount('test_event')).toBe(0);
  });

  test('should publish events', async () => {
    const mockHandler = jest.fn();
    eventBus.subscribe('test_event', mockHandler);
    
    const testEvent = {
      id: 'test_event_1',
      type: 'test_event',
      source: 'test',
      data: { message: 'Test event' },
      context: {},
      timestamp: Date.now(),
      priority: 'medium' as const
    };
    
    await eventBus.publish(testEvent);
    
    // The handler should be called
    expect(mockHandler).toHaveBeenCalledWith(testEvent);
  });

  test('should maintain event history', async () => {
    const testEvent = {
      id: 'test_event_1',
      type: 'test_event',
      source: 'test',
      data: { message: 'Test event' },
      context: {},
      timestamp: Date.now(),
      priority: 'medium' as const
    };
    
    await eventBus.publish(testEvent);
    
    const history = eventBus.getEventHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(testEvent);
  });

  test('should get system statistics', () => {
    const mockHandler = jest.fn();
    eventBus.subscribe('test_event', mockHandler);
    
    const stats = eventBus.getStats();
    
    expect(stats.totalSubscriptions).toBe(1);
    expect(stats.activeSubscriptions).toBe(1);
    expect(stats.eventTypes).toContain('test_event');
    expect(stats.historySize).toBe(0);
    expect(stats.queueSize).toBe(0);
  });
}); 