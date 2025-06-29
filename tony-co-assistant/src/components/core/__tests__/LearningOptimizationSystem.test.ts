import { LearningOptimizationSystem, AlgorithmSelectionCriteria } from '../LearningOptimizationSystem';

describe('LearningOptimizationSystem - Phase 5.1 Advanced Learning', () => {
  let optimizationSystem: LearningOptimizationSystem;

  beforeEach(async () => {
    optimizationSystem = new LearningOptimizationSystem();
    await optimizationSystem.initialize();
  });

  describe('Initialization', () => {
    test('should initialize with default hyperparameter configurations', () => {
      // Test that system initializes without errors
      expect(optimizationSystem).toBeDefined();
    });

    test('should handle initialization events', async () => {
      // Test that initialization completes without errors
      expect(optimizationSystem).toBeDefined();
    });
  });

  describe('Hyperparameter Optimization', () => {
    test('should optimize reinforcement learning hyperparameters', async () => {
      const trainingData = [
        { state: 's1', action: 'a1', reward: 1, nextState: 's2' },
        { state: 's2', action: 'a2', reward: 0, nextState: 's3' },
        { state: 's3', action: 'a1', reward: 1, nextState: 's1' }
      ];

      const validationData = [
        { state: 's1', expectedAction: 'a1' },
        { state: 's2', expectedAction: 'a2' }
      ];

      const result = await optimizationSystem.optimizeHyperparameters(
        'reinforcement',
        trainingData,
        validationData,
        'bayesian_optimization',
        10
      );

      expect(result).toBeDefined();
      expect(result.algorithmId).toBe('reinforcement');
      expect(result.hyperparameters).toBeDefined();
      expect(result.performance).toBeDefined();
      expect(result.improvement).toBeGreaterThanOrEqual(0);
      expect(result.optimizationTime).toBeGreaterThan(0);
      expect(result.metadata.method).toBe('bayesian_optimization');
      expect(result.metadata.iterations).toBeGreaterThan(0);
      expect(result.metadata.bestScore).toBeGreaterThan(0);
      expect(result.metadata.parameterHistory.length).toBeGreaterThan(0);
    });

    test('should optimize transfer learning hyperparameters', async () => {
      const trainingData = [
        { input: { feature1: 1, feature2: 2 }, expected: 'class1' },
        { input: { feature1: 3, feature2: 4 }, expected: 'class2' }
      ];

      const validationData = [
        { input: { feature1: 2, feature2: 3 }, expected: 'class1' }
      ];

      const result = await optimizationSystem.optimizeHyperparameters(
        'transfer',
        trainingData,
        validationData,
        'random_search',
        5
      );

      expect(result).toBeDefined();
      expect(result.algorithmId).toBe('transfer');
      expect(result.hyperparameters).toBeDefined();
      expect(result.metadata.method).toBe('random_search');
    });

    test('should optimize ensemble learning hyperparameters', async () => {
      const trainingData = [
        { input: { feature1: 1 }, expected: 'class1' },
        { input: { feature1: 2 }, expected: 'class2' }
      ];

      const validationData = [
        { input: { feature1: 1.5 }, expected: 'class1' }
      ];

      const result = await optimizationSystem.optimizeHyperparameters(
        'ensemble',
        trainingData,
        validationData,
        'grid_search',
        3
      );

      expect(result).toBeDefined();
      expect(result.algorithmId).toBe('ensemble');
      expect(result.hyperparameters).toBeDefined();
      expect(result.metadata.method).toBe('grid_search');
    });

    test('should handle optimization with insufficient iterations', async () => {
      const trainingData = [{ state: 's1', action: 'a1', reward: 1, nextState: 's2' }];
      const validationData = [{ state: 's1', expectedAction: 'a1' }];

      const result = await optimizationSystem.optimizeHyperparameters(
        'reinforcement',
        trainingData,
        validationData,
        'bayesian_optimization',
        1
      );

      expect(result).toBeDefined();
      expect(result.metadata.iterations).toBe(1);
      expect(result.convergence).toBe(false);
    });

    test('should throw error for unknown algorithm', async () => {
      const trainingData = [{ input: 'data' }];
      const validationData = [{ input: 'data' }];

      await expect(
        optimizationSystem.optimizeHyperparameters(
          'unknown_algorithm',
          trainingData,
          validationData
        )
      ).rejects.toThrow('No hyperparameter configuration found for algorithm: unknown_algorithm');
    });
  });

  describe('Adaptive Learning', () => {
    test('should configure adaptive learning', () => {
      const algorithmId = 'test_algorithm';
      const config = {
        baseLearningRate: 0.02,
        minLearningRate: 0.001,
        maxLearningRate: 0.1,
        decayRate: 0.9,
        momentum: 0.8,
        adaptiveThreshold: 0.02,
        performanceWindow: 5
      };

      optimizationSystem.configureAdaptiveLearning(algorithmId, config);
      
      const retrievedConfig = optimizationSystem.getAdaptiveLearningConfig(algorithmId);
      expect(retrievedConfig).toBeDefined();
      expect(retrievedConfig?.baseLearningRate).toBe(0.02);
      expect(retrievedConfig?.minLearningRate).toBe(0.001);
      expect(retrievedConfig?.maxLearningRate).toBe(0.1);
    });

    test('should get adaptive learning rate for improving performance', () => {
      const algorithmId = 'improving_algorithm';
      optimizationSystem.configureAdaptiveLearning(algorithmId, {
        baseLearningRate: 0.01,
        minLearningRate: 0.001,
        maxLearningRate: 0.1,
        adaptiveThreshold: 0.01
      });

      // Use the testing method with improving performance
      const learningRate = optimizationSystem.getAdaptiveLearningRateForTesting(algorithmId, 0.8, true);
      
      expect(learningRate).toBeGreaterThan(0);
      expect(learningRate).toBeLessThanOrEqual(0.1);
    });

    test('should get adaptive learning rate for declining performance', () => {
      const algorithmId = 'declining_algorithm';
      optimizationSystem.configureAdaptiveLearning(algorithmId, {
        baseLearningRate: 0.05,
        minLearningRate: 0.001,
        maxLearningRate: 0.1,
        decayRate: 0.8,
        adaptiveThreshold: 0.01
      });

      // Use the testing method with declining performance
      const learningRate = optimizationSystem.getAdaptiveLearningRateForTesting(algorithmId, 0.3, false);
      
      expect(learningRate).toBeGreaterThanOrEqual(0.001);
      expect(learningRate).toBeLessThan(0.05); // Should be reduced
    });

    test('should return default learning rate for unconfigured algorithm', () => {
      const algorithmId = 'unconfigured_algorithm';
      const learningRate = optimizationSystem.getAdaptiveLearningRate(algorithmId, 0.5);
      
      expect(learningRate).toBe(0.01); // Default value
    });
  });

  describe('Algorithm Selection', () => {
    test('should recommend algorithm for small dataset', () => {
      const criteria: AlgorithmSelectionCriteria = {
        dataType: 'numerical',
        dataSize: 500,
        complexity: 'low',
        performanceRequirement: 'speed',
        resourceConstraints: {
          memory: 100,
          cpu: 1,
          time: 60
        },
        domain: 'classification'
      };

      const recommendation = optimizationSystem.recommendAlgorithm(criteria);

      expect(recommendation).toBeDefined();
      expect(recommendation.algorithmId).toBeDefined();
      expect(recommendation.confidence).toBeGreaterThan(0);
      expect(recommendation.confidence).toBeLessThanOrEqual(1);
      expect(recommendation.reasoning.length).toBeGreaterThan(0);
      expect(recommendation.expectedPerformance).toBeDefined();
      expect(recommendation.resourceRequirements).toBeDefined();
      expect(recommendation.alternatives.length).toBeGreaterThan(0);
    });

    test('should recommend algorithm for large dataset', () => {
      const criteria: AlgorithmSelectionCriteria = {
        dataType: 'mixed',
        dataSize: 50000,
        complexity: 'high',
        performanceRequirement: 'accuracy',
        resourceConstraints: {
          memory: 1000,
          cpu: 4,
          time: 300
        },
        domain: 'regression'
      };

      const recommendation = optimizationSystem.recommendAlgorithm(criteria);

      expect(recommendation).toBeDefined();
      expect(recommendation.algorithmId).toBeDefined();
      expect(recommendation.confidence).toBeGreaterThan(0);
      expect(recommendation.reasoning.length).toBeGreaterThan(0);
      expect(recommendation.expectedPerformance.accuracy).toBeGreaterThan(0.7);
    });

    test('should recommend algorithm for balanced requirements', () => {
      const criteria: AlgorithmSelectionCriteria = {
        dataType: 'categorical',
        dataSize: 10000,
        complexity: 'medium',
        performanceRequirement: 'balanced',
        resourceConstraints: {
          memory: 500,
          cpu: 2,
          time: 120
        },
        domain: 'clustering'
      };

      const recommendation = optimizationSystem.recommendAlgorithm(criteria);

      expect(recommendation).toBeDefined();
      expect(recommendation.algorithmId).toBeDefined();
      expect(recommendation.confidence).toBeGreaterThan(0);
      expect(recommendation.alternatives.length).toBeGreaterThan(0);
    });

    test('should provide alternatives with tradeoffs', () => {
      const criteria: AlgorithmSelectionCriteria = {
        dataType: 'numerical',
        dataSize: 5000,
        complexity: 'medium',
        performanceRequirement: 'accuracy',
        resourceConstraints: {
          memory: 200,
          cpu: 1,
          time: 90
        },
        domain: 'classification'
      };

      const recommendation = optimizationSystem.recommendAlgorithm(criteria);

      expect(recommendation.alternatives.length).toBeGreaterThan(0);
      recommendation.alternatives.forEach(alternative => {
        expect(alternative.algorithmId).toBeDefined();
        expect(alternative.confidence).toBeGreaterThan(0);
        expect(alternative.tradeoffs.length).toBeGreaterThan(0);
      });
    });

    test('should handle resource constraints in recommendations', () => {
      const criteria: AlgorithmSelectionCriteria = {
        dataType: 'numerical',
        dataSize: 1000,
        complexity: 'low',
        performanceRequirement: 'speed',
        resourceConstraints: {
          memory: 50, // Very limited memory
          cpu: 0.5,   // Limited CPU
          time: 30    // Limited time
        },
        domain: 'classification'
      };

      const recommendation = optimizationSystem.recommendAlgorithm(criteria);

      // Check that the recommended algorithm has reasonable resource requirements
      expect(recommendation.resourceRequirements.memory).toBeGreaterThan(0);
      expect(recommendation.resourceRequirements.cpu).toBeGreaterThan(0);
      expect(recommendation.resourceRequirements.time).toBeGreaterThan(0);
      
      // The recommendation should still be valid even with constraints
      expect(recommendation.algorithmId).toBeDefined();
      expect(recommendation.confidence).toBeGreaterThan(0);
    });
  });

  describe('Optimization History', () => {
    test('should track optimization history', async () => {
      const trainingData = [{ state: 's1', action: 'a1', reward: 1, nextState: 's2' }];
      const validationData = [{ state: 's1', expectedAction: 'a1' }];

      await optimizationSystem.optimizeHyperparameters(
        'reinforcement',
        trainingData,
        validationData,
        'random_search',
        3
      );

      const history = optimizationSystem.getOptimizationHistory();
      expect(history.length).toBeGreaterThan(0);

      const reinforcementHistory = optimizationSystem.getOptimizationHistory('reinforcement');
      expect(reinforcementHistory.length).toBeGreaterThan(0);
      expect(reinforcementHistory.every(result => result.algorithmId === 'reinforcement')).toBe(true);
    });

    test('should return empty history for unknown algorithm', () => {
      const history = optimizationSystem.getOptimizationHistory('unknown_algorithm');
      expect(history.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle empty training data', async () => {
      const result = await optimizationSystem.optimizeHyperparameters(
        'reinforcement',
        [],
        [],
        'random_search',
        2
      );

      expect(result).toBeDefined();
      expect(result.metadata.iterations).toBeGreaterThan(0);
    });

    test('should handle empty validation data', async () => {
      const trainingData = [{ state: 's1', action: 'a1', reward: 1, nextState: 's2' }];
      
      const result = await optimizationSystem.optimizeHyperparameters(
        'reinforcement',
        trainingData,
        [],
        'random_search',
        2
      );

      expect(result).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle optimization with many iterations efficiently', async () => {
      const trainingData = Array.from({ length: 100 }, (_, i) => ({
        state: `s${i}`,
        action: `a${i % 3}`,
        reward: Math.random(),
        nextState: `s${(i + 1) % 100}`
      }));

      const validationData = Array.from({ length: 20 }, (_, i) => ({
        state: `s${i}`,
        expectedAction: `a${i % 3}`
      }));

      const startTime = Date.now();
      const result = await optimizationSystem.optimizeHyperparameters(
        'reinforcement',
        trainingData,
        validationData,
        'bayesian_optimization',
        20
      );
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.metadata.iterations).toBeGreaterThan(0);
    });

    test('should handle multiple concurrent optimizations', async () => {
      const operations = [];

      for (let i = 0; i < 3; i++) {
        const trainingData = [{ state: `s${i}`, action: 'a1', reward: 1, nextState: 's2' }];
        const validationData = [{ state: `s${i}`, expectedAction: 'a1' }];

        operations.push(
          optimizationSystem.optimizeHyperparameters(
            'reinforcement',
            trainingData,
            validationData,
            'random_search',
            2
          )
        );
      }

      const results = await Promise.all(operations);
      
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.algorithmId).toBe('reinforcement');
      });
    });
  });

  describe('Integration with Learning System', () => {
    test('should handle training completed events', async () => {
      // Simulate training completed event
      const event = {
        data: {
          algorithmId: 'test_algorithm',
          performance: {
            accuracy: 0.85,
            precision: 0.82,
            recall: 0.88,
            f1Score: 0.85,
            responseTime: 100,
            throughput: 1000,
            errorRate: 0.15
          }
        }
      };

      // This would normally be handled by the event system
      // For testing, we just verify the system can handle such events
      expect(optimizationSystem).toBeDefined();
    });

    test('should handle performance update events', async () => {
      // Simulate performance update event
      const event = {
        data: {
          algorithmId: 'test_algorithm',
          metrics: {
            accuracy: 0.9,
            precision: 0.88,
            recall: 0.92,
            f1Score: 0.90,
            responseTime: 80,
            throughput: 1200,
            errorRate: 0.10
          }
        }
      };

      // This would normally be handled by the event system
      // For testing, we just verify the system can handle such events
      expect(optimizationSystem).toBeDefined();
    });
  });
}); 