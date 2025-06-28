import { MemorySystem } from '../MemorySystem';
import { MemoryNode } from '../../../types/tony';
import { eventBus } from '../../../events/EventBus';

describe('Enhanced MemorySystem', () => {
  let memorySystem: MemorySystem;

  beforeEach(async () => {
    memorySystem = new MemorySystem();
    
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    
    await memorySystem.initialize();
  });

  afterEach(async () => {
    await memorySystem.destroy();
    
    // Clear localStorage after each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Memory Node Creation and Indexing', () => {
    test('should create memory nodes with enhanced indexing', () => {
      const node1 = memorySystem.createNode(
        'interaction',
        { text: 'User clicked button', timestamp: Date.now() },
        'user_input',
        ['ui', 'interaction'],
        0.8
      );

      const node2 = memorySystem.createNode(
        'pattern',
        { description: 'Common UI pattern', category: 'navigation' },
        'system_generated',
        ['ui', 'pattern', 'navigation'],
        0.9
      );

      expect(node1).toBeDefined();
      expect(node2).toBeDefined();
      expect(node1.metadata.confidence).toBeGreaterThan(0.5);
      expect(node2.metadata.confidence).toBeGreaterThan(0.5);
    });

    test('should update indexes when nodes are created', () => {
      const node = memorySystem.createNode(
        'knowledge',
        { content: 'Important information', validated: true },
        'validated_feedback',
        ['important', 'validated'],
        0.95
      );

      // Test that node is indexed by type
      const typeResults = memorySystem.searchNodes({ type: 'knowledge' });
      expect(typeResults).toHaveLength(1);
      expect(typeResults[0].id).toBe(node.id);

      // Test that node is indexed by tags
      const tagResults = memorySystem.searchNodes({ tags: ['important'] });
      expect(tagResults).toHaveLength(1);
      expect(tagResults[0].id).toBe(node.id);

      // Test that node is indexed by source
      const sourceResults = memorySystem.searchNodes({ source: 'validated_feedback' });
      expect(sourceResults).toHaveLength(1);
      expect(sourceResults[0].id).toBe(node.id);
    });
  });

  describe('Advanced Search and Relevance Scoring', () => {
    beforeEach(() => {
      // Create test nodes with different characteristics
      memorySystem.createNode(
        'interaction',
        { text: 'User clicked login button', timestamp: Date.now() },
        'user_input',
        ['ui', 'login', 'button'],
        0.7
      );

      memorySystem.createNode(
        'pattern',
        { description: 'Login form pattern', category: 'authentication' },
        'system_generated',
        ['ui', 'pattern', 'login', 'authentication'],
        0.9
      );

      memorySystem.createNode(
        'knowledge',
        { content: 'Users prefer simple login forms', validated: true },
        'validated_feedback',
        ['ux', 'login', 'research'],
        0.8
      );
    });

    test('should perform multi-criteria search', () => {
      const results = memorySystem.searchNodes({
        tags: ['login'],
        minImportance: 0.7
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(node => 
        node.metadata.tags.includes('login') && 
        node.metadata.importance >= 0.7
      )).toBe(true);
    });

    test('should rank results by relevance score', () => {
      const results = memorySystem.searchNodes({
        tags: ['login', 'ui']
      });

      // Results should be sorted by relevance (highest first)
      for (let i = 1; i < results.length; i++) {
        const prevScore = results[i - 1].metadata.importance;
        const currScore = results[i].metadata.importance;
        expect(prevScore).toBeGreaterThanOrEqual(currScore);
      }
    });

    test('should support full-text search', () => {
      const results = memorySystem.searchNodes({
        text: 'login button'
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(node => 
        node.data.text && node.data.text.includes('login')
      )).toBe(true);
    });

    test('should filter by time range', () => {
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      const oneHourFromNow = now + (60 * 60 * 1000);

      const results = memorySystem.searchNodes({
        timeRange: { start: oneHourAgo, end: oneHourFromNow }
      });

      expect(results.every(node => 
        node.createdAt >= oneHourAgo && node.createdAt <= oneHourFromNow
      )).toBe(true);
    });
  });

  describe('Connection Mapping and Analysis', () => {
    test('should create connections with strength analysis', () => {
      const node1 = memorySystem.createNode(
        'interaction',
        { text: 'User clicked button' },
        'user_input',
        ['ui', 'button'],
        0.7
      );

      const node2 = memorySystem.createNode(
        'pattern',
        { description: 'Button interaction pattern' },
        'system_generated',
        ['ui', 'pattern', 'button'],
        0.8
      );

      const connected = memorySystem.connectNodes(node1.id, node2.id, 'related', 0.8);
      expect(connected).toBe(true);

      const related = memorySystem.getRelatedNodes(node1.id);
      expect(related).toHaveLength(1);
      expect(related[0].node.id).toBe(node2.id);
      expect(related[0].strength).toBe(0.8);
    });

    test('should sort related nodes by connection strength', () => {
      const node1 = memorySystem.createNode('interaction', { text: 'Main node' }, 'user_input', [], 0.5);
      const node2 = memorySystem.createNode('pattern', { description: 'Weak connection' }, 'system_generated', [], 0.5);
      const node3 = memorySystem.createNode('knowledge', { content: 'Strong connection' }, 'validated_feedback', [], 0.5);

      memorySystem.connectNodes(node1.id, node2.id, 'related', 0.3);
      memorySystem.connectNodes(node1.id, node3.id, 'related', 0.9);

      const related = memorySystem.getRelatedNodes(node1.id);
      expect(related).toHaveLength(2);
      expect(related[0].strength).toBe(0.9); // Strongest first
      expect(related[1].strength).toBe(0.3);
    });
  });

  describe('Confidence Scoring and Updates', () => {
    test('should calculate initial confidence based on data quality', () => {
      const node1 = memorySystem.createNode(
        'interaction',
        { text: 'Short text' },
        'user_input',
        ['tag1'],
        0.5
      );

      const node2 = memorySystem.createNode(
        'knowledge',
        { 
          content: 'Long detailed content with lots of information',
          validated: true,
          timestamp: Date.now()
        },
        'validated_feedback',
        ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        0.5
      );

      expect(node2.metadata.confidence).toBeGreaterThan(node1.metadata.confidence);
    });

    test('should update confidence based on access patterns', () => {
      const node = memorySystem.createNode(
        'interaction',
        { text: 'Test node' },
        'user_input',
        [],
        0.5
      );

      const initialConfidence = node.metadata.confidence;

      // Access the node multiple times
      for (let i = 0; i < 15; i++) {
        memorySystem.getNode(node.id);
      }

      const updatedNode = memorySystem.getNode(node.id);
      expect(updatedNode!.metadata.confidence).toBeGreaterThan(initialConfidence);
      expect(updatedNode!.metadata.accessCount).toBe(16); // 15 + 1 from getNode
    });
  });

  describe('Memory Persistence', () => {
    test('should save and load memory correctly', async () => {
      // Create some test nodes
      const node1 = memorySystem.createNode(
        'interaction',
        { text: 'Test interaction' },
        'user_input',
        ['test'],
        0.7
      );

      const node2 = memorySystem.createNode(
        'pattern',
        { description: 'Test pattern' },
        'system_generated',
        ['test', 'pattern'],
        0.8
      );

      memorySystem.connectNodes(node1.id, node2.id, 'related', 0.6);

      // Save memory
      await memorySystem.saveMemory();

      // Create new memory system and load
      const newMemorySystem = new MemorySystem();
      await newMemorySystem.initialize();

      // Verify nodes were loaded
      const loadedNode1 = newMemorySystem.getNode(node1.id);
      const loadedNode2 = newMemorySystem.getNode(node2.id);

      expect(loadedNode1).toBeDefined();
      expect(loadedNode2).toBeDefined();
      expect(loadedNode1!.data.text).toBe('Test interaction');
      expect(loadedNode2!.data.description).toBe('Test pattern');

      // Verify connections were loaded
      const related = newMemorySystem.getRelatedNodes(node1.id);
      expect(related).toHaveLength(1);
      expect(related[0].node.id).toBe(node2.id);

      await newMemorySystem.destroy();
    });
  });

  describe('Memory Optimization', () => {
    test('should clean up short-term memory when limit exceeded', () => {
      // Create more nodes than the short-term limit
      const nodes = [];
      for (let i = 0; i < 1100; i++) {
        const node = memorySystem.createNode(
          'interaction',
          { text: `Node ${i}` },
          'user_input',
          [],
          0.1 + (i % 10) * 0.1 // Varying importance
        );
        nodes.push(node);
      }

      const stats = memorySystem.getStats();
      expect(stats.shortTermCount).toBeLessThanOrEqual(1000); // Should be cleaned up
    });

    test('should optimize long-term memory based on thresholds', () => {
      // Create nodes with varying characteristics
      for (let i = 0; i < 100; i++) {
        const node = memorySystem.createNode(
          'knowledge',
          { content: `Knowledge ${i}` },
          'system_generated',
          [],
          0.1 + (i % 10) * 0.1
        );

        // Move to long-term
        memorySystem.moveToLongTerm(node.id);

        // Access some nodes more than others
        if (i % 3 === 0) {
          for (let j = 0; j < 10; j++) {
            memorySystem.getNode(node.id);
          }
        }
      }

      // Trigger optimization
      memorySystem['optimizeMemory']();

      const stats = memorySystem.getStats();
      expect(stats.longTermCount).toBeLessThanOrEqual(10000);
    });
  });

  describe('Enhanced Statistics', () => {
    test('should provide comprehensive memory statistics', () => {
      // Create nodes with different characteristics
      memorySystem.createNode('interaction', { text: 'Test' }, 'user_input', ['tag1'], 0.7);
      memorySystem.createNode('pattern', { description: 'Test' }, 'system_generated', ['tag2'], 0.8);
      memorySystem.createNode('knowledge', { content: 'Test' }, 'validated_feedback', ['tag3'], 0.9);

      const stats = memorySystem.getStats();

      expect(stats.totalNodes).toBe(3);
      expect(stats.shortTermCount).toBe(3);
      expect(stats.longTermCount).toBe(0);
      expect(stats.connectionCount).toBe(0);
      expect(stats.indexStats.byType).toBeGreaterThan(0);
      expect(stats.indexStats.byTag).toBeGreaterThan(0);
      expect(stats.indexStats.bySource).toBeGreaterThan(0);
      expect(stats.averageConfidence).toBeGreaterThan(0);
      expect(stats.averageImportance).toBeGreaterThan(0);
      expect(stats.averageAccessCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Integration', () => {
    test('should emit events for memory operations', (done) => {
      const events: any[] = [];

      const subscription = eventBus.subscribe('memory_node_created', (event) => {
        events.push(event);
        if (events.length === 2) {
          expect(events[0].data.type).toBe('interaction');
          expect(events[1].data.type).toBe('pattern');
          eventBus.unsubscribe(subscription.id);
          done();
        }
      });

      memorySystem.createNode('interaction', { text: 'Test' }, 'user_input', [], 0.5);
      memorySystem.createNode('pattern', { description: 'Test' }, 'system_generated', [], 0.5);
    });

    test('should handle memory update events', (done) => {
      const node = memorySystem.createNode('interaction', { text: 'Test' }, 'user_input', [], 0.5);

      const subscription = eventBus.subscribe('memory_update', (event) => {
        if (event.data.action === 'update' && event.data.nodeId === node.id) {
          eventBus.unsubscribe(subscription.id);
          done();
        }
      });

      memorySystem.getNode(node.id);
    });
  });

  describe('Error Handling', () => {
    test('should handle persistence errors gracefully', async () => {
      // Create a memory system with invalid storage key
      const invalidMemorySystem = new MemorySystem();
      (invalidMemorySystem as any).persistenceConfig.storageKey = '';
      
      // Should not throw error during initialization
      await expect(invalidMemorySystem.initialize()).resolves.not.toThrow();
      
      await invalidMemorySystem.destroy();
    });

    test('should handle search with invalid criteria', () => {
      const results = memorySystem.searchNodes({
        minImportance: -1, // Invalid value
        minConfidence: 2.0 // Invalid value
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large numbers of nodes efficiently', () => {
      const startTime = Date.now();
      
      // Create 1000 nodes
      for (let i = 0; i < 1000; i++) {
        memorySystem.createNode(
          'interaction',
          { text: `Node ${i}`, timestamp: Date.now() },
          'user_input',
          [`tag${i % 10}`],
          0.5 + (i % 5) * 0.1
        );
      }

      const creationTime = Date.now() - startTime;
      expect(creationTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Test search performance
      const searchStartTime = Date.now();
      const results = memorySystem.searchNodes({ tags: ['tag1'] });
      const searchTime = Date.now() - searchStartTime;

      expect(searchTime).toBeLessThan(1000); // Should complete within 1 second
      expect(results.length).toBeGreaterThan(0);
    });

    test('should maintain performance with frequent updates', () => {
      const node = memorySystem.createNode('interaction', { text: 'Test' }, 'user_input', [], 0.5);
      
      const startTime = Date.now();
      
      // Perform 1000 get operations
      for (let i = 0; i < 1000; i++) {
        memorySystem.getNode(node.id);
      }
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      const updatedNode = memorySystem.getNode(node.id);
      expect(updatedNode!.metadata.accessCount).toBe(1001);
    });
  });
}); 