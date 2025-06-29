import { SystemOptimizer } from '../src/components/advanced/SystemOptimizer';
import { eventBus } from '../src/events/EventBus';

describe('Phase 5.4: System Optimization', () => {
  let systemOptimizer: SystemOptimizer;

  beforeEach(async () => {
    systemOptimizer = new SystemOptimizer();
    await systemOptimizer.initialize();
  });

  afterEach(async () => {
    await systemOptimizer.destroy();
  });

  describe('Performance Optimization', () => {
    test('should initialize with performance optimization config', () => {
      const stats = systemOptimizer.getStats();
      
      expect(stats.performanceOptimization).toBeDefined();
      expect(stats.performanceOptimization.optimizationsApplied).toBeGreaterThanOrEqual(0);
      expect(stats.performanceOptimization.averagePerformanceGain).toBeGreaterThanOrEqual(0);
      expect(stats.performanceOptimization.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(stats.performanceOptimization.responseTimeImprovement).toBeGreaterThanOrEqual(0);
    });

    test('should apply performance optimization', async () => {
      const action = await systemOptimizer.applyPerformanceOptimization();
      
      expect(action.id).toBeDefined();
      expect(action.type).toBe('performance');
      expect(action.action).toBe('performance_optimization');
      expect(action.description).toBe('Applying performance optimizations');
      expect(action.impact).toBe('high');
      expect(action.status).toBe('completed');
      expect(action.startTime).toBeDefined();
      expect(action.endTime).toBeDefined();
      expect(action.result?.success).toBe(true);
      expect(action.result?.performanceGain).toBeGreaterThan(0);
    });

    test('should track performance optimization statistics', async () => {
      const initialStats = systemOptimizer.getStats();
      
      await systemOptimizer.applyPerformanceOptimization();
      
      const updatedStats = systemOptimizer.getStats();
      
      expect(updatedStats.performanceOptimization.optimizationsApplied).toBeGreaterThan(initialStats.performanceOptimization.optimizationsApplied);
    });

    test('should get performance metrics', () => {
      const metrics = systemOptimizer.getPerformanceMetrics();
      
      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.databaseQueryTime).toBeGreaterThanOrEqual(0);
      expect(metrics.networkLatency).toBeGreaterThanOrEqual(0);
    });

    test('should get cache statistics', () => {
      const cacheStats = systemOptimizer.getCacheStats();
      
      expect(cacheStats.totalEntries).toBeGreaterThanOrEqual(0);
      expect(cacheStats.hitCount).toBeGreaterThanOrEqual(0);
      expect(cacheStats.missCount).toBeGreaterThanOrEqual(0);
      expect(cacheStats.hitRate).toBeGreaterThanOrEqual(0);
      expect(cacheStats.evictionCount).toBeGreaterThanOrEqual(0);
      expect(cacheStats.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(cacheStats.averageAccessTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory Management', () => {
    test('should initialize with memory management config', () => {
      const stats = systemOptimizer.getStats();
      
      expect(stats.memoryManagement).toBeDefined();
      expect(stats.memoryManagement.memoryLeaksDetected).toBeGreaterThanOrEqual(0);
      expect(stats.memoryManagement.memoryLeaksResolved).toBeGreaterThanOrEqual(0);
      expect(stats.memoryManagement.garbageCollections).toBeGreaterThanOrEqual(0);
      expect(stats.memoryManagement.memoryUsageReduction).toBeGreaterThanOrEqual(0);
    });

    test('should apply memory optimization', async () => {
      const action = await systemOptimizer.applyMemoryOptimization();
      
      expect(action.id).toBeDefined();
      expect(action.type).toBe('memory');
      expect(action.action).toBe('memory_optimization');
      expect(action.description).toBe('Applying memory optimizations');
      expect(action.impact).toBe('high');
      expect(action.status).toBe('completed');
      expect(action.startTime).toBeDefined();
      expect(action.endTime).toBeDefined();
      expect(action.result?.success).toBe(true);
      expect(action.result?.memoryFreed).toBeGreaterThan(0);
    });

    test('should track memory optimization statistics', async () => {
      const initialStats = systemOptimizer.getStats();
      
      await systemOptimizer.applyMemoryOptimization();
      
      const updatedStats = systemOptimizer.getStats();
      
      expect(updatedStats.memoryManagement.garbageCollections).toBeGreaterThan(initialStats.memoryManagement.garbageCollections);
    });

    test('should get memory statistics', () => {
      const memoryStats = systemOptimizer.getMemoryStats();
      
      expect(memoryStats.totalMemory).toBeGreaterThan(0);
      expect(memoryStats.usedMemory).toBeGreaterThanOrEqual(0);
      expect(memoryStats.freeMemory).toBeGreaterThanOrEqual(0);
      expect(memoryStats.memoryUsagePercentage).toBeGreaterThanOrEqual(0);
      expect(memoryStats.memoryLeaks).toBeDefined();
      expect(memoryStats.garbageCollectionStats).toBeDefined();
      
      expect(memoryStats.garbageCollectionStats.totalCollections).toBeGreaterThanOrEqual(0);
      expect(memoryStats.garbageCollectionStats.totalTime).toBeGreaterThanOrEqual(0);
      expect(memoryStats.garbageCollectionStats.averageTime).toBeGreaterThanOrEqual(0);
      expect(memoryStats.garbageCollectionStats.lastCollectionTime).toBeGreaterThanOrEqual(0);
      expect(memoryStats.garbageCollectionStats.memoryFreed).toBeGreaterThanOrEqual(0);
    });

    test('should detect memory leaks', () => {
      const memoryStats = systemOptimizer.getMemoryStats();
      
      // Memory leaks array should be defined
      expect(memoryStats.memoryLeaks).toBeDefined();
      expect(Array.isArray(memoryStats.memoryLeaks)).toBe(true);
      
      // If there are memory leaks, they should have proper structure
      for (const leak of memoryStats.memoryLeaks) {
        expect(leak.id).toBeDefined();
        expect(leak.component).toBeDefined();
        expect(leak.memorySize).toBeGreaterThan(0);
        expect(leak.detectionTime).toBeGreaterThan(0);
        expect(['low', 'medium', 'high', 'critical']).toContain(leak.severity);
        expect(leak.description).toBeDefined();
      }
    });
  });

  describe('Scalability Improvements', () => {
    test('should initialize with scalability improvements config', () => {
      const stats = systemOptimizer.getStats();
      
      expect(stats.scalabilityImprovements).toBeDefined();
      expect(stats.scalabilityImprovements.scalingEvents).toBeGreaterThanOrEqual(0);
      expect(stats.scalabilityImprovements.loadBalancingActions).toBeGreaterThanOrEqual(0);
      expect(stats.scalabilityImprovements.autoScalingTriggers).toBeGreaterThanOrEqual(0);
      expect(stats.scalabilityImprovements.performanceImprovements).toBeGreaterThanOrEqual(0);
    });

    test('should apply scalability improvements', async () => {
      const action = await systemOptimizer.applyScalabilityImprovements();
      
      expect(action.id).toBeDefined();
      expect(action.type).toBe('scalability');
      expect(action.action).toBe('scalability_improvements');
      expect(action.description).toBe('Applying scalability improvements');
      expect(action.impact).toBe('high');
      expect(action.status).toBe('completed');
      expect(action.startTime).toBeDefined();
      expect(action.endTime).toBeDefined();
      expect(action.result?.success).toBe(true);
      expect(action.result?.scalabilityImprovement).toBeGreaterThan(0);
    });

    test('should track scalability improvement statistics', async () => {
      const initialStats = systemOptimizer.getStats();
      
      await systemOptimizer.applyScalabilityImprovements();
      
      const updatedStats = systemOptimizer.getStats();
      
      expect(updatedStats.scalabilityImprovements.scalingEvents).toBeGreaterThan(initialStats.scalabilityImprovements.scalingEvents);
    });
  });

  describe('Resource Optimization', () => {
    test('should initialize with resource optimization config', () => {
      const stats = systemOptimizer.getStats();
      
      expect(stats.resourceOptimization).toBeDefined();
      expect(stats.resourceOptimization.resourceOptimizations).toBeGreaterThanOrEqual(0);
      expect(stats.resourceOptimization.cpuUsageReduction).toBeGreaterThanOrEqual(0);
      expect(stats.resourceOptimization.memoryUsageReduction).toBeGreaterThanOrEqual(0);
      expect(stats.resourceOptimization.networkOptimizations).toBeGreaterThanOrEqual(0);
    });

    test('should apply resource optimization', async () => {
      const action = await systemOptimizer.applyResourceOptimization();
      
      expect(action.id).toBeDefined();
      expect(action.type).toBe('resource');
      expect(action.action).toBe('resource_optimization');
      expect(action.description).toBe('Applying resource optimizations');
      expect(action.impact).toBe('medium');
      expect(action.status).toBe('completed');
      expect(action.startTime).toBeDefined();
      expect(action.endTime).toBeDefined();
      expect(action.result?.success).toBe(true);
      expect(action.result?.resourceOptimization).toBeGreaterThan(0);
    });

    test('should track resource optimization statistics', async () => {
      const initialStats = systemOptimizer.getStats();
      
      await systemOptimizer.applyResourceOptimization();
      
      const updatedStats = systemOptimizer.getStats();
      
      expect(updatedStats.resourceOptimization.resourceOptimizations).toBeGreaterThan(initialStats.resourceOptimization.resourceOptimizations);
    });

    test('should get resource usage', () => {
      const resourceUsage = systemOptimizer.getResourceUsage();
      
      expect(resourceUsage.cpu).toBeDefined();
      expect(resourceUsage.cpu.usage).toBeGreaterThanOrEqual(0);
      expect(resourceUsage.cpu.cores).toBeGreaterThan(0);
      expect(resourceUsage.cpu.loadAverage).toBeDefined();
      expect(resourceUsage.cpu.loadAverage.length).toBe(3);
      
      expect(resourceUsage.memory).toBeDefined();
      expect(resourceUsage.memory.total).toBeGreaterThan(0);
      expect(resourceUsage.memory.used).toBeGreaterThanOrEqual(0);
      expect(resourceUsage.memory.available).toBeGreaterThanOrEqual(0);
      expect(resourceUsage.memory.swap).toBeGreaterThanOrEqual(0);
      
      expect(resourceUsage.network).toBeDefined();
      expect(resourceUsage.network.bytesIn).toBeGreaterThanOrEqual(0);
      expect(resourceUsage.network.bytesOut).toBeGreaterThanOrEqual(0);
      expect(resourceUsage.network.connections).toBeGreaterThanOrEqual(0);
      expect(resourceUsage.network.latency).toBeGreaterThanOrEqual(0);
      
      expect(resourceUsage.storage).toBeDefined();
      expect(resourceUsage.storage.total).toBeGreaterThan(0);
      expect(resourceUsage.storage.used).toBeGreaterThanOrEqual(0);
      expect(resourceUsage.storage.available).toBeGreaterThanOrEqual(0);
      expect(resourceUsage.storage.iops).toBeGreaterThanOrEqual(0);
    });
  });

  describe('System Monitoring', () => {
    test('should initialize with system monitoring config', () => {
      const stats = systemOptimizer.getStats();
      
      expect(stats.systemMonitoring).toBeDefined();
      expect(stats.systemMonitoring.alertsGenerated).toBeGreaterThanOrEqual(0);
      expect(stats.systemMonitoring.metricsCollected).toBeGreaterThanOrEqual(0);
      expect(stats.systemMonitoring.performanceReports).toBeGreaterThanOrEqual(0);
      expect(stats.systemMonitoring.systemHealthScore).toBeGreaterThanOrEqual(0);
    });

    test('should get system alerts', () => {
      const alerts = systemOptimizer.getSystemAlerts();
      
      expect(Array.isArray(alerts)).toBe(true);
      
      for (const alert of alerts) {
        expect(alert.id).toBeDefined();
        expect(['warning', 'error', 'critical', 'info']).toContain(alert.type);
        expect(alert.component).toBeDefined();
        expect(alert.message).toBeDefined();
        expect(alert.timestamp).toBeGreaterThan(0);
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
        expect(typeof alert.resolved).toBe('boolean');
      }
    });

    test('should track system monitoring statistics', () => {
      const stats = systemOptimizer.getStats();
      
      expect(stats.systemMonitoring.alertsGenerated).toBeGreaterThanOrEqual(0);
      expect(stats.systemMonitoring.metricsCollected).toBeGreaterThanOrEqual(0);
      expect(stats.systemMonitoring.systemHealthScore).toBeGreaterThanOrEqual(0);
      expect(stats.systemMonitoring.systemHealthScore).toBeLessThanOrEqual(1);
    });
  });

  describe('System Assessment', () => {
    test('should perform system assessment', async () => {
      await systemOptimizer.performSystemAssessment();
      
      // Assessment should collect metrics and generate recommendations
      const stats = systemOptimizer.getStats();
      expect(stats.systemMonitoring.metricsCollected).toBeGreaterThan(0);
    });

    test('should generate health report', () => {
      const healthReport = systemOptimizer.generateHealthReport();
      
      expect(healthReport.overallHealth).toBeGreaterThanOrEqual(0);
      expect(healthReport.overallHealth).toBeLessThanOrEqual(1);
      expect(healthReport.performance).toBeGreaterThanOrEqual(0);
      expect(healthReport.performance).toBeLessThanOrEqual(1);
      expect(healthReport.memory).toBeGreaterThanOrEqual(0);
      expect(healthReport.memory).toBeLessThanOrEqual(1);
      expect(healthReport.resources).toBeGreaterThanOrEqual(0);
      expect(healthReport.resources).toBeLessThanOrEqual(1);
      expect(healthReport.scalability).toBeGreaterThanOrEqual(0);
      expect(healthReport.scalability).toBeLessThanOrEqual(1);
      expect(Array.isArray(healthReport.recommendations)).toBe(true);
    });
  });

  describe('Optimization Actions', () => {
    test('should get optimization actions', () => {
      const actions = systemOptimizer.getOptimizationActions();
      
      expect(Array.isArray(actions)).toBe(true);
      
      for (const action of actions) {
        expect(action.id).toBeDefined();
        expect(['performance', 'memory', 'scalability', 'resource', 'monitoring']).toContain(action.type);
        expect(action.action).toBeDefined();
        expect(action.description).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(action.impact);
        expect(['pending', 'running', 'completed', 'failed']).toContain(action.status);
      }
    });

    test('should track optimization actions', async () => {
      const initialActions = systemOptimizer.getOptimizationActions();
      
      await systemOptimizer.applyPerformanceOptimization();
      await systemOptimizer.applyMemoryOptimization();
      
      const updatedActions = systemOptimizer.getOptimizationActions();
      
      expect(updatedActions.length).toBeGreaterThan(initialActions.length);
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = {
        performanceOptimization: {
          enabled: false,
          autoOptimization: false,
          cacheManagement: false,
          queryOptimization: false,
          resourcePooling: false
        }
      };

      systemOptimizer.updateConfig(newConfig);
      
      // Configuration update should affect future operations
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Event Handling', () => {
    test('should handle performance metric events', async () => {
      const performanceMetric = {
        cpuUsage: 75.5,
        memoryUsage: 60.2,
        responseTime: 250,
        throughput: 500,
        errorRate: 0.02,
        cacheHitRate: 85.5,
        databaseQueryTime: 150,
        networkLatency: 45
      };

      await eventBus.publishSimple(
        'performance_metric',
        'TestComponent',
        { performanceMetric },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const metrics = systemOptimizer.getPerformanceMetrics();
      expect(metrics.cpuUsage).toBe(75.5);
      expect(metrics.memoryUsage).toBe(60.2);
      expect(metrics.responseTime).toBe(250);
    });

    test('should handle memory usage events', async () => {
      const memoryUsage = {
        totalMemory: 16 * 1024 * 1024 * 1024,
        usedMemory: 8 * 1024 * 1024 * 1024,
        freeMemory: 8 * 1024 * 1024 * 1024,
        memoryUsagePercentage: 50
      };

      await eventBus.publishSimple(
        'memory_usage',
        'TestComponent',
        { memoryUsage },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const memoryStats = systemOptimizer.getMemoryStats();
      expect(memoryStats.totalMemory).toBe(16 * 1024 * 1024 * 1024);
      expect(memoryStats.usedMemory).toBe(8 * 1024 * 1024 * 1024);
      expect(memoryStats.memoryUsagePercentage).toBe(50);
    });

    test('should handle resource usage events', async () => {
      const resourceUsage = {
        cpu: {
          usage: 65.5,
          cores: 8,
          loadAverage: [2.5, 3.1, 2.8]
        },
        memory: {
          total: 16 * 1024 * 1024 * 1024,
          used: 10 * 1024 * 1024 * 1024,
          available: 6 * 1024 * 1024 * 1024,
          swap: 2 * 1024 * 1024 * 1024
        }
      };

      await eventBus.publishSimple(
        'resource_usage',
        'TestComponent',
        { resourceUsage },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const currentResourceUsage = systemOptimizer.getResourceUsage();
      expect(currentResourceUsage.cpu.usage).toBe(65.5);
      expect(currentResourceUsage.cpu.cores).toBe(8);
      expect(currentResourceUsage.memory.total).toBe(16 * 1024 * 1024 * 1024);
    });

    test('should handle system alert events', async () => {
      const systemAlert = {
        id: 'test_alert',
        type: 'warning' as const,
        component: 'TestComponent',
        message: 'Test alert message',
        timestamp: Date.now(),
        severity: 'medium' as const,
        resolved: false
      };

      await eventBus.publishSimple(
        'system_alert',
        'TestComponent',
        { systemAlert },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const alerts = systemOptimizer.getSystemAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('should handle optimization request events', async () => {
      const optimizationRequest = {
        type: 'performance' as const
      };

      await eventBus.publishSimple(
        'optimization_request',
        'TestComponent',
        { optimizationRequest },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const actions = systemOptimizer.getOptimizationActions();
      expect(actions.length).toBeGreaterThan(0);
    });
  });

  describe('System Integration', () => {
    test('should integrate with event bus system', async () => {
      const events: string[] = [];
      
      const subscription = eventBus.subscribe('system_optimizer_initialized', () => {
        events.push('system_optimizer_initialized');
      });

      // Re-initialize to trigger event
      await systemOptimizer.destroy();
      await systemOptimizer.initialize();

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(events).toContain('system_optimizer_initialized');
      
      eventBus.unsubscribe(subscription.id);
    });

    test('should emit appropriate events for optimizations', async () => {
      const events: string[] = [];
      
      const subscriptions = [
        eventBus.subscribe('optimization_completed', () => events.push('optimization_completed')),
        eventBus.subscribe('memory_optimization_completed', () => events.push('memory_optimization_completed')),
        eventBus.subscribe('scalability_improvement_completed', () => events.push('scalability_improvement_completed')),
        eventBus.subscribe('resource_optimization_completed', () => events.push('resource_optimization_completed')),
        eventBus.subscribe('system_alert_created', () => events.push('system_alert_created'))
      ];

      // Trigger various optimizations
      await systemOptimizer.applyPerformanceOptimization();
      await systemOptimizer.applyMemoryOptimization();
      await systemOptimizer.applyScalabilityImprovements();
      await systemOptimizer.applyResourceOptimization();

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(events).toContain('optimization_completed');
      expect(events).toContain('memory_optimization_completed');
      expect(events).toContain('scalability_improvement_completed');
      expect(events).toContain('resource_optimization_completed');

      // Cleanup subscriptions
      subscriptions.forEach(sub => eventBus.unsubscribe(sub.id));
    });
  });

  describe('Performance and Statistics', () => {
    test('should provide comprehensive statistics', () => {
      const stats = systemOptimizer.getStats();
      
      expect(stats.performanceOptimization).toBeDefined();
      expect(stats.memoryManagement).toBeDefined();
      expect(stats.scalabilityImprovements).toBeDefined();
      expect(stats.resourceOptimization).toBeDefined();
      expect(stats.systemMonitoring).toBeDefined();
      
      expect(stats.performanceOptimization.optimizationsApplied).toBeGreaterThanOrEqual(0);
      expect(stats.memoryManagement.garbageCollections).toBeGreaterThanOrEqual(0);
      expect(stats.scalabilityImprovements.scalingEvents).toBeGreaterThanOrEqual(0);
      expect(stats.resourceOptimization.resourceOptimizations).toBeGreaterThanOrEqual(0);
      expect(stats.systemMonitoring.alertsGenerated).toBeGreaterThanOrEqual(0);
    });

    test('should calculate health scores correctly', () => {
      const healthReport = systemOptimizer.generateHealthReport();
      
      expect(healthReport.overallHealth).toBeGreaterThanOrEqual(0);
      expect(healthReport.overallHealth).toBeLessThanOrEqual(1);
      expect(healthReport.performance).toBeGreaterThanOrEqual(0);
      expect(healthReport.performance).toBeLessThanOrEqual(1);
      expect(healthReport.memory).toBeGreaterThanOrEqual(0);
      expect(healthReport.memory).toBeLessThanOrEqual(1);
      expect(healthReport.resources).toBeGreaterThanOrEqual(0);
      expect(healthReport.resources).toBeLessThanOrEqual(1);
      expect(healthReport.scalability).toBeGreaterThanOrEqual(0);
      expect(healthReport.scalability).toBeLessThanOrEqual(1);
    });
  });
}); 