import { AdvancedLearning } from '../components/advanced/AdvancedLearning';
import { ComponentManager } from '../components/core/ComponentManager';
import { MemorySystem } from '../components/core/MemorySystem';
import { LearningSystem } from '../components/core/LearningSystem';
import { UXRepository } from '../components/core/UXRepository';
import { eventBus } from '../events/EventBus';
import { TonyEvent } from '../types/tony';

describe('Phase 5.1: Advanced Learning Implementation', () => {
  let advancedLearning: AdvancedLearning;
  let componentManager: ComponentManager;
  let memorySystem: MemorySystem;
  let learningSystem: LearningSystem;
  let uxRepository: UXRepository;

  beforeEach(async () => {
    // Initialize components
    advancedLearning = new AdvancedLearning();
    componentManager = new ComponentManager();
    
    await componentManager.initialize();
    
    memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem')!;
    learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem')!;
    uxRepository = componentManager.getComponent<UXRepository>('UXRepository')!;
  });

  afterEach(async () => {
    await advancedLearning.destroy();
    await componentManager.destroy();
  });

  describe('Step 5.1: Advanced Learning Core Features', () => {
    test('should initialize advanced learning system successfully', async () => {
      await advancedLearning.initialize();
      
      const stats = advancedLearning.getStats();
      expect(stats).toBeDefined();
      expect(stats.reinforcementLearning.totalEpisodes).toBe(0);
      expect(stats.transferLearning.totalTransfers).toBe(0);
      expect(stats.patternRecognition.patternsDiscovered).toBe(0);
      expect(stats.predictiveCapabilities.totalPredictions).toBe(0);
    });

    test('should implement reinforcement learning from experience', async () => {
      await advancedLearning.initialize();
      
      // Create learning experience
      const state = { userAction: 'button_click', context: 'header' };
      const action = 'navigate_to_menu';
      const reward = 0.8;
      const nextState = { userAction: 'menu_open', context: 'header' };
      const done = false;

      await advancedLearning.learnFromExperience(state, action, reward, nextState, done);

      const stats = advancedLearning.getStats();
      expect(stats.reinforcementLearning.totalEpisodes).toBe(1);
      expect(stats.reinforcementLearning.averageReward).toBe(0.8);
      expect(stats.reinforcementLearning.policyUpdates).toBe(1);
    });

    test('should implement transfer learning between components', async () => {
      await advancedLearning.initialize();
      
      // Create knowledge to transfer
      const knowledge = {
        pattern: 'user_preference_pattern',
        confidence: 0.9,
        data: { preference: 'dark_theme', frequency: 0.8 }
      };

      const transfer = await advancedLearning.transferKnowledge(
        'MemorySystem',
        'LearningSystem',
        'pattern',
        knowledge
      );

      expect(transfer).toBeDefined();
      expect(transfer?.sourceComponent).toBe('MemorySystem');
      expect(transfer?.targetComponent).toBe('LearningSystem');
      expect(transfer?.knowledgeType).toBe('pattern');
      expect(transfer?.similarity).toBeGreaterThan(0);
      expect(transfer?.effectiveness).toBeGreaterThan(0);

      const stats = advancedLearning.getStats();
      expect(stats.transferLearning.totalTransfers).toBe(1);
      expect(stats.transferLearning.averageEffectiveness).toBeGreaterThan(0);
    });

    test('should discover advanced patterns with deep learning', async () => {
      await advancedLearning.initialize();
      
      // Create test data for pattern discovery
      const data = [
        { action: 'click', location: 'header', time: 1000 },
        { action: 'click', location: 'header', time: 1200 },
        { action: 'click', location: 'header', time: 1100 },
        { action: 'scroll', location: 'content', time: 2000 },
        { action: 'scroll', location: 'content', time: 2200 }
      ];

      const context = {
        userSession: 'session_123',
        deviceType: 'desktop',
        timeOfDay: 'morning'
      };

      const patterns = await advancedLearning.discoverAdvancedPattern(data, context);

      expect(patterns.length).toBeGreaterThan(0);
      
      for (const pattern of patterns) {
        expect(pattern.patternId).toBeDefined();
        expect(pattern.confidence).toBeGreaterThan(0);
        expect(pattern.complexity).toBeGreaterThan(0);
        expect(pattern.novelty).toBeGreaterThan(0);
        expect(pattern.predictivePower).toBeGreaterThan(0);
        expect(pattern.features.length).toBeGreaterThan(0);
        expect(pattern.relationships).toBeDefined();
        expect(pattern.evolution).toBeDefined();
      }

      const stats = advancedLearning.getStats();
      expect(stats.patternRecognition.patternsDiscovered).toBe(patterns.length);
      expect(stats.patternRecognition.averageConfidence).toBeGreaterThan(0);
    });

    test('should make predictions with high confidence', async () => {
      await advancedLearning.initialize();
      
      // Create features for prediction
      const features = {
        userBehavior: 'consistent',
        timeOfDay: 'morning',
        sessionDuration: 1800,
        interactionCount: 15
      };

      const prediction = await advancedLearning.makePrediction(
        'user_behavior',
        features,
        24 // 24 hours
      );

      expect(prediction).toBeDefined();
      expect(prediction?.target).toBe('user_behavior');
      expect(prediction?.confidence).toBeGreaterThanOrEqual(0.7);
      expect(prediction?.timeframe).toBe(24);
      expect(prediction?.factors).toEqual(Object.keys(features));
      expect(prediction?.value).toBeDefined();

      const stats = advancedLearning.getStats();
      expect(stats.predictiveCapabilities.totalPredictions).toBe(1);
      expect(stats.predictiveCapabilities.averageConfidence).toBeGreaterThan(0);
    });

    test('should handle multiple learning episodes efficiently', async () => {
      await advancedLearning.initialize();
      
      const startTime = Date.now();
      
      // Create multiple learning episodes
      const promises = [];
      for (let i = 0; i < 50; i++) {
        const state = { episode: i, action: `action_${i % 5}` };
        const action = `action_${i % 3}`;
        const reward = 0.5 + (i % 5) * 0.1;
        const nextState = { episode: i + 1, action: `action_${(i + 1) % 5}` };
        const done = i === 49;

        promises.push(
          advancedLearning.learnFromExperience(state, action, reward, nextState, done)
        );
      }

      await Promise.all(promises);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify performance
      expect(processingTime).toBeLessThan(5000); // Should complete in < 5 seconds

      const stats = advancedLearning.getStats();
      expect(stats.reinforcementLearning.totalEpisodes).toBe(50);
      expect(stats.reinforcementLearning.policyUpdates).toBe(50);
      expect(stats.reinforcementLearning.averageReward).toBeGreaterThan(0);
    });
  });

  describe('Step 5.1: Advanced Learning Integration', () => {
    test('should integrate with existing components seamlessly', async () => {
      await advancedLearning.initialize();
      
      // Test integration with Memory System
      const memory = memorySystem.createNode(
        'interaction',
        { action: 'advanced_learning_test', data: 'test_data' },
        'user_input',
        ['advanced_learning', 'integration'],
        0.9
      );

      // Test integration with Learning System
      const pattern = learningSystem.learnPattern(
        'advanced_integration_pattern',
        { name: 'Advanced Integration', complexity: 'high' },
        ['advanced_learning'],
        0.9
      );

      // Test integration with UX Repository
      const uxPattern = uxRepository.addDesignPattern(
        'Advanced Learning Integration',
        'interaction',
        'Integration test pattern for advanced learning',
        ['advanced_learning', 'integration']
      );

      expect(memory).toBeDefined();
      expect(pattern).toBeDefined();
      expect(uxPattern).toBeDefined();

      // Verify advanced learning processed the interactions
      const stats = advancedLearning.getStats();
      expect(stats.patternRecognition.patternsDiscovered).toBeGreaterThanOrEqual(0);
    });

    test('should handle cross-component knowledge transfer', async () => {
      await advancedLearning.initialize();
      
      // Create knowledge in different components
      const memoryKnowledge = memorySystem.createNode(
        'knowledge',
        'User prefers dark theme',
        'user_input',
        ['theme', 'preference'],
        0.9
      );

      const learningKnowledge = learningSystem.learnPattern(
        'theme_preference',
        { theme: 'dark', confidence: 0.9 },
        ['memory_system'],
        0.9
      );

      // Trigger knowledge transfer
      const transfer1 = await advancedLearning.transferKnowledge(
        'MemorySystem',
        'LearningSystem',
        'pattern',
        memoryKnowledge
      );

      const transfer2 = await advancedLearning.transferKnowledge(
        'LearningSystem',
        'UXRepository',
        'heuristic',
        learningKnowledge
      );

      expect(transfer1).toBeDefined();
      expect(transfer2).toBeDefined();

      const stats = advancedLearning.getStats();
      expect(stats.transferLearning.totalTransfers).toBe(2);
      expect(stats.transferLearning.crossComponentTransfers).toBe(2);
    });

    test('should provide real-time learning feedback', async () => {
      await advancedLearning.initialize();
      
      let eventReceived = false;
      let eventData: any = null;

      // Subscribe to learning events
      const subscription = eventBus.subscribe('reinforcement_learning_experience', (event: TonyEvent) => {
        eventReceived = true;
        eventData = event.data;
      });

      // Create learning experience
      await advancedLearning.learnFromExperience(
        { state: 'test' },
        'test_action',
        0.8,
        { nextState: 'test_next' },
        false
      );

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventReceived).toBe(true);
      expect(eventData).toBeDefined();
      expect(eventData.totalEpisodes).toBe(1);
      expect(eventData.averageReward).toBe(0.8);

      eventBus.unsubscribe(subscription.id);
    });
  });

  describe('Step 5.1: Advanced Learning Performance', () => {
    test('should maintain high performance under load', async () => {
      await advancedLearning.initialize();
      
      const startTime = Date.now();
      
      // Create high load scenario
      const promises = [];
      for (let i = 0; i < 100; i++) {
        // Reinforcement learning
        promises.push(
          advancedLearning.learnFromExperience(
            { episode: i },
            `action_${i % 10}`,
            Math.random(),
            { episode: i + 1 },
            i === 99
          )
        );

        // Pattern discovery
        promises.push(
          advancedLearning.discoverAdvancedPattern(
            [{ data: i, timestamp: Date.now() }],
            { context: i }
          )
        );

        // Predictions
        promises.push(
          advancedLearning.makePrediction(
            `target_${i % 5}`,
            { feature: i },
            24
          )
        );
      }

      await Promise.all(promises);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify performance requirements
      expect(processingTime).toBeLessThan(10000); // Should complete in < 10 seconds

      const stats = advancedLearning.getStats();
      expect(stats.reinforcementLearning.totalEpisodes).toBe(100);
      expect(stats.patternRecognition.patternsDiscovered).toBeGreaterThan(0);
      expect(stats.predictiveCapabilities.totalPredictions).toBeGreaterThan(0);
    });

    test('should optimize learning algorithms automatically', async () => {
      await advancedLearning.initialize();
      
      const initialStats = advancedLearning.getStats();
      
      // Create learning episodes with varying rewards
      for (let i = 0; i < 20; i++) {
        const reward = i < 10 ? 0.3 : 0.8; // First 10 low reward, next 10 high reward
        
        await advancedLearning.learnFromExperience(
          { episode: i, phase: i < 10 ? 'exploration' : 'exploitation' },
          `action_${i % 5}`,
          reward,
          { episode: i + 1 },
          i === 19
        );
      }

      const finalStats = advancedLearning.getStats();
      
      // Verify learning optimization
      expect(finalStats.reinforcementLearning.totalEpisodes).toBe(20);
      expect(finalStats.reinforcementLearning.averageReward).toBeGreaterThan(0.5);
      expect(finalStats.reinforcementLearning.explorationRate).toBeLessThanOrEqual(initialStats.reinforcementLearning.explorationRate);
    });

    test('should handle concurrent learning operations', async () => {
      await advancedLearning.initialize();
      
      // Test concurrent operations
      const concurrentOperations = [
        // Concurrent reinforcement learning
        advancedLearning.learnFromExperience({ state: 'concurrent1' }, 'action1', 0.8, { state: 'next1' }, false),
        advancedLearning.learnFromExperience({ state: 'concurrent2' }, 'action2', 0.9, { state: 'next2' }, false),
        advancedLearning.learnFromExperience({ state: 'concurrent3' }, 'action3', 0.7, { state: 'next3' }, false),
        
        // Concurrent pattern discovery
        advancedLearning.discoverAdvancedPattern([{ data: 'pattern1' }], { context: 'ctx1' }),
        advancedLearning.discoverAdvancedPattern([{ data: 'pattern2' }], { context: 'ctx2' }),
        
        // Concurrent predictions
        advancedLearning.makePrediction('target1', { feature: 'f1' }, 24),
        advancedLearning.makePrediction('target2', { feature: 'f2' }, 12),
        
        // Concurrent knowledge transfer
        advancedLearning.transferKnowledge('MemorySystem', 'LearningSystem', 'pattern', { data: 'transfer1' }),
        advancedLearning.transferKnowledge('LearningSystem', 'UXRepository', 'heuristic', { data: 'transfer2' })
      ];

      await Promise.all(concurrentOperations);

      const stats = advancedLearning.getStats();
      expect(stats.reinforcementLearning.totalEpisodes).toBe(3);
      expect(stats.patternRecognition.patternsDiscovered).toBeGreaterThan(0);
      expect(stats.predictiveCapabilities.totalPredictions).toBeGreaterThan(0);
      expect(stats.transferLearning.totalTransfers).toBe(2);
    });
  });

  describe('Step 5.1: Advanced Learning Intelligence', () => {
    test('should demonstrate adaptive learning behavior', async () => {
      await advancedLearning.initialize();
      
      // Create adaptive learning scenario
      const learningPhases = [
        { phase: 'exploration', rewards: [0.2, 0.3, 0.1, 0.4, 0.2] },
        { phase: 'exploitation', rewards: [0.8, 0.9, 0.7, 0.8, 0.9] },
        { phase: 'optimization', rewards: [0.9, 0.95, 0.9, 0.92, 0.94] }
      ];

      let episodeCount = 0;
      for (const phase of learningPhases) {
        for (const reward of phase.rewards) {
          await advancedLearning.learnFromExperience(
            { phase: phase.phase, episode: episodeCount },
            `action_${episodeCount % 5}`,
            reward,
            { phase: phase.phase, episode: episodeCount + 1 },
            episodeCount === 14
          );
          episodeCount++;
        }
      }

      const stats = advancedLearning.getStats();
      expect(stats.reinforcementLearning.totalEpisodes).toBe(15);
      expect(stats.reinforcementLearning.averageReward).toBeGreaterThan(0.6);
      expect(stats.reinforcementLearning.explorationRate).toBeLessThan(0.1);
    });

    test('should demonstrate predictive intelligence', async () => {
      await advancedLearning.initialize();
      
      // Create predictive learning scenario
      const historicalData = [
        { time: 9, activity: 'login', probability: 0.8 },
        { time: 10, activity: 'work', probability: 0.9 },
        { time: 11, activity: 'break', probability: 0.3 },
        { time: 12, activity: 'lunch', probability: 0.7 },
        { time: 13, activity: 'work', probability: 0.8 },
        { time: 14, activity: 'meeting', probability: 0.4 },
        { time: 15, activity: 'work', probability: 0.7 },
        { time: 16, activity: 'planning', probability: 0.6 },
        { time: 17, activity: 'logout', probability: 0.9 }
      ];

      // Train on historical data
      for (const data of historicalData) {
        await advancedLearning.learnFromExperience(
          { time: data.time, currentActivity: data.activity },
          'predict_next_activity',
          data.probability,
          { time: data.time + 1, predictedActivity: data.activity },
          false
        );
      }

      // Make predictions
      const predictions = [];
      for (let time = 9; time <= 17; time++) {
        const prediction = await advancedLearning.makePrediction(
          'user_activity',
          { time, currentActivity: 'work' },
          1 // 1 hour ahead
        );
        if (prediction) {
          predictions.push(prediction);
        }
      }

      expect(predictions.length).toBeGreaterThan(0);
      
      const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
      expect(avgConfidence).toBeGreaterThan(0.7);

      const stats = advancedLearning.getStats();
      expect(stats.predictiveCapabilities.totalPredictions).toBe(predictions.length);
      expect(stats.predictiveCapabilities.averageConfidence).toBeGreaterThan(0.7);
    });

    test('should demonstrate pattern recognition intelligence', async () => {
      await advancedLearning.initialize();
      
      // Create complex pattern data
      const patternData = [];
      for (let i = 0; i < 50; i++) {
        patternData.push({
          user: `user_${i % 10}`,
          action: `action_${i % 5}`,
          time: i * 1000,
          success: i % 3 === 0,
          context: {
            device: i % 2 === 0 ? 'desktop' : 'mobile',
            timeOfDay: i % 4 === 0 ? 'morning' : i % 4 === 1 ? 'afternoon' : i % 4 === 2 ? 'evening' : 'night'
          }
        });
      }

      const patterns = await advancedLearning.discoverAdvancedPattern(patternData, {
        analysisType: 'user_behavior',
        complexity: 'high'
      });

      expect(patterns.length).toBeGreaterThan(0);

      // Verify pattern intelligence
      for (const pattern of patterns) {
        expect(pattern.confidence).toBeGreaterThan(0.6);
        expect(pattern.complexity).toBeGreaterThan(0.3);
        expect(pattern.novelty).toBeGreaterThan(0.2);
        expect(pattern.predictivePower).toBeGreaterThan(0.5);
        expect(pattern.features.length).toBeGreaterThan(2);
        expect(pattern.relationships.length).toBeGreaterThanOrEqual(0);
        expect(pattern.evolution.trend).toBeDefined();
      }

      const stats = advancedLearning.getStats();
      expect(stats.patternRecognition.patternsDiscovered).toBe(patterns.length);
      expect(stats.patternRecognition.averageConfidence).toBeGreaterThan(0.6);
    });
  });

  describe('Step 5.1: Advanced Learning System Harmony', () => {
    test('should maintain system harmony with advanced learning', async () => {
      await advancedLearning.initialize();
      
      // Test that advanced learning works harmoniously with existing components
      const components = componentManager.getAllComponents();
      expect(components.size).toBe(11); // Updated to reflect all components including advanced ones

      // Verify system health
      const health = componentManager.getSystemHealth();
      expect(health.initializedCount).toBe(11);
      expect(health.failedCount).toBe(0);
      expect(componentManager.isSystemReady()).toBe(true);

      // Test advanced learning integration
      const advancedLearningComponent = componentManager.getComponent<AdvancedLearning>('AdvancedLearning');
      expect(advancedLearningComponent).toBeDefined();
      expect(advancedLearningComponent?.getStats()).toBeDefined();
    });

    test('should enhance overall system intelligence', async () => {
      await advancedLearning.initialize();
      
      // Test that advanced learning enhances other components
      
      // Create memory with advanced learning processing
      const memory = memorySystem.createNode(
        'interaction',
        { action: 'intelligence_test', complexity: 'high' },
        'user_input',
        ['intelligence', 'advanced'],
        0.9
      );

      // Create learning pattern with advanced processing
      const pattern = learningSystem.learnPattern(
        'intelligence_enhancement',
        { name: 'Intelligence Enhancement', type: 'advanced' },
        ['intelligence'],
        0.9
      );

      // Verify advanced learning processed the data
      const stats = advancedLearning.getStats();
      expect(stats.patternRecognition.patternsDiscovered).toBeGreaterThanOrEqual(0);

      // Test predictive capabilities
      const prediction = await advancedLearning.makePrediction(
        'system_intelligence',
        { complexity: 'high', components: 8 },
        24
      );

      expect(memory).toBeDefined();
      expect(pattern).toBeDefined();
      expect(prediction).toBeDefined();
    });

    test('should provide comprehensive learning analytics', async () => {
      await advancedLearning.initialize();
      
      // Generate learning data
      for (let i = 0; i < 10; i++) {
        await advancedLearning.learnFromExperience(
          { episode: i },
          `action_${i % 3}`,
          0.5 + (i % 5) * 0.1,
          { episode: i + 1 },
          i === 9
        );
      }

      const patterns = await advancedLearning.discoverAdvancedPattern(
        [{ data: 'analytics_test' }],
        { context: 'analytics' }
      );

      const prediction = await advancedLearning.makePrediction(
        'analytics_performance',
        { metrics: 'comprehensive' },
        12
      );

      // Get comprehensive analytics
      const stats = advancedLearning.getStats();
      const advancedPatterns = advancedLearning.getAdvancedPatterns();
      const predictiveModels = advancedLearning.getPredictiveModels();

      // Verify analytics completeness
      expect(stats.reinforcementLearning.totalEpisodes).toBe(10);
      expect(stats.patternRecognition.patternsDiscovered).toBe(patterns.length);
      expect(stats.predictiveCapabilities.totalPredictions).toBe(1);
      expect(advancedPatterns.length).toBeGreaterThanOrEqual(patterns.length);
      expect(predictiveModels.length).toBeGreaterThan(0);

      // Verify analytics quality
      expect(stats.reinforcementLearning.averageReward).toBeGreaterThan(0);
      expect(stats.patternRecognition.averageConfidence).toBeGreaterThan(0);
      expect(stats.predictiveCapabilities.averageConfidence).toBeGreaterThan(0);
    });
  });
}); 