#!/usr/bin/env ts-node

import { TonyStore } from '../store/TonyStore';
import { EventBus } from '../events/EventBus';
import { ComponentManager } from '../components/core/ComponentManager';
import { UXRepository } from '../components/core/UXRepository';
import { AssetLibrary } from '../components/core/AssetLibrary';
import { DesignSystem } from '../components/core/DesignSystem';
import { LearningSystem } from '../components/core/LearningSystem';
import { MemorySystem } from '../components/core/MemorySystem';

/**
 * System Integration Test Runner
 * Executes comprehensive integration tests for Tony Co-Assistant
 */
class IntegrationTestRunner {
  private store: TonyStore;
  private eventBus: EventBus;
  private componentManager: ComponentManager;
  private testResults: Map<string, { passed: boolean; error?: string; duration: number }> = new Map();

  constructor() {
    this.eventBus = new EventBus();
    this.store = new TonyStore();
    this.componentManager = new ComponentManager();
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Tony Co-Assistant Integration Tests...\n');

    const tests = [
      { name: 'Component Initialization', fn: this.testComponentInitialization.bind(this) },
      { name: 'Cross-Component Communication', fn: this.testCrossComponentCommunication.bind(this) },
      { name: 'End-to-End UX Workflow', fn: this.testUXWorkflow.bind(this) },
      { name: 'Learning Feedback Loop', fn: this.testLearningFeedbackLoop.bind(this) },
      { name: 'Memory Integration', fn: this.testMemoryIntegration.bind(this) },
      { name: 'High-Volume Event Processing', fn: this.testHighVolumeEvents.bind(this) },
      { name: 'Concurrent Operations', fn: this.testConcurrentOperations.bind(this) },
      { name: 'Memory Usage Efficiency', fn: this.testMemoryUsage.bind(this) },
      { name: 'Error Handling', fn: this.testErrorHandling.bind(this) },
      { name: 'State Consistency', fn: this.testStateConsistency.bind(this) },
      { name: 'System Statistics', fn: this.testSystemStatistics.bind(this) }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.fn);
    }

