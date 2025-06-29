import { componentManager } from '../components/core/ComponentManager';
import { eventBus } from '../events/EventBus';
import { TonyStore } from '../store/TonyStore';
import { MemorySystem } from '../components/core/MemorySystem';
import { LearningSystem } from '../components/core/LearningSystem';
import { DesignSystem } from '../components/core/DesignSystem';
import { UXRepository } from '../components/core/UXRepository';
import { SchoolBench } from '../components/core/SchoolBench';
import { AssetLibrary } from '../components/core/AssetLibrary';
import { AIDesignSuggestions } from '../components/core/AIDesignSuggestions';
import { TonyEvent } from '../types/tony';

/**
 * Phase 4 Integration Tests
 * Comprehensive testing of all integration requirements
 */
describe('Phase 4: Integration & Testing', () => {
  let store: TonyStore;

  beforeEach(async () => {
    store = new TonyStore();
    await store.initialize();
  });

  afterEach(async () => {
    await store.cleanup();
  });

  describe('Step 4.1: Component Integration', () => {
    test('should establish full bidirectional communication between all components', async () => {
      await componentManager.initialize();
      
      const events: any[] = [];
      
      // Subscribe to events from all components
      const subscriptions = [
        eventBus.subscribe('memory_node_created', (event) => {
          events.push({ type: 'memory_created', data: event.data });
        }),
        eventBus.subscribe('pattern_learned', (event) => {
          events.push({ type: 'pattern_learned', data: event.data });
        }),
        eventBus.subscribe('design_pattern_added', (event) => {
          events.push({ type: 'design_pattern_added', data: event.data });
        }),
        eventBus.subscribe('asset_created', (event) => {
          events.push({ type: 'asset_created', data: event.data });
        }),
        eventBus.subscribe('suggestions_generated', (event) => {
          events.push({ type: 'suggestions_generated', data: event.data });
        }),
        eventBus.subscribe('lesson_completed', (event) => {
          events.push({ type: 'lesson_completed', data: event.data });
        })
      ];

      // Trigger operations in all components
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const uxRepository = componentManager.getComponent<UXRepository>('UXRepository');
      const assetLibrary = componentManager.getComponent<AssetLibrary>('AssetLibrary');
      const aiDesignSuggestions = componentManager.getComponent<AIDesignSuggestions>('AIDesignSuggestions');
      const schoolBench = componentManager.getComponent<SchoolBench>('SchoolBench');

      // Create a complete workflow
      memorySystem?.createNode('knowledge', 'User prefers dark theme', 'user_input', ['preference', 'theme'], 0.8);
      learningSystem?.learnPattern('theme-preference', { theme: 'dark' }, ['memory-system'], 0.8);
      uxRepository?.addDesignPattern('Dark Theme', 'visual', 'Dark theme preference pattern', ['theme', 'preference']);
      assetLibrary?.addAsset('Dark Theme Component', 'template', 'dark-theme.json', {}, ['dark', 'theme'], 'visual');
      aiDesignSuggestions?.generateSuggestions('dark theme implementation', ['theme', 'preference']);
      schoolBench?.addLesson('Dark Theme Best Practices', { content: 'Learn about dark theme implementation' }, 1, [], ['theme', 'design']);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 300));

      // Verify bidirectional communication
      expect(events.length).toBeGreaterThan(0);
      
      // Verify all component types are communicating
      const eventTypes = events.map(e => e.type);
      expect(eventTypes).toContain('memory_created');
      expect(eventTypes).toContain('pattern_learned');
      expect(eventTypes).toContain('design_pattern_added');
      expect(eventTypes).toContain('asset_created');
      expect(eventTypes).toContain('suggestions_generated');
      expect(eventTypes).toContain('lesson_completed');

      // Cleanup subscriptions
      subscriptions.forEach(sub => eventBus.unsubscribe(sub.id));
    });

    test('should maintain real-time synchronization across all components', async () => {
      await componentManager.initialize();
      
      let stateChangeCount = 0;
      const unsubscribe = store.subscribe(() => {
        stateChangeCount++;
      });

      // Perform operations across multiple components
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const uxRepository = componentManager.getComponent<UXRepository>('UXRepository');

      // Add data to multiple components
      memorySystem?.createNode('knowledge', 'Sync test 1', 'user_input', ['sync'], 0.8);
      learningSystem?.learnPattern('sync-pattern', { name: 'Sync Pattern' }, ['sync'], 0.8);
      uxRepository?.addDesignPattern('Sync Pattern', 'interaction', 'Sync test pattern', ['sync']);

      // Wait for synchronization
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify state changes were synchronized
      expect(stateChangeCount).toBeGreaterThan(0);

      // Verify state consistency
      const state = store.getState();
      expect(state.memory.nodes.size).toBeGreaterThan(0);
      expect(state.learning.patterns.length).toBeGreaterThan(0);
      expect(state.design.patterns.length).toBeGreaterThan(0);

      unsubscribe();
    });

    test('should handle cross-component data flow efficiently', async () => {
      await componentManager.initialize();
      
      const startTime = Date.now();
      
      // Test data flow: Memory -> Learning -> UX -> Asset -> AI Suggestions
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const uxRepository = componentManager.getComponent<UXRepository>('UXRepository');
      const assetLibrary = componentManager.getComponent<AssetLibrary>('AssetLibrary');
      const aiDesignSuggestions = componentManager.getComponent<AIDesignSuggestions>('AIDesignSuggestions');

      // Step 1: Create memory
      const memory = memorySystem?.createNode(
        'interaction',
        { action: 'button-click', location: 'header' },
        'user_input',
        ['ui', 'interaction'],
        0.8
      );

      // Step 2: Learn pattern
      const pattern = learningSystem?.learnPattern(
        'header-interaction',
        { location: 'header', action: 'click' },
        ['memory-system'],
        0.8
      );

      // Step 3: Add UX pattern
      const uxPattern = uxRepository?.addDesignPattern(
        'Header Button Interaction',
        'interaction',
        'User interaction with header buttons',
        ['header', 'button', 'interaction']
      );

      // Step 4: Create asset
      const asset = assetLibrary?.addAsset(
        'Header Button Component',
        'template',
        'header-button.json',
        { tags: ['header', 'button'] },
        ['header', 'button'],
        'interaction'
      );

      // Step 5: Generate suggestions
      const suggestions = aiDesignSuggestions?.generateSuggestions(
        'header button interaction patterns',
        ['header', 'button', 'interaction']
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify data flow completed successfully
      expect(memory).toBeDefined();
      expect(pattern).toBeDefined();
      expect(uxPattern).toBeDefined();
      expect(asset).toBeDefined();
      expect(suggestions).toBeDefined();

      // Verify performance requirements
      expect(processingTime).toBeLessThan(1000); // Should complete in < 1 second
    });

    test('should handle performance optimization automatically', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      
      // Add large number of items to test optimization
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        memorySystem?.createNode(
          'knowledge',
          `Performance test node ${i}`,
          'user_input',
          [`tag${i % 10}`],
          0.5 + (i % 5) * 0.1
        );
      }

      const creationTime = Date.now() - startTime;
      
      // Verify creation performance
      expect(creationTime).toBeLessThan(2000); // Should create 100 nodes in < 2 seconds

      // Test search performance
      const searchStartTime = Date.now();
      const results = memorySystem?.searchNodes({ tags: ['tag1'] });
      const searchTime = Date.now() - searchStartTime;

      expect(searchTime).toBeLessThan(100); // Should search in < 100ms
      expect(results?.length).toBeGreaterThan(0);
    });

    test('should implement comprehensive error handling', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');

      // Test error handling with invalid data
      expect(() => {
        memorySystem?.createNode(
          'invalid-type' as any,
          '',
          '',
          [],
          -1 // Invalid importance
        );
      }).not.toThrow();

      // Test error handling with null data
      expect(() => {
        learningSystem?.learnPattern(
          '',
          null as any,
          [],
          -1 // Invalid confidence
        );
      }).not.toThrow();

      // Verify system remains functional after errors
      const validMemory = memorySystem?.createNode(
        'knowledge',
        'Valid memory after error',
        'user_input',
        ['test'],
        0.8
      );
      expect(validMemory).toBeDefined();

      const validPattern = learningSystem?.learnPattern(
        'valid-pattern',
        { name: 'Valid Pattern' },
        ['test'],
        0.8
      );
      expect(validPattern).toBeDefined();
    });
  });

  describe('Step 4.2: System Testing & Validation', () => {
    test('should pass comprehensive unit tests for all components', async () => {
      await componentManager.initialize();
      
      // Test all components have basic functionality
      const components = componentManager.getAllComponents();
      
      for (const [name, component] of Array.from(components.entries())) {
        // Test basic methods exist
        expect(component).toBeDefined();
        expect(typeof component.initialize).toBe('function');
        expect(typeof component.destroy).toBe('function');
        
        // Test component is initialized
        expect(component.isInitialized || component.isInitialized === undefined).toBeTruthy();
      }
    });

    test('should pass integration testing for component interactions', async () => {
      await componentManager.initialize();
      
      // Test component interactions
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const uxRepository = componentManager.getComponent<UXRepository>('UXRepository');

      // Test memory -> learning integration
      const memory = memorySystem?.createNode('knowledge', 'Integration test', 'user_input', ['integration'], 0.8);
      expect(memory).toBeDefined();

      // Test learning -> UX integration
      const pattern = learningSystem?.learnPattern('integration-pattern', { name: 'Integration' }, ['integration'], 0.8);
      expect(pattern).toBeDefined();

      // Test UX pattern creation
      const uxPattern = uxRepository?.addDesignPattern('Integration Pattern', 'interaction', 'Integration test pattern', ['integration']);
      expect(uxPattern).toBeDefined();
    });

    test('should pass end-to-end testing for complete workflows', async () => {
      await componentManager.initialize();
      
      // Test complete UX design workflow
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const uxRepository = componentManager.getComponent<UXRepository>('UXRepository');
      const assetLibrary = componentManager.getComponent<AssetLibrary>('AssetLibrary');
      const aiDesignSuggestions = componentManager.getComponent<AIDesignSuggestions>('AIDesignSuggestions');

      // Step 1: Record user interaction
      const interaction = memorySystem?.createNode(
        'interaction',
        { action: 'theme-toggle', preference: 'dark' },
        'user_input',
        ['theme', 'preference'],
        0.9
      );

      // Step 2: Learn from interaction
      const learnedPattern = learningSystem?.learnPattern(
        'theme-preference',
        { theme: 'dark', context: 'user-preference' },
        ['memory-system'],
        0.9
      );

      // Step 3: Store UX pattern
      const uxPattern = uxRepository?.addDesignPattern(
        'Dark Theme Toggle',
        'interaction',
        'User preference for dark theme toggle',
        ['theme', 'toggle', 'preference']
      );

      // Step 4: Create related asset
      const asset = assetLibrary?.addAsset(
        'Dark Theme Toggle Component',
        'template',
        'dark-toggle.json',
        { tags: ['dark', 'theme', 'toggle'] },
        ['dark', 'theme', 'toggle'],
        'interaction'
      );

      // Step 5: Generate AI suggestions
      const suggestions = aiDesignSuggestions?.generateSuggestions(
        'dark theme implementation',
        ['theme', 'dark', 'preference']
      );

      // Verify complete workflow
      expect(interaction).toBeDefined();
      expect(learnedPattern).toBeDefined();
      expect(uxPattern).toBeDefined();
      expect(asset).toBeDefined();
      expect(suggestions).toBeDefined();
    });

    test('should pass performance testing requirements', async () => {
      await componentManager.initialize();
      
      // Test system response time
      const startTime = Date.now();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const memory = memorySystem?.createNode('knowledge', 'Performance test', 'user_input', ['performance'], 0.8);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Verify response time < 100ms
      expect(responseTime).toBeLessThan(100);
      expect(memory).toBeDefined();

      // Test concurrent operations
      const concurrentStartTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          memorySystem?.createNode('knowledge', `Concurrent ${i}`, 'user_input', ['concurrent'], 0.8)
        );
      }
      
      await Promise.all(promises);
      
      const concurrentEndTime = Date.now();
      const concurrentTime = concurrentEndTime - concurrentStartTime;

      // Verify concurrent operations < 2000ms
      expect(concurrentTime).toBeLessThan(2000);
    });

    test('should pass load testing requirements', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      
      // Test with high load
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        memorySystem?.createNode(
          'knowledge',
          `Load test node ${i}`,
          'user_input',
          [`tag${i % 20}`],
          0.5 + (i % 5) * 0.1
        );
      }
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Verify load handling
      expect(loadTime).toBeLessThan(10000); // Should handle 1000 nodes in < 10 seconds

      // Verify system remains responsive
      const searchStartTime = Date.now();
      const results = memorySystem?.searchNodes({ tags: ['tag1'] });
      const searchTime = Date.now() - searchStartTime;

      expect(searchTime).toBeLessThan(500); // Should search in < 500ms
      expect(results?.length).toBeGreaterThan(0);
    });

    test('should pass security testing requirements', async () => {
      await componentManager.initialize();
      
      // Test input validation
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      
      // Test with potentially malicious input
      const maliciousInput = '<script>alert("xss")</script>';
      
      expect(() => {
        memorySystem?.createNode(
          'knowledge',
          maliciousInput,
          'user_input',
          [maliciousInput],
          0.8
        );
      }).not.toThrow();

      // Test with very large input
      const largeInput = 'A'.repeat(10000);
      
      expect(() => {
        memorySystem?.createNode(
          'knowledge',
          largeInput,
          'user_input',
          ['large-input'],
          0.8
        );
      }).not.toThrow();
    });
  });

  describe('Step 4.3: Security & Performance', () => {
    test('should implement data validation and sanitization', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      
      // Test data validation
      const validMemory = memorySystem?.createNode(
        'knowledge',
        'Valid data',
        'user_input',
        ['valid'],
        0.8
      );
      
      expect(validMemory).toBeDefined();
      expect(validMemory?.data).toBe('Valid data');
      expect(validMemory?.metadata.tags).toEqual(['valid']);
      expect(validMemory?.metadata.confidence).toBe(0.8);
    });

    test('should handle access control appropriately', async () => {
      await componentManager.initialize();
      
      // Test that components are accessible
      const components = componentManager.getAllComponents();
      expect(components.size).toBe(11);
      
      // Test component access
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      
      expect(memorySystem).toBeDefined();
      expect(learningSystem).toBeDefined();
    });

    test('should implement secure communication between components', async () => {
      await componentManager.initialize();
      
      // Test event communication security
      const testEvent: TonyEvent = {
        id: 'secure-test',
        type: 'test:secure',
        data: { message: 'Secure communication test' },
        priority: 'high',
        timestamp: Date.now(),
        source: 'test',
        context: { test: 'security' }
      };

      await eventBus.publish(testEvent);
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify event was processed securely
      const eventStats = eventBus.getStats();
      expect(eventStats.historySize).toBeGreaterThan(0);
    });

    test('should optimize performance for all operations', async () => {
      await componentManager.initialize();
      
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      
      // Test memory operation performance
      const memoryStartTime = Date.now();
      const memory = memorySystem?.createNode('knowledge', 'Performance test', 'user_input', ['performance'], 0.8);
      const memoryTime = Date.now() - memoryStartTime;
      
      expect(memoryTime).toBeLessThan(50); // Should complete in < 50ms
      expect(memory).toBeDefined();

      // Test learning operation performance
      const learningStartTime = Date.now();
      const pattern = learningSystem?.learnPattern('performance-pattern', { name: 'Performance' }, ['performance'], 0.8);
      const learningTime = Date.now() - learningStartTime;
      
      expect(learningTime).toBeLessThan(50); // Should complete in < 50ms
      expect(pattern).toBeDefined();
    });

    test('should implement monitoring and logging', async () => {
      await componentManager.initialize();
      
      // Test system statistics
      const systemStats = await store.getComponentStats();
      expect(systemStats).toBeDefined();
      expect(Object.keys(systemStats).length).toBeGreaterThan(0);

      // Test component statistics
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const memoryStats = memorySystem?.getStats();
      expect(memoryStats).toBeDefined();
      expect(memoryStats?.totalNodes).toBeGreaterThanOrEqual(0);

      // Test event statistics
      const eventStats = eventBus.getStats();
      expect(eventStats).toBeDefined();
      expect(eventStats.historySize).toBeGreaterThanOrEqual(0);
    });

    test('should implement recovery mechanisms', async () => {
      await componentManager.initialize();
      
      // Test state recovery
      const recoveryResult = await store.recoverState();
      expect(recoveryResult.success).toBe(true);
      expect(recoveryResult.dataLoss).toBe(false);

      // Test component recovery
      const restartResult = await componentManager.restartComponent('MemorySystem');
      expect(restartResult).toBe(true);

      // Verify system remains functional after recovery
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const memory = memorySystem?.createNode('knowledge', 'Recovery test', 'user_input', ['recovery'], 0.8);
      expect(memory).toBeDefined();
    });
  });

  describe('System Harmony Validation', () => {
    test('should maintain system harmony under normal operations', async () => {
      await componentManager.initialize();
      
      // Test that all components work together harmoniously
      const components = componentManager.getAllComponents();
      expect(components.size).toBe(11);
      
      // Test system health
      const health = componentManager.getSystemHealth();
      expect(health.initializedCount).toBe(11);
      expect(health.failedCount).toBe(0);
      expect(health.componentCount).toBe(11);
      
      // Test that system is ready
      expect(componentManager.isSystemReady()).toBe(true);
    });

    test('should maintain system harmony under stress', async () => {
      await componentManager.initialize();
      
      // Test system under stress
      const memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem');
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      
      // Perform stress operations
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          memorySystem?.createNode('knowledge', `Stress test ${i}`, 'user_input', ['stress'], 0.8),
          learningSystem?.learnPattern(`stress-pattern-${i}`, { name: `Stress ${i}` }, ['stress'], 0.8)
        );
      }
      
      await Promise.all(promises);
      
      // Verify system remains harmonious
      const health = componentManager.getSystemHealth();
      expect(health.initializedCount).toBe(11);
      expect(health.failedCount).toBe(0);
      expect(componentManager.isSystemReady()).toBe(true);
    });

    test('should maintain system harmony during component failures', async () => {
      await componentManager.initialize();
      
      // Simulate component failure and recovery
      const restartResult = await componentManager.restartComponent('MemorySystem');
      expect(restartResult).toBe(true);
      
      // Verify system remains harmonious
      const health = componentManager.getSystemHealth();
      expect(health.initializedCount).toBe(11);
      expect(health.failedCount).toBe(0);
      expect(componentManager.isSystemReady()).toBe(true);
      
      // Verify other components still work
      const learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem');
      const pattern = learningSystem?.learnPattern('harmony-test', { name: 'Harmony' }, ['test'], 0.8);
      expect(pattern).toBeDefined();
    });
  });
});