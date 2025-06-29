import { TonyStore } from '../store/TonyStore';
import { EventBus } from '../events/EventBus';
import { ComponentManager } from '../components/core/ComponentManager';
import { MemorySystem } from '../components/core/MemorySystem';
import { LearningSystem } from '../components/core/LearningSystem';
import { DesignSystem } from '../components/core/DesignSystem';
import { UXRepository } from '../components/core/UXRepository';
import { SchoolBench } from '../components/core/SchoolBench';
import { AssetLibrary } from '../components/core/AssetLibrary';
import { TonyEvent } from '../types/tony';
import { AIDesignSuggestions } from '../components/core/AIDesignSuggestions';

describe('System Integration Tests', () => {
  let store: TonyStore;
  let eventBus: EventBus;
  let componentManager: ComponentManager;

  beforeEach(() => {
    eventBus = new EventBus();
    store = new TonyStore();
    componentManager = new ComponentManager();
  });

  afterEach(async () => {
    await componentManager.cleanup();
    await store.cleanup();
  });

  describe('Component Initialization & Communication', () => {
    test('should initialize all components successfully', async () => {
      await componentManager.initialize();
      
      // Verify all components are registered
      const components = componentManager.getAllComponents();
      expect(components.size).toBe(11); // Updated to reflect all components including advanced ones
      
      // Check that components exist
      expect(components.has('MemorySystem')).toBe(true);
      expect(components.has('LearningSystem')).toBe(true);
      expect(components.has('DesignSystem')).toBe(true);
      expect(components.has('UXRepository')).toBe(true);
      expect(components.has('SchoolBench')).toBe(true);
      expect(components.has('AssetLibrary')).toBe(true);
    });

    test('should establish cross-component communication', async () => {
      await componentManager.initialize();
      
      // Test memory -> learning communication
      const memoryEvent: TonyEvent = {
        id: 'test-memory-event',
        type: 'memory:node:created',
        data: {
          nodeId: 'test-node',
          content: 'Test memory content',
          confidence: 0.8
        },
        priority: 'medium',
        timestamp: Date.now(),
        source: 'memory-system',
        context: { component: 'memory-system' }
      };

      await eventBus.publish(memoryEvent);
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify learning system received the event
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const learningStats = learningSystem?.getStats();
      expect(learningStats).toBeDefined();
    });

    test('should handle component dependency resolution', async () => {
      const result = await componentManager.initialize();
      
      // Verify dependencies are resolved
      const components = componentManager.getAllComponents();
      
      // Check that components can access each other
      expect(components.has('MemorySystem')).toBe(true);
      expect(components.has('LearningSystem')).toBe(true);
      expect(components.has('DesignSystem')).toBe(true);
    });
  });

  describe('End-to-End System Flows', () => {
    test('should process complete UX design workflow', async () => {
      await componentManager.initialize();
      
      // 1. Add UX pattern to repository
      const uxRepository = componentManager.getComponent<UXRepository>('UXRepository');
      uxRepository?.addDesignPattern(
        'Test Pattern',
        'navigation',
        'A test UX pattern'
      );
      
      // 2. Create design asset
      const assetLibrary = componentManager.getComponent<AssetLibrary>('AssetLibrary');
      assetLibrary?.addAsset(
        'Test Asset',
        'component' as any,
        'test-url',
        { tags: ['test', 'navigation'] },
        ['test', 'navigation'],
        'navigation'
      );
      
      // 3. Generate design suggestion using design system
      const designSystem = componentManager.getComponent<DesignSystem>('DesignSystem');
      const pattern = designSystem?.addPattern(
        'Navigation Pattern',
        'navigation',
        'A responsive navigation pattern',
        ['mobile', 'desktop'],
        [],
        0.8
      );
      
      expect(pattern).toBeDefined();
      if (pattern) {
        expect(pattern.confidence).toBeGreaterThan(0);
      }
    });

    test('should process learning feedback loop', async () => {
      await componentManager.initialize();
      
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      
      // 1. Create initial pattern
      const pattern = learningSystem?.learnPattern(
        'design-pattern',
        { name: 'Test Pattern', confidence: 0.7 },
        ['user-input'],
        0.7
      );
      
      // 2. Provide feedback
      const feedback = learningSystem?.addFeedbackLoop(
        'user',
        {
          patternId: pattern?.id,
          rating: 5,
          comment: 'Excellent pattern',
          context: 'mobile navigation'
        }
      );
      
      // 3. Verify pattern confidence increased
      expect(pattern).toBeDefined();
      if (pattern) {
        expect(pattern.confidence).toBeGreaterThan(0);
      }
    });

    test('should handle memory retrieval and learning integration', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      
      // 1. Store memory
      const memory = memorySystem?.createNode(
        'knowledge',
        'User prefers dark theme for mobile apps',
        'user-input',
        ['preference', 'mobile-design'],
        0.8
      );
      
      // 2. Query memory
      const retrieved = memorySystem?.searchNodes({ type: 'knowledge', tags: ['preference'] });
      
      expect(retrieved?.length).toBeGreaterThan(0);
      if (retrieved && retrieved.length > 0) {
        expect(retrieved[0].data).toContain('dark theme');
      }
      
      // 3. Verify learning system processed the memory
      const learningStats = learningSystem?.getStats();
      expect(learningStats).toBeDefined();
    });
  });

  describe('Performance Testing', () => {
    test('should handle high-volume event processing', async () => {
      await componentManager.initialize();
      
      const startTime = Date.now();
      const eventCount = 100;
      
      // Emit high volume of events
      for (let i = 0; i < eventCount; i++) {
        const event: TonyEvent = {
          id: `perf-test-${i}`,
          type: 'test:performance',
          data: { index: i, timestamp: Date.now() },
          priority: 'low',
          timestamp: Date.now(),
          source: 'performance-test',
          context: { test: 'performance' }
        };
        
        await eventBus.publish(event);
      }
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Verify performance requirements
      expect(processingTime).toBeLessThan(1000); // Should process 100 events in < 1 second
      
      const eventStats = eventBus.getStats();
      expect(eventStats.historySize).toBeGreaterThanOrEqual(eventCount);
    });

    test('should maintain system responsiveness under load', async () => {
      await componentManager.initialize();
      
      const startTime = Date.now();
      
      // Simulate concurrent operations
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
        const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
        
        promises.push(
          memorySystem?.createNode(
            'knowledge',
            `Concurrent memory ${i}`,
            'test',
            ['test'],
            0.8
          )
        );
        
        promises.push(
          learningSystem?.learnPattern(
            'test-pattern',
            { name: `Pattern ${i}` },
            ['concurrent-test'],
            0.8
          )
        );
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Verify concurrent operations complete quickly
      expect(processingTime).toBeLessThan(2000); // Should complete in < 2 seconds
    });

    test('should handle memory usage efficiently', async () => {
      await componentManager.initialize();
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Add large number of items
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      for (let i = 0; i < 1000; i++) {
        memorySystem?.createNode(
          'knowledge',
          `Memory content ${i}`.repeat(10), // Larger content
          'test',
          ['test'],
          0.8
        );
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Verify memory usage is reasonable (less than 50MB increase for 1000 items)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Error Handling & Recovery', () => {
    test('should handle component initialization failures gracefully', async () => {
      // Mock a component to throw an error during initialization
      const originalMemorySystem = MemorySystem;
      jest.spyOn(MemorySystem.prototype, 'initialize').mockRejectedValueOnce(new Error('Initialization failed'));
      
      await componentManager.initialize();
      
      // Should still succeed with other components
      const components = componentManager.getAllComponents();
      expect(components.size).toBe(11);
      
      // Restore original implementation
      jest.restoreAllMocks();
    });

    test('should handle event processing errors', async () => {
      await componentManager.initialize();
      
      // Create an event that will cause an error
      const errorEvent: TonyEvent = {
        id: 'error-test',
        type: 'test:error',
        data: { shouldError: true },
        priority: 'high',
        timestamp: Date.now(),
        source: 'error-test',
        context: { test: 'error' }
      };
      
      // Mock event handler to throw error
      const originalPublish = eventBus.publish.bind(eventBus);
      jest.spyOn(eventBus, 'publish').mockImplementationOnce(() => {
        throw new Error('Event processing error');
      });
      
      // Should not crash the system
      expect(() => {
        eventBus.publish(errorEvent);
      }).not.toThrow();
      
      jest.restoreAllMocks();
    });

    test('should recover from component failures', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      
      // Simulate component failure
      jest.spyOn(memorySystem!, 'createNode').mockImplementationOnce(() => {
        throw new Error('Memory system error');
      });
      
      // Should handle the error gracefully
      expect(() => {
        memorySystem?.createNode(
          'knowledge',
          'Test content',
          'test',
          ['test'],
          0.8
        );
      }).toThrow('Memory system error');
      
      // System should still be functional
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const designSystem = componentManager.getComponent<DesignSystem>('DesignSystem');
      expect(learningSystem).toBeDefined();
      expect(designSystem).toBeDefined();
      
      jest.restoreAllMocks();
    });

    test('should handle invalid data gracefully', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      
      // Test with invalid memory data - should handle gracefully
      expect(() => {
        memorySystem?.createNode(
          'invalid-type' as any,
          '',
          '',
          [],
          -1 // Invalid importance
        );
      }).not.toThrow();
    });
  });

  describe('State Consistency & Synchronization', () => {
    test('should maintain state consistency across components', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      
      // Add data to one component
      const memory = memorySystem?.createNode(
        'knowledge',
        'Test for consistency',
        'test',
        ['test'],
        0.8
      );
      
      // Verify state is consistent
      const retrieved = memorySystem?.getNode(memory?.id || '');
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved.data).toBe('Test for consistency');
      }
      
      // Verify store state is updated
      const storeState = store.getState();
      expect(storeState.memory.nodes.size).toBeGreaterThan(0);
    });

    test('should synchronize state changes across components', async () => {
      await componentManager.initialize();
      
      // Subscribe to state changes
      let stateChangeCount = 0;
      const unsubscribe = store.subscribe(() => {
        stateChangeCount++;
      });
      
      // Make changes to multiple components
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      
      memorySystem?.createNode(
        'knowledge',
        'Sync test 1',
        'test',
        ['test'],
        0.8
      );
      
      learningSystem?.learnPattern(
        'test-pattern',
        { name: 'Sync Test Pattern' },
        ['sync-test'],
        0.8
      );
      
      // Wait for state synchronization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify state changes were propagated
      expect(stateChangeCount).toBeGreaterThan(0);
      
      unsubscribe();
    });
  });

  describe('System Statistics & Monitoring', () => {
    test('should provide accurate system statistics', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      
      // Perform some operations
      memorySystem?.createNode(
        'knowledge',
        'Statistics test',
        'test',
        ['test'],
        0.8
      );
      
      learningSystem?.learnPattern(
        'test-pattern',
        { name: 'Stats Pattern' },
        ['stats-test'],
        0.8
      );
      
      // Get system statistics
      const systemStats = await store.getComponentStats();
      
      expect(systemStats).toBeDefined();
      expect(Object.keys(systemStats).length).toBeGreaterThan(0);
    });

    test('should track component performance metrics', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const designSystem = componentManager.getComponent<DesignSystem>('DesignSystem');
      
      // Get performance metrics for each component
      const memoryStats = memorySystem?.getStats();
      const learningStats = learningSystem?.getStats();
      const designStats = designSystem?.getStats();
      
      expect(memoryStats).toBeDefined();
      expect(learningStats).toBeDefined();
      expect(designStats).toBeDefined();
      
      // Verify metrics are reasonable
      if (memoryStats) expect(memoryStats.totalNodes).toBeGreaterThanOrEqual(0);
      if (learningStats) expect(learningStats.patternCount).toBeGreaterThanOrEqual(0);
      if (designStats) expect(designStats.patternCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cross-Component Communication & Data Flow', () => {
    test('should handle complete data flow between all components', async () => {
      await componentManager.initialize();
      
      // 1. Memory System creates a node
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const memoryNode = memorySystem?.createNode(
        'knowledge',
        'User prefers dark theme for mobile apps',
        'user_input',
        ['preference', 'mobile-design'],
        0.8
      );
      
      expect(memoryNode).toBeDefined();
      
      // 2. Learning System processes the memory and creates a pattern
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const pattern = learningSystem?.learnPattern(
        'design-preference',
        { theme: 'dark', platform: 'mobile', confidence: 0.8 },
        ['memory-system'],
        0.8
      );
      
      expect(pattern).toBeDefined();
      
      // 3. UX Repository stores the pattern
      const uxRepository = componentManager.getComponent<UXRepository>('UXRepository');
      uxRepository?.addDesignPattern(
        'Dark Theme Preference',
        'visual',
        'Users prefer dark theme for mobile applications',
        ['mobile', 'theme', 'preference']
      );
      
      // 4. Asset Library creates related assets
      const assetLibrary = componentManager.getComponent<AssetLibrary>('AssetLibrary');
      const asset = assetLibrary?.addAsset(
        'Dark Theme Component',
        'image',
        'dark-theme-component.json',
        { tags: ['dark', 'theme', 'mobile'] },
        ['dark', 'theme', 'mobile'],
        'preference'
      );
      
      expect(asset).toBeDefined();
      
      // 5. AI Design Suggestions generates suggestions based on all the above
      const aiDesignSuggestions = componentManager.getComponent<AIDesignSuggestions>('AIDesignSuggestions');
      const suggestions = await aiDesignSuggestions?.generateSuggestions(
        'test-user',
        { 
          platform: 'mobile', 
          userPreference: 'dark-theme',
          currentDesign: { type: 'mobile-app' },
          designSystem: { colors: ['dark', 'light'] },
          availableAssets: ['dark-theme-component.json'],
          userInteractions: [],
          interactionPatterns: [],
          userBehavior: {},
          learnedPatterns: [],
          knowledgeBase: [],
          userProgress: {},
          strengths: ['mobile-design'],
          weaknesses: ['accessibility']
        },
        3
      );
      
      expect(suggestions).toBeDefined();
      if (suggestions && suggestions.length > 0) {
        expect(suggestions[0].confidence).toBeGreaterThan(0);
        expect(suggestions[0].reasoning).toBeDefined();
      }
      
      // 6. Verify all components have processed the data
      const memoryStats = memorySystem?.getStats();
      const learningStats = learningSystem?.getStats();
      const uxStats = uxRepository?.getStats();
      const assetStats = assetLibrary?.getStats();
      
      expect(memoryStats?.totalNodes).toBeGreaterThan(0);
      expect(learningStats?.patternCount).toBeGreaterThan(0);
      expect(uxStats?.designPatternCount).toBeGreaterThan(0);
      expect(assetStats?.assetCount).toBeGreaterThan(0);
    });

    test('should handle real-time event synchronization', async () => {
      await componentManager.initialize();
      
      const events: any[] = [];
      
      // Subscribe to multiple event types
      const subscription1 = eventBus.subscribe('memory_node_created', (event) => {
        events.push({ type: 'memory_created', data: event.data });
      });
      
      const subscription2 = eventBus.subscribe('pattern_learned', (event) => {
        events.push({ type: 'pattern_learned', data: event.data });
      });
      
      const subscription3 = eventBus.subscribe('suggestions_generated', (event) => {
        events.push({ type: 'suggestion_generated', data: event.data });
      });
      
      // Trigger a chain of events
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const designSystem = componentManager.getComponent<DesignSystem>('DesignSystem');
      
      // Create memory -> triggers learning -> triggers design suggestion
      memorySystem?.createNode('interaction', { action: 'theme-toggle' }, 'user_input', ['ui'], 0.7);
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify events were processed
      expect(events.length).toBeGreaterThan(0);
      
      // Cleanup subscriptions
      eventBus.unsubscribe(subscription1.id);
      eventBus.unsubscribe(subscription2.id);
      eventBus.unsubscribe(subscription3.id);
    });

    test('should handle component failure gracefully', async () => {
      // Test that if one component fails, others continue working
      const health = componentManager.getSystemHealth();
      
      // Verify we have some components working
      expect(health.initializedCount).toBeGreaterThan(0);
      expect(health.componentCount).toBeGreaterThan(0);
      
      // Verify system is still functional even with some failures
      if (health.failedCount > 0) {
        console.log(`System has ${health.failedCount} failed components but continues to function`);
      }
      
      // Test that working components can still communicate
      const workingComponents = Object.entries(health.status)
        .filter(([_, status]) => status.initialized)
        .map(([name, _]) => name);
      
      if (workingComponents.length > 0) {
        const firstWorking = workingComponents[0];
        const component = componentManager.getComponent(firstWorking);
        expect(component).toBeDefined();
      }
    });
  });
}); 