    this.printResults();
    await this.cleanup();
  }

  /**
   * Run a single test
   */
  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`⏳ Running: ${name}`);
      await testFn();
      
      const duration = Date.now() - startTime;
      this.testResults.set(name, { passed: true, duration });
      console.log(`✅ Passed: ${name} (${duration}ms)\n`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.set(name, { 
        passed: false, 
        error: error instanceof Error ? error.message : String(error),
        duration 
      });
      console.log(`❌ Failed: ${name} (${duration}ms) - ${error}\n`);
    }
  }

  /**
   * Test component initialization
   */
  private async testComponentInitialization(): Promise<void> {
    await this.componentManager.initialize();
    
    const components = this.componentManager.getAllComponents();
    if (components.size !== 6) {
      throw new Error(`Expected 6 components, got ${components.size}`);
    }
    
    const expectedComponents = ['MemorySystem', 'LearningSystem', 'DesignSystem', 'UXRepository', 'SchoolBench', 'AssetLibrary'];
    for (const componentName of expectedComponents) {
      if (!components.has(componentName)) {
        throw new Error(`Missing component: ${componentName}`);
      }
    }
  }

  /**
   * Test cross-component communication
   */
  private async testCrossComponentCommunication(): Promise<void> {
    await this.componentManager.initialize();
    
    // Test event communication
    const testEvent = {
      id: 'test-comm-event',
      type: 'test:communication',
      data: { message: 'Hello from test' },
      priority: 'medium' as const,
      timestamp: Date.now(),
      source: 'test',
      context: { test: 'communication' }
    };

    await this.eventBus.publish(testEvent);
    
    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const eventStats = this.eventBus.getStats();
    if (eventStats.historySize === 0) {
      throw new Error('No events processed');
    }
  }

  /**
   * Test UX workflow
   */
  private async testUXWorkflow(): Promise<void> {
    await this.componentManager.initialize();
    
    const uxRepository = this.componentManager.getComponent<UXRepository>('UXRepository');
    const assetLibrary = this.componentManager.getComponent<AssetLibrary>('AssetLibrary');
    const designSystem = this.componentManager.getComponent<DesignSystem>('DesignSystem');
    
    if (!uxRepository || !assetLibrary || !designSystem) {
      throw new Error('Required components not found');
    }
    
    // Add UX pattern
    const uxPattern = uxRepository.addDesignPattern('Test Pattern', 'navigation', 'A test pattern');
    if (!uxPattern) {
      throw new Error('Failed to create UX pattern');
    }
    
    // Add asset
    const asset = assetLibrary.addAsset('Test Asset', 'component' as any, 'test-url', {}, ['test'], 'test');
    if (!asset) {
      throw new Error('Failed to create asset');
    }
    
    // Add design pattern
    const designPattern = designSystem.addPattern('Test Design', 'test', 'A test design', [], [], 0.8);
    if (!designPattern) {
      throw new Error('Failed to create design pattern');
    }
  }

  /**
   * Test learning feedback loop
   */
  private async testLearningFeedbackLoop(): Promise<void> {
    await this.componentManager.initialize();
    
    const learningSystem = this.componentManager.getComponent<LearningSystem>('LearningSystem');
    if (!learningSystem) {
      throw new Error('Learning system not found');
    }
    
    // Learn pattern
    const pattern = learningSystem.learnPattern('test-pattern', { name: 'Test' }, ['test'], 0.7);
    if (!pattern) {
      throw new Error('Failed to learn pattern');
    }
    
    // Add feedback
    const feedback = learningSystem.addFeedbackLoop('user', { patternId: pattern.id, rating: 5 });
    if (!feedback) {
      throw new Error('Failed to add feedback');
    }
  }

  /**
   * Test memory integration
   */
  private async testMemoryIntegration(): Promise<void> {
    await this.componentManager.initialize();
    
    const memorySystem = this.componentManager.getComponent<MemorySystem>('MemorySystem');
    if (!memorySystem) {
      throw new Error('Memory system not found');
    }
    
    // Create memory node
    const memory = memorySystem.createNode('knowledge', 'Test memory content', 'test', ['test'], 0.8);
    if (!memory) {
      throw new Error('Failed to create memory node');
    }
    
    // Search memory
    const results = memorySystem.searchNodes({ type: 'knowledge', tags: ['test'] });
    if (results.length === 0) {
      throw new Error('Memory search returned no results');
    }
  }

  /**
   * Test high-volume event processing
   */
  private async testHighVolumeEvents(): Promise<void> {
    await this.componentManager.initialize();
    
    const startTime = Date.now();
    const eventCount = 50; // Reduced for faster testing
    
    // Emit events
    for (let i = 0; i < eventCount; i++) {
      const event = {
        id: `perf-test-${i}`,
        type: 'test:performance',
        data: { index: i },
        priority: 'low' as const,
        timestamp: Date.now(),
        source: 'test',
        context: { test: 'performance' }
      };
      
      await this.eventBus.publish(event);
    }
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      throw new Error(`Event processing took too long: ${duration}ms`);
    }
  }

  /**
   * Test concurrent operations
   */
  private async testConcurrentOperations(): Promise<void> {
    await this.componentManager.initialize();
    
    const startTime = Date.now();
    
    const memorySystem = this.componentManager.getComponent<MemorySystem>('MemorySystem');
    const learningSystem = this.componentManager.getComponent<LearningSystem>('LearningSystem');
    
    if (!memorySystem || !learningSystem) {
      throw new Error('Required components not found');
    }
    
    // Concurrent operations
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        memorySystem.createNode('knowledge', `Memory ${i}`, 'test', ['test'], 0.8),
        learningSystem.learnPattern('test-pattern', { name: `Pattern ${i}` }, ['test'], 0.8)
      );
    }
    
    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    if (duration > 2000) {
      throw new Error(`Concurrent operations took too long: ${duration}ms`);
    }
  }

  /**
   * Test memory usage efficiency
   */
  private async testMemoryUsage(): Promise<void> {
    await this.componentManager.initialize();
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    const memorySystem = this.componentManager.getComponent<MemorySystem>('MemorySystem');
    if (!memorySystem) {
      throw new Error('Memory system not found');
    }
    
    // Add items
    for (let i = 0; i < 100; i++) {
      memorySystem.createNode('knowledge', `Memory content ${i}`, 'test', ['test'], 0.8);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Should use less than 10MB for 100 items
    if (memoryIncrease > 10 * 1024 * 1024) {
      throw new Error(`Memory usage too high: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    await this.componentManager.initialize();
    
    // Test with invalid data - should not crash
    const memorySystem = this.componentManager.getComponent<MemorySystem>('MemorySystem');
    if (!memorySystem) {
      throw new Error('Memory system not found');
    }
    
    // This should handle gracefully
    try {
      memorySystem.createNode('invalid-type' as any, '', '', [], -1);
    } catch (error) {
      // Expected to handle gracefully
    }
    
    // System should still be functional
    const learningSystem = this.componentManager.getComponent<LearningSystem>('LearningSystem');
    if (!learningSystem) {
      throw new Error('System became non-functional after error');
    }
  }

  /**
   * Test state consistency
   */
  private async testStateConsistency(): Promise<void> {
    await this.componentManager.initialize();
    
    const memorySystem = this.componentManager.getComponent<MemorySystem>('MemorySystem');
    if (!memorySystem) {
      throw new Error('Memory system not found');
    }
    
    // Add data
    const memory = memorySystem.createNode('knowledge', 'Consistency test', 'test', ['test'], 0.8);
    
    // Verify consistency
    const retrieved = memorySystem.getNode(memory.id);
    if (!retrieved || retrieved.data !== 'Consistency test') {
      throw new Error('State consistency check failed');
    }
  }

  /**
   * Test system statistics
   */
  private async testSystemStatistics(): Promise<void> {
    await this.componentManager.initialize();
    
    const memorySystem = this.componentManager.getComponent<MemorySystem>('MemorySystem');
    const learningSystem = this.componentManager.getComponent<LearningSystem>('LearningSystem');
    
    if (!memorySystem || !learningSystem) {
      throw new Error('Required components not found');
    }
    
    // Add some data
    memorySystem.createNode('knowledge', 'Stats test', 'test', ['test'], 0.8);
    learningSystem.learnPattern('test-pattern', { name: 'Stats Pattern' }, ['test'], 0.8);
    
    // Get statistics
    const memoryStats = memorySystem.getStats();
    const learningStats = learningSystem.getStats();
    
    if (!memoryStats || !learningStats) {
      throw new Error('Failed to get component statistics');
    }
    
    if (memoryStats.totalNodes < 1) {
      throw new Error('Memory statistics not updated');
    }
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n📊 Integration Test Results:');
    console.log('============================');
    
    let passedCount = 0;
    let totalDuration = 0;
    
    for (const [testName, result] of Array.from(this.testResults.entries())) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${testName} (${duration})`);
      
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.passed) passedCount++;
      totalDuration += result.duration;
    }
    
    const totalTests = this.testResults.size;
    const successRate = ((passedCount / totalTests) * 100).toFixed(1);
    
    console.log('\n📈 Summary:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedCount}`);
    console.log(`   Failed: ${totalTests - passedCount}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Total Duration: ${totalDuration}ms`);
    
    if (passedCount === totalTests) {
      console.log('\n🎉 All integration tests passed! Tony Co-Assistant is ready for Phase 2.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      await this.componentManager.cleanup();
      await this.store.cleanup();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new IntegrationTestRunner();
  runner.runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { IntegrationTestRunner }; 