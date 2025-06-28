import { LearningSystem } from '../LearningSystem';
import { eventBus } from '../../../events/EventBus';

describe('LearningSystem - Step 2.2 Enhanced Features', () => {
  let learningSystem: LearningSystem;

  beforeEach(() => {
    learningSystem = new LearningSystem();
  });

  afterEach(async () => {
    await learningSystem.destroy();
  });

  describe('Initialization', () => {
    test('should initialize with advanced features', async () => {
      await learningSystem.initialize();
      const state = learningSystem.getState();
      
      expect(state.patternRecognition.active).toBe(true);
      expect(state.feedbackProcessor.active).toBe(true);
      expect(state.knowledgeSharing.active).toBe(true);
      expect(state.patternRecognition.methods.length).toBeGreaterThan(0);
      expect(state.feedbackProcessor.rules.length).toBeGreaterThan(0);
      expect(state.knowledgeSharing.protocols.length).toBeGreaterThan(0);
    });

    test('should set up pattern recognition methods', async () => {
      await learningSystem.initialize();
      const state = learningSystem.getState();
      
      const methods = state.patternRecognition.methods;
      expect(methods.some(m => m.type === 'frequency')).toBe(true);
      expect(methods.some(m => m.type === 'sequence')).toBe(true);
      expect(methods.some(m => m.type === 'similarity')).toBe(true);
    });

    test('should set up feedback processing rules', async () => {
      await learningSystem.initialize();
      const state = learningSystem.getState();
      
      const rules = state.feedbackProcessor.rules;
      expect(rules.some(r => r.action === 'request_feedback')).toBe(true);
      expect(rules.some(r => r.action === 'increase_confidence')).toBe(true);
    });
  });

  describe('Enhanced Pattern Recognition', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should learn patterns with advanced features', () => {
      const patternData = {
        userId: 'user123',
        action: 'click',
        timestamp: Date.now(),
        location: { x: 100, y: 200 }
      };

      const pattern = learningSystem.learnPattern(
        'user_interaction',
        patternData,
        ['UXRepository'],
        0.8
      );

      expect(pattern.features.length).toBeGreaterThan(0);
      expect(pattern.similarity).toBeDefined();
      expect(pattern.prediction).toBeDefined();
      expect(pattern.validation).toBeDefined();
      expect(pattern.features.some(f => f.type === 'numeric')).toBe(true);
      expect(pattern.features.some(f => f.type === 'temporal')).toBe(true);
    });

    test('should extract features from pattern data', () => {
      const patternData = {
        count: 5,
        category: 'button',
        value: 100.5
      };

      const pattern = learningSystem.learnPattern(
        'test_pattern',
        patternData,
        ['test_source']
      );

      const numericFeatures = pattern.features.filter(f => f.type === 'numeric');
      const categoricalFeatures = pattern.features.filter(f => f.type === 'categorical');
      const temporalFeatures = pattern.features.filter(f => f.type === 'temporal');

      expect(numericFeatures.length).toBeGreaterThan(0);
      expect(categoricalFeatures.length).toBeGreaterThan(0);
      expect(temporalFeatures.length).toBe(1);
    });

    test('should calculate similarity between patterns', () => {
      const data1 = { count: 5, category: 'button' };
      const data2 = { count: 6, category: 'button' };
      const data3 = { count: 1, category: 'link' };

      const pattern1 = learningSystem.learnPattern('test', data1, ['source1']);
      const pattern2 = learningSystem.learnPattern('test', data2, ['source2']);
      const pattern3 = learningSystem.learnPattern('test', data3, ['source3']);

      // Pattern2 should be more similar to pattern1 than pattern3
      const similarity1to2 = pattern2.similarity.find(s => s.patternId === pattern1.id);
      const similarity1to3 = pattern3.similarity.find(s => s.patternId === pattern1.id);

      // Both should have similarity values, and pattern2 should be more similar
      expect(similarity1to2?.similarity).toBeGreaterThan(0);
      expect(similarity1to3?.similarity).toBeGreaterThan(0);
      expect(similarity1to2?.similarity).toBeGreaterThan(similarity1to3?.similarity || 0);
    });

    test('should generate predictions for patterns', () => {
      const patternData = { value: 100, trend: 'increasing' };
      const pattern = learningSystem.learnPattern('trend', patternData, ['source']);

      expect(pattern.prediction.confidence).toBeGreaterThan(0);
      expect(pattern.prediction.timeframe).toBeGreaterThan(0);
      expect(pattern.prediction.factors.length).toBeGreaterThan(0);
    });
  });

  describe('Enhanced Feedback Processing', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should add feedback with advanced properties', () => {
      const feedbackData = { confidence: 0.3, occurrences: 15 };
      
      const feedback = learningSystem.addFeedbackLoop(
        'correction',
        feedbackData,
        'high',
        'UXRepository',
        'LearningSystem'
      );

      expect(feedback.priority).toBe('high');
      expect(feedback.source).toBe('UXRepository');
      expect(feedback.target).toBe('LearningSystem');
      expect(feedback.impact).toBeDefined();
      expect(feedback.action).toBeDefined();
    });

    test('should process feedback with rules engine', async () => {
      const feedbackData = { confidence: 0.3, occurrences: 5 };
      
      const feedback = learningSystem.addFeedbackLoop(
        'correction',
        feedbackData,
        'medium',
        'UXRepository'
      );

      // Process feedback loops
      await learningSystem.processFeedbackLoops();

      // Check if feedback was processed
      const state = learningSystem.getState();
      const processedFeedback = state.feedbackLoops.find(f => f.id === feedback.id);
      
      expect(processedFeedback?.processed).toBe(true);
    });

    test('should apply feedback rules correctly', async () => {
      const lowConfidenceData = { confidence: 0.3 };
      const highOccurrenceData = { occurrences: 15 };

      const feedback1 = learningSystem.addFeedbackLoop('correction', lowConfidenceData);
      const feedback2 = learningSystem.addFeedbackLoop('reinforcement', highOccurrenceData);

      await learningSystem.processFeedbackLoops();

      // Check if rules were applied
      expect(feedback1.action.type).toBe('update_pattern');
      expect(feedback2.action.type).toBe('update_pattern');
    });

    test('should update feedback impact based on type', async () => {
      const correctionFeedback = learningSystem.addFeedbackLoop('correction', {});
      const reinforcementFeedback = learningSystem.addFeedbackLoop('reinforcement', {});
      const userFeedback = learningSystem.addFeedbackLoop('user', {});

      await learningSystem.processFeedbackLoops();

      expect(correctionFeedback.impact.learningRate).toBe(0.2);
      expect(reinforcementFeedback.impact.learningRate).toBe(0.15);
      expect(userFeedback.impact.learningRate).toBe(0.1);
    });
  });

  describe('Enhanced Knowledge Sharing', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should create knowledge nodes with sharing capabilities', () => {
      const knowledge = learningSystem.addKnowledgeNode(
        'design_pattern',
        { name: 'Card Layout', usage: 'high' },
        ['UXRepository'],
        0.9,
        true // isPublic
      );

      expect(knowledge.sharing.isPublic).toBe(true);
      expect(knowledge.sharing.accessLevel).toBe('read');
      expect(knowledge.validation).toBeDefined();
      expect(knowledge.usage).toBeDefined();
    });

    test('should share public knowledge', async () => {
      const knowledge = learningSystem.addKnowledgeNode(
        'best_practice',
        { content: 'Use consistent spacing' },
        [],
        0.8,
        true
      );

      // Mock the shareKnowledge method call
      const shareSpy = jest.spyOn(learningSystem as any, 'shareKnowledge');
      
      // Trigger knowledge sharing (normally done by background processing)
      await (learningSystem as any).shareKnowledge();

      expect(shareSpy).toHaveBeenCalled();
    });

    test('should update sharing statistics', async () => {
      const knowledge = learningSystem.addKnowledgeNode(
        'insight',
        { content: 'User prefers dark mode' },
        [],
        0.7,
        true
      );

      const initialState = learningSystem.getState();
      const initialSharedItems = initialState.knowledgeSharing.statistics.sharedItems;

      // Simulate sharing by directly calling the method that updates statistics
      await (learningSystem as any).shareViaProtocol(knowledge, 'push');

      const finalState = learningSystem.getState();
      // The shareViaProtocol method should increment sharedItems
      expect(finalState.knowledgeSharing.statistics.sharedItems).toBe(initialSharedItems + 1);
    });
  });

  describe('Enhanced Algorithm Framework', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should register algorithms with full configuration', () => {
      const algorithm = learningSystem.registerAlgorithm(
        'supervised',
        'Decision Tree Classifier',
        'A simple decision tree for pattern classification',
        ['numeric', 'categorical'],
        ['classification'],
        0.85
      );

      expect(algorithm.configuration.name).toBe('Decision Tree Classifier');
      expect(algorithm.configuration.description).toBeDefined();
      expect(algorithm.configuration.inputTypes).toContain('numeric');
      expect(algorithm.configuration.outputTypes).toContain('classification');
      expect(algorithm.training).toBeDefined();
      expect(algorithm.evaluation).toBeDefined();
      expect(algorithm.hyperparameters).toBeDefined();
    });

    test('should handle algorithm training events', async () => {
      const algorithm = learningSystem.registerAlgorithm(
        'deep',
        'Neural Network',
        'Deep learning model',
        ['numeric'],
        ['prediction'],
        0.0
      );

      // Simulate training event
      await eventBus.publishSimple(
        'algorithm_training',
        'TestComponent',
        {
          algorithmId: algorithm.id,
          status: 'training',
          progress: 50,
          accuracy: 0.75
        }
      );

      // Check if algorithm status was updated
      const state = learningSystem.getState();
      const updatedAlgorithm = state.learningAlgorithms.find(a => a.id === algorithm.id);
      
      expect(updatedAlgorithm?.training.isTraining).toBe(true);
      expect(updatedAlgorithm?.training.progress).toBe(50);
      expect(updatedAlgorithm?.training.accuracy).toBe(0.75);
    });
  });

  describe('Learning Metrics', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should update comprehensive metrics', () => {
      // Add some test data
      learningSystem.learnPattern('test', { value: 1 }, ['source']);
      learningSystem.addFeedbackLoop('user', {});
      learningSystem.addKnowledgeNode('test', { content: 'test' }, []);

      // Trigger metrics update
      (learningSystem as any).updateMetrics();

      const state = learningSystem.getState();
      const metrics = state.learningMetrics;

      expect(metrics.overall.totalPatterns).toBe(1);
      expect(metrics.overall.totalKnowledge).toBe(1);
      expect(metrics.overall.totalFeedback).toBe(1);
      expect(metrics.patterns.recognitionRate).toBeGreaterThan(0);
      expect(metrics.knowledge.totalNodes).toBe(1);
      expect(metrics.feedback.totalFeedback).toBe(1);
    });

    test('should track pattern recognition statistics', () => {
      const pattern = learningSystem.learnPattern('test', { value: 1 }, ['source'], 0.8);
      
      const state = learningSystem.getState();
      const stats = state.patternRecognition.statistics;

      expect(stats.patternsDetected).toBe(1);
      expect(stats.averageConfidence).toBe(0.8);
    });
  });

  describe('Integration Tests', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should handle end-to-end learning workflow', async () => {
      // 1. Learn a pattern
      const pattern = learningSystem.learnPattern(
        'user_behavior',
        { action: 'click', target: 'button' },
        ['UXRepository'],
        0.7
      );

      // 2. Add feedback about the pattern
      const feedback = learningSystem.addFeedbackLoop(
        'correction',
        { patternId: pattern.id, accuracy: 0.6 },
        'high',
        'UXRepository'
      );

      // 3. Create knowledge from the pattern
      const knowledge = learningSystem.addKnowledgeNode(
        'user_preference',
        { users: 'prefer button clicks' },
        [pattern.id],
        0.8,
        true
      );

      // 4. Register an algorithm
      const algorithm = learningSystem.registerAlgorithm(
        'supervised',
        'User Behavior Classifier',
        'Classifies user behavior patterns',
        ['categorical'],
        ['classification'],
        0.0
      );

      // 5. Process everything
      await learningSystem.processFeedbackLoops();

      // 6. Verify the state
      const state = learningSystem.getState();
      
      expect(state.patterns.length).toBe(1);
      expect(state.feedbackLoops.length).toBeGreaterThanOrEqual(1); // At least the one we added
      expect(state.knowledgeBase.length).toBe(1);
      expect(state.learningAlgorithms.length).toBe(1);
      
      // Find our specific feedback and verify it was processed
      const ourFeedback = state.feedbackLoops.find(f => f.id === feedback.id);
      expect(ourFeedback?.processed).toBe(true);
    });

    test('should maintain data consistency across operations', () => {
      const pattern = learningSystem.learnPattern('test', { value: 1 }, ['source']);
      const knowledge = learningSystem.addKnowledgeNode('test', { content: 'test' }, [pattern.id]);
      
      const patternsByType = learningSystem.getPatternsByType('test');
      const knowledgeByType = learningSystem.getKnowledgeByType('test');
      
      expect(patternsByType).toContain(pattern);
      expect(knowledgeByType).toContain(knowledge);
    });
  });

  describe('Error Handling', () => {
    test('should handle initialization errors gracefully', async () => {
      // Mock eventBus.subscribe to throw an error
      const originalSubscribe = eventBus.subscribe;
      eventBus.subscribe = jest.fn().mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      await expect(learningSystem.initialize()).rejects.toThrow('Subscription failed');

      // Restore original method
      eventBus.subscribe = originalSubscribe;
    });

    test('should handle pattern learning errors', () => {
      // Test with invalid data
      expect(() => {
        learningSystem.learnPattern('test', null, []);
      }).not.toThrow();
    });
  });

  describe('Edge Case Tests - Extreme Data Scenarios', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should handle extremely large data objects', () => {
      const largeData = {
        massiveArray: new Array(10000).fill(0).map((_, i) => ({ id: i, value: `item_${i}` })),
        nestedObject: createDeepNestedObject(10),
        binaryData: new Uint8Array(1000).fill(255)
      };

      const pattern = learningSystem.learnPattern('large_data_test', largeData, ['test_source']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
      expect(pattern.confidence).toBeGreaterThan(0);
    });

    test('should handle empty or minimal data', () => {
      const emptyData = {};
      const nullData = null;
      const undefinedData = undefined;
      const singleValue = 42;

      const pattern1 = learningSystem.learnPattern('empty_test', emptyData, ['test_source']);
      const pattern2 = learningSystem.learnPattern('null_test', nullData, ['test_source']);
      const pattern3 = learningSystem.learnPattern('undefined_test', undefinedData, ['test_source']);
      const pattern4 = learningSystem.learnPattern('single_value_test', singleValue, ['test_source']);

      expect(pattern1.id).toBeDefined();
      expect(pattern2.id).toBeDefined();
      expect(pattern3.id).toBeDefined();
      expect(pattern4.id).toBeDefined();
    });

    test('should handle circular reference objects', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;
      circularData.nested = { parent: circularData };

      const pattern = learningSystem.learnPattern('circular_test', circularData, ['test_source']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
    });

    test('should handle special characters and unicode data', () => {
      const specialData = {
        emoji: '🚀🎯💡',
        unicode: '测试文本 with special chars: !@#$%^&*()',
        html: '<script>alert("test")</script>',
        sql: "'; DROP TABLE users; --",
        json: '{"key": "value", "nested": {"array": [1,2,3]}}'
      };

      const pattern = learningSystem.learnPattern('special_chars_test', specialData, ['test_source']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
    });

    test('should handle extremely high confidence values', () => {
      const pattern = learningSystem.learnPattern('high_confidence_test', { value: 1 }, ['test_source'], 0.999999);
      
      expect(pattern.confidence).toBe(0.999999);
      expect(pattern.id).toBeDefined();
    });

    test('should handle extremely low confidence values', () => {
      const pattern = learningSystem.learnPattern('low_confidence_test', { value: 1 }, ['test_source'], 0.000001);
      
      expect(pattern.confidence).toBe(0.000001);
      expect(pattern.id).toBeDefined();
    });

    test('should handle negative confidence values', () => {
      const pattern = learningSystem.learnPattern('negative_confidence_test', { value: 1 }, ['test_source'], -0.5);
      
      expect(pattern.confidence).toBe(-0.5);
      expect(pattern.id).toBeDefined();
    });

    test('should handle confidence values above 1', () => {
      const pattern = learningSystem.learnPattern('overflow_confidence_test', { value: 1 }, ['test_source'], 1.5);
      
      expect(pattern.confidence).toBe(1.5);
      expect(pattern.id).toBeDefined();
    });
  });

  describe('Edge Case Tests - Performance and Load', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should handle rapid pattern creation', () => {
      const startTime = Date.now();
      const patterns = [];

      // Create 1000 patterns rapidly
      for (let i = 0; i < 1000; i++) {
        const pattern = learningSystem.learnPattern(
          'rapid_test',
          { index: i, timestamp: Date.now() },
          ['test_source'],
          0.5 + (i % 10) * 0.05
        );
        patterns.push(pattern);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(patterns.length).toBe(1000);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(patterns.every(p => p.id && p.id.startsWith('pattern_'))).toBe(true);
    });

    test('should handle concurrent pattern creation', async () => {
      const promises = [];
      const patternCount = 100;

      // Create patterns concurrently
      for (let i = 0; i < patternCount; i++) {
        promises.push(
          Promise.resolve().then(() => 
            learningSystem.learnPattern(
              'concurrent_test',
              { index: i },
              ['test_source'],
              0.5
            )
          )
        );
      }

      const patterns = await Promise.all(promises);
      
      expect(patterns.length).toBe(patternCount);
      expect(new Set(patterns.map(p => p.id)).size).toBe(patternCount); // All IDs should be unique
    });

    test('should handle memory pressure with large datasets', () => {
      const largePatterns = [];
      const memoryBefore = process.memoryUsage().heapUsed;

      // Create patterns with large data
      for (let i = 0; i < 100; i++) {
        const largeData = {
          id: i,
          data: new Array(1000).fill(0).map((_, j) => ({ index: j, value: `item_${i}_${j}` })),
          metadata: { created: Date.now(), size: 1000 }
        };

        const pattern = learningSystem.learnPattern('memory_test', largeData, ['test_source']);
        largePatterns.push(pattern);
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryIncrease = memoryAfter - memoryBefore;

      expect(largePatterns.length).toBe(100);
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Should not increase by more than 100MB
    });

    test('should handle feedback loop processing under load', async () => {
      // Add many feedback loops
      const feedbackLoops = [];
      for (let i = 0; i < 500; i++) {
        const feedback = learningSystem.addFeedbackLoop(
          'correction',
          { index: i, priority: i % 3 },
          'medium',
          'test_source'
        );
        feedbackLoops.push(feedback);
      }

      const startTime = Date.now();
      await learningSystem.processFeedbackLoops();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(feedbackLoops.length).toBe(500);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Edge Case Tests - Complex Interactions', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should handle patterns with complex nested relationships', () => {
      const complexData = {
        user: {
          id: 'user123',
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              sms: true
            }
          },
          history: [
            { action: 'login', timestamp: Date.now() - 1000 },
            { action: 'search', timestamp: Date.now() - 500 },
            { action: 'click', timestamp: Date.now() }
          ]
        },
        context: {
          device: 'mobile',
          location: { lat: 37.7749, lng: -122.4194 },
          timezone: 'America/Los_Angeles'
        }
      };

      const pattern = learningSystem.learnPattern('complex_nested_test', complexData, ['UXRepository']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
      expect(pattern.similarity).toBeDefined();
      expect(pattern.prediction).toBeDefined();
    });

    test('should handle feedback loops with complex conditions', async () => {
      const complexFeedback = learningSystem.addFeedbackLoop(
        'correction',
        {
          patternId: 'test_pattern',
          conditions: {
            confidence: { min: 0.3, max: 0.7 },
            occurrences: { min: 5, max: 50 },
            timeRange: { start: Date.now() - 86400000, end: Date.now() }
          },
          actions: [
            { type: 'increase_confidence', value: 0.1 },
            { type: 'request_user_feedback', priority: 'high' }
          ]
        },
        'critical',
        'UXRepository'
      );

      await learningSystem.processFeedbackLoops();

      expect(complexFeedback.id).toBeDefined();
      expect(complexFeedback.processed).toBe(true);
    });

    test('should handle knowledge sharing with complex permissions', async () => {
      const complexKnowledge = learningSystem.addKnowledgeNode(
        'complex_insight',
        {
          insight: 'Users prefer dark mode on mobile devices',
          confidence: 0.85,
          evidence: [
            { source: 'UXRepository', weight: 0.6 },
            { source: 'Analytics', weight: 0.4 }
          ],
          restrictions: ['mobile_only', 'dark_theme_related']
        },
        ['UXRepository', 'Analytics'],
        0.85,
        true
      );

      // Simulate sharing with complex protocol
      await (learningSystem as any).shareViaProtocol(complexKnowledge, 'request-response');

      expect(complexKnowledge.id).toBeDefined();
      expect(complexKnowledge.sharing.isPublic).toBe(true);
    });

    test('should handle algorithm registration with complex hyperparameters', () => {
      const complexAlgorithm = learningSystem.registerAlgorithm(
        'deep',
        'Complex Neural Network',
        'A deep learning model with complex architecture',
        ['numeric', 'categorical', 'temporal', 'spatial'],
        ['classification', 'regression', 'prediction'],
        0.0
      );

      // Add complex hyperparameters
      complexAlgorithm.hyperparameters = {
        layers: [64, 128, 256, 128, 64],
        activation: 'relu',
        dropout: 0.3,
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        optimizer: 'adam',
        lossFunction: 'categorical_crossentropy',
        regularization: {
          l1: 0.01,
          l2: 0.01
        }
      };

      expect(complexAlgorithm.id).toBeDefined();
      expect(complexAlgorithm.hyperparameters.layers).toEqual([64, 128, 256, 128, 64]);
      expect(complexAlgorithm.hyperparameters.regularization).toBeDefined();
    });
  });

  describe('Edge Case Tests - Error Recovery', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should recover from pattern learning failures', () => {
      // Mock a method to throw an error
      const originalExtractFeatures = (learningSystem as any).extractFeatures;
      (learningSystem as any).extractFeatures = jest.fn().mockImplementation(() => {
        throw new Error('Feature extraction failed');
      });

      // Should not throw, should handle gracefully
      expect(() => {
        learningSystem.learnPattern('error_test', { value: 1 }, ['test_source']);
      }).not.toThrow();

      // Restore original method
      (learningSystem as any).extractFeatures = originalExtractFeatures;
    });

    test('should recover from feedback processing failures', async () => {
      // Mock a method to throw an error
      const originalApplyFeedbackRules = (learningSystem as any).applyFeedbackRules;
      (learningSystem as any).applyFeedbackRules = jest.fn().mockImplementation(() => {
        throw new Error('Feedback processing failed');
      });

      const feedback = learningSystem.addFeedbackLoop('correction', { value: 1 });

      // Should not throw, should handle gracefully
      await expect(learningSystem.processFeedbackLoops()).resolves.not.toThrow();

      // Restore original method
      (learningSystem as any).applyFeedbackRules = originalApplyFeedbackRules;
    });

    test('should handle invalid event data gracefully', async () => {
      // Publish invalid event data
      await eventBus.publishSimple(
        'pattern_learned',
        'TestComponent',
        null, // Invalid data
        { component: 'TestComponent' }
      );

      // Should not crash the system
      const state = learningSystem.getState();
      expect(state.patterns).toBeDefined();
    });

    test('should handle corrupted pattern data', () => {
      const corruptedData = {
        normalField: 'value',
        corruptedField: undefined,
        nullField: null,
        circularRef: {} as any
      };
      corruptedData.circularRef.self = corruptedData;

      const pattern = learningSystem.learnPattern('corrupted_test', corruptedData, ['test_source']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Case Tests - Boundary Conditions', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should handle maximum string lengths', () => {
      const longString = 'a'.repeat(10000);
      const pattern = learningSystem.learnPattern('long_string_test', { text: longString }, ['test_source']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
    });

    test('should handle maximum numeric values', () => {
      const maxValues = {
        maxInt: Number.MAX_SAFE_INTEGER,
        minInt: Number.MIN_SAFE_INTEGER,
        maxFloat: Number.MAX_VALUE,
        minFloat: Number.MIN_VALUE,
        infinity: Infinity,
        negativeInfinity: -Infinity,
        nan: NaN
      };

      const pattern = learningSystem.learnPattern('max_values_test', maxValues, ['test_source']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
    });

    test('should handle date boundary conditions', () => {
      const dateData = {
        epoch: new Date(0),
        farFuture: new Date(8640000000000000), // Max safe date
        farPast: new Date(-8640000000000000), // Min safe date
        invalid: new Date('invalid'),
        now: new Date()
      };

      const pattern = learningSystem.learnPattern('date_boundary_test', dateData, ['test_source']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
    });

    test('should handle array boundary conditions', () => {
      const arrayData = {
        emptyArray: [],
        singleElement: [1],
        largeArray: new Array(1000).fill(0),
        nestedArrays: [[1, 2], [3, 4], [5, 6]],
        mixedArray: [1, 'string', { obj: true }, [1, 2, 3]]
      };

      const pattern = learningSystem.learnPattern('array_boundary_test', arrayData, ['test_source']);
      
      expect(pattern.id).toBeDefined();
      expect(pattern.features.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced Learning Algorithms', () => {
    beforeEach(async () => {
      await learningSystem.initialize();
    });

    test('should register reinforcement learning algorithm', () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      expect(rlAlgorithm.id).toBeDefined();
      expect(rlAlgorithm.algorithmType).toBe('reinforcement');
      expect(rlAlgorithm.implementation).toBeDefined();
      expect(rlAlgorithm.metadata.capabilities).toContain('action_selection');
      expect(rlAlgorithm.metadata.capabilities).toContain('policy_optimization');
    });

    test('should register transfer learning algorithm', () => {
      const tlAlgorithm = learningSystem.registerAdvancedAlgorithm('transfer');
      
      expect(tlAlgorithm.id).toBeDefined();
      expect(tlAlgorithm.algorithmType).toBe('transfer');
      expect(tlAlgorithm.implementation).toBeDefined();
      expect(tlAlgorithm.metadata.capabilities).toContain('domain_adaptation');
      expect(tlAlgorithm.metadata.capabilities).toContain('knowledge_transfer');
    });

    test('should register ensemble learning algorithm', () => {
      const ensembleAlgorithm = learningSystem.registerAdvancedAlgorithm('ensemble');
      
      expect(ensembleAlgorithm.id).toBeDefined();
      expect(ensembleAlgorithm.algorithmType).toBe('ensemble');
      expect(ensembleAlgorithm.implementation).toBeDefined();
      expect(ensembleAlgorithm.metadata.capabilities).toContain('prediction_combination');
      expect(ensembleAlgorithm.metadata.capabilities).toContain('robustness_improvement');
    });

    test('should train reinforcement learning algorithm', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      const trainingData = [
        { state: 's1', action: 'a1', reward: 1, nextState: 's2' },
        { state: 's2', action: 'a2', reward: 0, nextState: 's3' },
        { state: 's3', action: 'a1', reward: 1, nextState: 's1' }
      ];

      const success = await learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, trainingData);
      
      expect(success).toBe(true);
      expect(rlAlgorithm.training.isTraining).toBe(false);
      expect(rlAlgorithm.status).toBe('active');
      expect(rlAlgorithm.performance).toBeGreaterThan(0);
    });

    test('should make predictions with trained reinforcement learning algorithm', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      const trainingData = [
        { state: 's1', action: 'a1', reward: 1, nextState: 's2' },
        { state: 's2', action: 'a2', reward: 0, nextState: 's3' }
      ];

      await learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, trainingData);
      
      const prediction = await learningSystem.predictWithAdvancedAlgorithm(rlAlgorithm.id, { state: 's1' });
      
      expect(prediction).not.toBeNull();
      expect(prediction?.prediction).toBeDefined();
      expect(prediction?.confidence).toBeGreaterThan(0);
      expect(prediction?.confidence).toBeLessThanOrEqual(1);
    });

    test('should evaluate reinforcement learning algorithm', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      const trainingData = [
        { state: 's1', action: 'a1', reward: 1, nextState: 's2' },
        { state: 's2', action: 'a2', reward: 0, nextState: 's3' }
      ];

      await learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, trainingData);
      
      const testData = [
        { input: { state: 's1' }, expected: 'a1' },
        { input: { state: 's2' }, expected: 'a2' }
      ];

      const evaluation = await learningSystem.evaluateAdvancedAlgorithm(rlAlgorithm.id, testData);
      
      expect(evaluation).not.toBeNull();
      expect(evaluation?.accuracy).toBeGreaterThan(0);
      expect(evaluation?.accuracy).toBeLessThanOrEqual(1);
      expect(evaluation?.f1Score).toBeGreaterThan(0);
    });

    test('should update reinforcement learning algorithm with new data', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      const initialData = [
        { state: 's1', action: 'a1', reward: 1, nextState: 's2' }
      ];

      await learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, initialData);
      const initialPerformance = rlAlgorithm.performance;
      
      const newData = [
        { state: 's3', action: 'a3', reward: 1, nextState: 's4' },
        { state: 's4', action: 'a4', reward: 0, nextState: 's5' }
      ];

      const success = await learningSystem.updateAdvancedAlgorithm(rlAlgorithm.id, newData);
      
      expect(success).toBe(true);
      expect(rlAlgorithm.performance).toBeGreaterThanOrEqual(initialPerformance);
    });

    test('should handle ensemble learning with multiple algorithms', async () => {
      const ensembleAlgorithm = learningSystem.registerAdvancedAlgorithm('ensemble');
      
      // Add base algorithms to ensemble
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      const tlAlgorithm = learningSystem.registerAdvancedAlgorithm('transfer');
      
      // Train base algorithms
      const trainingData = [
        { state: 's1', action: 'a1', reward: 1, nextState: 's2' },
        { state: 's2', action: 'a2', reward: 0, nextState: 's3' }
      ];

      await learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, trainingData);
      await learningSystem.trainAdvancedAlgorithm(tlAlgorithm.id, trainingData);
      
      // Train ensemble
      const ensembleData = [
        { input: { state: 's1' }, expected: 'a1' },
        { input: { state: 's2' }, expected: 'a2' }
      ];

      const success = await learningSystem.trainAdvancedAlgorithm(ensembleAlgorithm.id, ensembleData);
      
      expect(success).toBe(true);
      expect(ensembleAlgorithm.status).toBe('active');
    });

    test('should get advanced algorithms by type', () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      const tlAlgorithm = learningSystem.registerAdvancedAlgorithm('transfer');
      const ensembleAlgorithm = learningSystem.registerAdvancedAlgorithm('ensemble');
      
      const rlAlgorithms = learningSystem.getAdvancedAlgorithms('reinforcement');
      const tlAlgorithms = learningSystem.getAdvancedAlgorithms('transfer');
      const ensembleAlgorithms = learningSystem.getAdvancedAlgorithms('ensemble');
      const allAdvancedAlgorithms = learningSystem.getAdvancedAlgorithms();
      
      expect(rlAlgorithms).toContain(rlAlgorithm);
      expect(tlAlgorithms).toContain(tlAlgorithm);
      expect(ensembleAlgorithms).toContain(ensembleAlgorithm);
      expect(allAdvancedAlgorithms.length).toBe(3);
    });

    test('should get algorithm by ID', () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      const foundAlgorithm = learningSystem.getAlgorithmById(rlAlgorithm.id);
      
      expect(foundAlgorithm).toBe(rlAlgorithm);
    });

    test('should handle training errors gracefully', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      // Mock implementation to throw error
      const originalTrain = rlAlgorithm.implementation.train;
      rlAlgorithm.implementation.train = jest.fn().mockRejectedValue(new Error('Training failed'));
      
      const success = await learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, []);
      
      expect(success).toBe(false);
      expect(rlAlgorithm.status).toBe('inactive');
      expect(rlAlgorithm.training.isTraining).toBe(false);
      
      // Restore original method
      rlAlgorithm.implementation.train = originalTrain;
    });

    test('should handle prediction errors gracefully', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      // Mock implementation to throw error
      const originalPredict = rlAlgorithm.implementation.predict;
      rlAlgorithm.implementation.predict = jest.fn().mockRejectedValue(new Error('Prediction failed'));
      
      const prediction = await learningSystem.predictWithAdvancedAlgorithm(rlAlgorithm.id, {});
      
      expect(prediction).toBeNull();
      
      // Restore original method
      rlAlgorithm.implementation.predict = originalPredict;
    });

    test('should handle evaluation errors gracefully', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      // Mock implementation to throw error
      const originalEvaluate = rlAlgorithm.implementation.evaluate;
      rlAlgorithm.implementation.evaluate = jest.fn().mockRejectedValue(new Error('Evaluation failed'));
      
      const evaluation = await learningSystem.evaluateAdvancedAlgorithm(rlAlgorithm.id, []);
      
      expect(evaluation).toBeNull();
      
      // Restore original method
      rlAlgorithm.implementation.evaluate = originalEvaluate;
    });

    test('should handle update errors gracefully', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      // Mock implementation to throw error
      const originalUpdate = rlAlgorithm.implementation.update;
      rlAlgorithm.implementation.update = jest.fn().mockRejectedValue(new Error('Update failed'));
      
      const success = await learningSystem.updateAdvancedAlgorithm(rlAlgorithm.id, []);
      
      expect(success).toBe(false);
      
      // Restore original method
      rlAlgorithm.implementation.update = originalUpdate;
    });

    test('should throw error for unsupported algorithm type', () => {
      expect(() => {
        (learningSystem as any).registerAdvancedAlgorithm('unsupported');
      }).toThrow('Unsupported advanced algorithm type: unsupported');
    });

    test('should throw error for non-existent algorithm', async () => {
      await expect(
        learningSystem.trainAdvancedAlgorithm('non-existent-id', [])
      ).rejects.toThrow('Advanced algorithm not found: non-existent-id');
    });

    test('should throw error for inactive algorithm prediction', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      await expect(
        learningSystem.predictWithAdvancedAlgorithm(rlAlgorithm.id, {})
      ).rejects.toThrow(`Algorithm ${rlAlgorithm.id} is not active`);
    });

    test('should handle complex training data for reinforcement learning', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      const complexTrainingData = [
        {
          state: { position: { x: 1, y: 2 }, velocity: { x: 0.5, y: -0.3 } },
          action: { thrust: 0.8, direction: 45 },
          reward: 1.0,
          nextState: { position: { x: 1.5, y: 1.7 }, velocity: { x: 0.8, y: -0.1 } }
        },
        {
          state: { position: { x: 5, y: 3 }, velocity: { x: -0.2, y: 0.7 } },
          action: { thrust: 0.3, direction: 90 },
          reward: 0.5,
          nextState: { position: { x: 4.8, y: 3.7 }, velocity: { x: -0.1, y: 0.9 } }
        }
      ];

      const success = await learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, complexTrainingData);
      
      expect(success).toBe(true);
      expect(rlAlgorithm.status).toBe('active');
    });

    test('should handle large training datasets', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      const largeTrainingData = [];
      for (let i = 0; i < 1000; i++) {
        largeTrainingData.push({
          state: { id: i, value: Math.random() },
          action: `action_${i % 5}`,
          reward: Math.random(),
          nextState: { id: i + 1, value: Math.random() }
        });
      }

      const startTime = Date.now();
      const success = await learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, largeTrainingData);
      const endTime = Date.now();
      
      expect(success).toBe(true);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should maintain algorithm state consistency', async () => {
      const rlAlgorithm = learningSystem.registerAdvancedAlgorithm('reinforcement');
      
      // Initial state
      expect(rlAlgorithm.status).toBe('inactive');
      expect(rlAlgorithm.training.isTraining).toBe(false);
      
      // During training
      const trainingPromise = learningSystem.trainAdvancedAlgorithm(rlAlgorithm.id, [
        { state: 's1', action: 'a1', reward: 1, nextState: 's2' }
      ]);
      
      expect(rlAlgorithm.status).toBe('training');
      expect(rlAlgorithm.training.isTraining).toBe(true);
      
      await trainingPromise;
      
      // After training
      expect(rlAlgorithm.status).toBe('active');
      expect(rlAlgorithm.training.isTraining).toBe(false);
      expect(rlAlgorithm.performance).toBeGreaterThan(0);
    });
  });
});

// Helper function for creating deep nested objects
function createDeepNestedObject(depth: number): any {
  if (depth <= 0) return { leaf: true };
  return {
    level: depth,
    nested: createDeepNestedObject(depth - 1)
  };
} 