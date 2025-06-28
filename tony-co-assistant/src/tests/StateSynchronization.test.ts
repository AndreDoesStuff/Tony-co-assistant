import { TonyStore } from '../store/TonyStore';
import { eventBus } from '../events/EventBus';
import { componentManager } from '../components/core/ComponentManager';
import { MemorySystem } from '../components/core/MemorySystem';
import { LearningSystem } from '../components/core/LearningSystem';

describe('State Synchronization - Step 2.3', () => {
  let store: TonyStore;

  beforeEach(async () => {
    store = new TonyStore();
    await store.initialize();
  });

  afterEach(async () => {
    await store.cleanup();
  });

  describe('Real-time State Updates', () => {
    test('should update state with validation', async () => {
      const updates = {
        user: {
          id: 'test-user',
          preferences: { theme: 'dark' },
          session: {
            startTime: Date.now(),
            lastActivity: Date.now()
          }
        }
      };

      const success = await store.updateState(updates, 'test');
      expect(success).toBe(true);

      const state = store.getState();
      expect(state.user.preferences.theme).toBe('dark');
    });

    test('should reject invalid state updates', async () => {
      const invalidUpdates = {
        invalidKey: { someData: 'test' }
      } as any;

      const success = await store.updateState(invalidUpdates, 'test');
      expect(success).toBe(false);
    });

    test('should handle concurrent updates', async () => {
      const update1 = { 
        user: { 
          id: 'test-user',
          preferences: { theme: 'dark' },
          session: { startTime: Date.now(), lastActivity: Date.now() }
        } 
      };
      const update2 = { 
        user: { 
          id: 'test-user',
          preferences: { language: 'en' },
          session: { startTime: Date.now(), lastActivity: Date.now() }
        } 
      };

      const promises = [
        store.updateState(update1, 'test1'),
        store.updateState(update2, 'test2')
      ];

      const results = await Promise.all(promises);
      expect(results.every(r => r === true)).toBe(true);

      const state = store.getState();
      expect(state.user.preferences.theme).toBe('dark');
      expect(state.user.preferences.language).toBe('en');
    });

    test('should emit state update events', async () => {
      let eventReceived = false;
      let eventData: any = null;

      const subscription = eventBus.subscribe('state_updated', (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      const updates = { 
        user: { 
          id: 'test-user',
          preferences: { test: true },
          session: { startTime: Date.now(), lastActivity: Date.now() }
        } 
      };
      await store.updateState(updates, 'test');

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventReceived).toBe(true);
      expect(eventData.source).toBe('test');
      expect(eventData.changes).toContain('user');

      eventBus.unsubscribe(subscription.id);
    });
  });

  describe('State Consistency Checks', () => {
    test('should detect component status inconsistencies', async () => {
      // Mock component manager to return inconsistent status
      const originalGetSystemHealth = componentManager.getSystemHealth;
      componentManager.getSystemHealth = jest.fn().mockReturnValue({
        status: { MemorySystem: false, LearningSystem: true },
        uptime: 1000,
        memoryUsage: 50
      });

      const result = await store.checkStateConsistency();

      expect(result.isValid).toBe(false);
      expect(result.inconsistencies.length).toBeGreaterThan(0);
      expect(result.inconsistencies.some(i => i.includes('Component status mismatch'))).toBe(true);

      // Restore original method
      componentManager.getSystemHealth = originalGetSystemHealth;
    });

    test('should detect memory inconsistencies', async () => {
      // Manually create inconsistency
      const state = store.getState();
      state.memory.nodes.set('test-node', {
        id: 'test-node',
        type: 'knowledge',
        data: 'test',
        connections: [],
        metadata: {
          source: 'test',
          confidence: 0.8,
          lastUpdated: Date.now(),
          tags: ['test'],
          importance: 0.5,
          accessCount: 1
        },
        createdAt: Date.now(),
        lastUpdated: Date.now()
      });

      const result = await store.checkStateConsistency();

      expect(result.inconsistencies.some(i => i.includes('Memory node count mismatch'))).toBe(true);
    });

    test('should emit consistency check events', async () => {
      let eventReceived = false;
      let eventData: any = null;

      const subscription = eventBus.subscribe('state_consistency_check', (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      await store.checkStateConsistency();

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventReceived).toBe(true);
      expect(eventData).toHaveProperty('isValid');
      expect(eventData).toHaveProperty('errors');
      expect(eventData).toHaveProperty('warnings');
      expect(eventData).toHaveProperty('inconsistencies');

      eventBus.unsubscribe(subscription.id);
    });
  });

  describe('State Recovery', () => {
    test('should recover from backup', async () => {
      // Create some state changes
      await store.updateState({ 
        user: { 
          id: 'test-user',
          preferences: { test: 'backup' },
          session: { startTime: Date.now(), lastActivity: Date.now() }
        } 
      }, 'test');

      // Simulate state corruption
      const state = store.getState();
      (state as any).system = null; // Corrupt the state

      const result = await store.recoverState();

      expect(result.success).toBe(true);
      expect(result.backupUsed).toBe(true);
      expect(result.dataLoss).toBe(false);

      // Verify state is recovered
      const recoveredState = store.getState();
      expect(recoveredState.system).toBeDefined();
      expect(recoveredState.user.preferences.test).toBe('backup');
    });

    test('should recover from components when backup unavailable', async () => {
      // Clear backup
      (store as any).stateBackup = null;

      // Add some data to components
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      if (memorySystem) {
        memorySystem.createNode('knowledge', 'test recovery', 'test', ['test'], 0.8);
      }

      const result = await store.recoverState();

      expect(result.success).toBe(true);
      expect(result.backupUsed).toBe(false);
      expect(result.recoveredComponents.length).toBeGreaterThan(0);
    });

    test('should handle recovery failures gracefully', async () => {
      // Mock component to throw error
      const originalGetAllComponents = componentManager.getAllComponents;
      componentManager.getAllComponents = jest.fn().mockReturnValue(new Map([
        ['TestComponent', { getState: () => { throw new Error('Component error'); } }]
      ]));

      const result = await store.recoverState();

      expect(result.success).toBe(false);
      expect(result.failedComponents).toContain('TestComponent');

      // Restore original method
      componentManager.getAllComponents = originalGetAllComponents;
    });

    test('should emit recovery events', async () => {
      let eventReceived = false;
      let eventData: any = null;

      const subscription = eventBus.subscribe('state_recovered', (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      await store.recoverState();

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventReceived).toBe(true);
      expect(eventData).toHaveProperty('success');
      expect(eventData).toHaveProperty('backupUsed');
      expect(eventData).toHaveProperty('dataLoss');

      eventBus.unsubscribe(subscription.id);
    });
  });

  describe('State Validation', () => {
    test('should validate state structure', async () => {
      const result = await store.validateState();

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should detect missing required properties', async () => {
      // Corrupt state by removing required property
      const state = store.getState();
      delete (state as any).system;

      const result = await store.validateState();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing required property: system'))).toBe(true);
    });

    test('should detect invalid system status', async () => {
      const state = store.getState();
      (state as any).system.status = 'invalid_status';

      const result = await store.validateState();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid system status'))).toBe(true);
    });

    test('should detect circular references', async () => {
      const state = store.getState();
      // Create circular reference
      (state as any).circular = state;

      const result = await store.validateState();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Circular reference'))).toBe(true);
    });

    test('should warn about large state size', async () => {
      // Create large state
      const state = store.getState();
      const largeData = 'x'.repeat(1000000); // 1MB of data
      (state as any).largeData = largeData;

      const result = await store.validateState();

      expect(result.warnings.some(w => w.includes('State size'))).toBe(true);
      expect(result.recommendations.some(r => r.includes('optimization'))).toBe(true);
    });
  });

  describe('State Optimization', () => {
    test('should remove expired short-term memory', async () => {
      const state = store.getState();
      
      // Add old short-term memory
      const oldNode = {
        id: 'old-node',
        type: 'knowledge' as const,
        data: 'old data',
        connections: [],
        metadata: {
          source: 'test',
          confidence: 0.8,
          lastUpdated: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
          tags: ['test'],
          importance: 0.5,
          accessCount: 1
        },
        createdAt: Date.now() - 25 * 60 * 60 * 1000,
        lastUpdated: Date.now() - 25 * 60 * 60 * 1000
      };

      state.memory.shortTerm.push(oldNode);

      await store.optimizeState();

      const optimizedState = store.getState();
      expect(optimizedState.memory.shortTerm.find(n => n.id === 'old-node')).toBeUndefined();
    });

    test('should remove low-confidence patterns', async () => {
      const state = store.getState();
      
      // Add low-confidence pattern
      state.learning.patterns.push({
        id: 'low-confidence',
        type: 'test',
        data: {},
        confidence: 0.05, // Below threshold
        occurrences: 1,
        lastSeen: Date.now(),
        sources: ['test'],
        features: [],
        similarity: [],
        prediction: { confidence: 0.5, timeframe: 1000, factors: [] },
        validation: { accuracy: 0.5, precision: 0.5, recall: 0.5, f1Score: 0.5, testCases: 1 }
      });

      await store.optimizeState();

      const optimizedState = store.getState();
      expect(optimizedState.learning.patterns.find(p => p.id === 'low-confidence')).toBeUndefined();
    });

    test('should emit optimization events', async () => {
      let eventReceived = false;
      let eventData: any = null;

      const subscription = eventBus.subscribe('state_optimized', (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      await store.optimizeState();

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventReceived).toBe(true);
      expect(eventData).toHaveProperty('timestamp');
      expect(eventData).toHaveProperty('shortTermCount');
      expect(eventData).toHaveProperty('patternsCount');
      expect(eventData).toHaveProperty('interactionsCount');

      eventBus.unsubscribe(subscription.id);
    });
  });

  describe('State Synchronization Statistics', () => {
    test('should provide synchronization statistics', () => {
      const stats = store.getStateSyncStats();

      expect(stats).toHaveProperty('version');
      expect(stats).toHaveProperty('lastBackup');
      expect(stats).toHaveProperty('lastValidation');
      expect(stats).toHaveProperty('pendingUpdates');
      expect(stats).toHaveProperty('syncInProgress');
      expect(stats).toHaveProperty('config');
    });

    test('should update configuration', () => {
      const newConfig = {
        consistencyCheckInterval: 10000,
        validationEnabled: false
      };

      store.updateSyncConfig(newConfig);
      const stats = store.getStateSyncStats();

      expect(stats.config.consistencyCheckInterval).toBe(10000);
      expect(stats.config.validationEnabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle component errors gracefully', async () => {
      let eventReceived = false;
      let eventData: any = null;

      const subscription = eventBus.subscribe('component_error', (event) => {
        eventReceived = true;
        eventData = event.data;
      });

      // Emit component error
      await eventBus.publishSimple(
        'component_error',
        'TestComponent',
        { component: 'TestComponent', error: 'Test error' },
        { component: 'TestComponent' }
      );

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventReceived).toBe(true);
      expect(eventData.component).toBe('TestComponent');
      expect(eventData.error).toBe('Test error');

      eventBus.unsubscribe(subscription.id);
    });

    test('should handle state update failures', async () => {
      // Mock updateState to throw error
      const originalUpdateState = store.updateState.bind(store);
      store.updateState = jest.fn().mockRejectedValue(new Error('Update failed'));

      const success = await store.updateState({ 
        user: { 
          id: 'test-user',
          preferences: {},
          session: { startTime: Date.now(), lastActivity: Date.now() }
        } 
      }, 'test');
      expect(success).toBe(false);

      // Restore original method
      store.updateState = originalUpdateState;
    });
  });

  describe('Performance Tests', () => {
    test('should handle large state updates efficiently', async () => {
      const largeUpdate = {
        memory: {
          nodes: new Map(),
          connections: new Map(),
          shortTerm: Array.from({ length: 1000 }, (_, i) => ({
            id: `node-${i}`,
            type: 'knowledge' as const,
            data: `data-${i}`,
            connections: [],
            metadata: {
              source: 'test',
              confidence: 0.8,
              lastUpdated: Date.now(),
              tags: ['test'],
              importance: 0.5,
              accessCount: 1
            },
            createdAt: Date.now(),
            lastUpdated: Date.now()
          })),
          longTerm: [],
          lastIndexed: Date.now()
        }
      };

      const startTime = Date.now();
      const success = await store.updateState(largeUpdate, 'performance-test');
      const endTime = Date.now();

      expect(success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should maintain performance during concurrent operations', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => 
        store.updateState({ 
          user: { 
            id: 'test-user',
            preferences: { [`key-${i}`]: i },
            session: { startTime: Date.now(), lastActivity: Date.now() }
          } 
        }, `concurrent-${i}`)
      );

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();

      expect(results.every(r => r === true)).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
}); 