const { AdvancedLearning } = require('./dist/components/advanced/AdvancedLearning');

async function testAdvancedLearning() {
  console.log('Testing Advanced Learning Component...');
  
  try {
    const advancedLearning = new AdvancedLearning();
    
    // Test initialization
    console.log('Initializing...');
    await advancedLearning.initialize();
    console.log('✓ Initialized successfully');
    
    // Test stats
    const stats = advancedLearning.getStats();
    console.log('✓ Stats retrieved:', {
      totalEpisodes: stats.reinforcementLearning.totalEpisodes,
      totalTransfers: stats.transferLearning.totalTransfers,
      patternsDiscovered: stats.patternRecognition.patternsDiscovered,
      totalPredictions: stats.predictiveCapabilities.totalPredictions
    });
    
    // Test reinforcement learning
    console.log('Testing reinforcement learning...');
    await advancedLearning.learnFromExperience(
      { state: 'test' },
      'test_action',
      0.8,
      { nextState: 'test_next' },
      false
    );
    console.log('✓ Reinforcement learning completed');
    
    // Test pattern discovery
    console.log('Testing pattern discovery...');
    const patterns = await advancedLearning.discoverAdvancedPattern(
      [{ data: 'test', timestamp: Date.now() }],
      { context: 'test' }
    );
    console.log('✓ Pattern discovery completed, found', patterns.length, 'patterns');
    
    // Test prediction
    console.log('Testing prediction...');
    const prediction = await advancedLearning.makePrediction(
      'test_target',
      { feature: 'test' },
      24
    );
    console.log('✓ Prediction completed:', prediction ? 'success' : 'null');
    
    // Test knowledge transfer
    console.log('Testing knowledge transfer...');
    const transfer = await advancedLearning.transferKnowledge(
      'MemorySystem',
      'LearningSystem',
      'pattern',
      { data: 'test_transfer' }
    );
    console.log('✓ Knowledge transfer completed:', transfer ? 'success' : 'null');
    
    // Final stats
    const finalStats = advancedLearning.getStats();
    console.log('✓ Final stats:', {
      totalEpisodes: finalStats.reinforcementLearning.totalEpisodes,
      totalTransfers: finalStats.transferLearning.totalTransfers,
      patternsDiscovered: finalStats.patternRecognition.patternsDiscovered,
      totalPredictions: finalStats.predictiveCapabilities.totalPredictions
    });
    
    // Cleanup
    await advancedLearning.destroy();
    console.log('✓ Cleanup completed');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdvancedLearning(); 