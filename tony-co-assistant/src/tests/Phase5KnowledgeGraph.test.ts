import { KnowledgeGraph } from '../components/advanced/KnowledgeGraph';
import { ComponentManager } from '../components/core/ComponentManager';
import { MemorySystem } from '../components/core/MemorySystem';
import { LearningSystem } from '../components/core/LearningSystem';
import { eventBus } from '../events/EventBus';
import { TonyEvent } from '../types/tony';

describe('Phase 5.2: Knowledge Graph Enhancement', () => {
  let knowledgeGraph: KnowledgeGraph;
  let componentManager: ComponentManager;
  let memorySystem: MemorySystem;
  let learningSystem: LearningSystem;

  beforeEach(async () => {
    // Initialize components
    knowledgeGraph = new KnowledgeGraph();
    componentManager = new ComponentManager();
    
    await componentManager.initialize();
    
    memorySystem = componentManager.getComponent<MemorySystem>('MemorySystem')!;
    learningSystem = componentManager.getComponent<LearningSystem>('LearningSystem')!;
  });

  afterEach(async () => {
    await knowledgeGraph.destroy();
    await componentManager.destroy();
  });

  describe('Step 5.2: Knowledge Graph Core Features', () => {
    test('should initialize knowledge graph system successfully', async () => {
      await knowledgeGraph.initialize();
      
      const stats = knowledgeGraph.getStats();
      expect(stats).toBeDefined();
      expect(stats.totalNodes).toBe(0);
      expect(stats.totalRelationships).toBe(0);
      expect(stats.inferenceCount).toBe(0);
      expect(stats.semanticAnalysisCount).toBe(0);
    });

    test('should add knowledge nodes with enhanced metadata', async () => {
      await knowledgeGraph.initialize();
      
      const node = knowledgeGraph.addNode(
        'concept',
        'User interface design patterns',
        'system',
        0.9,
        {
          domain: 'design',
          subdomain: 'ui_patterns',
          userContext: { role: 'designer' }
        }
      );

      expect(node).toBeDefined();
      expect(node.type).toBe('concept');
      expect(node.content).toBe('User interface design patterns');
      expect(node.confidence).toBe(0.9);
      expect(node.metadata.importance).toBeGreaterThan(0);
      expect(node.metadata.trustworthiness).toBeGreaterThan(0);
      expect(node.metadata.complexity).toBeGreaterThan(0);
      expect(node.semanticTags.length).toBeGreaterThan(0);
      expect(node.context.domain).toBe('design');

      const stats = knowledgeGraph.getStats();
      expect(stats.totalNodes).toBe(1);
    });

    test('should create relationships between knowledge nodes', async () => {
      await knowledgeGraph.initialize();
      
      const node1 = knowledgeGraph.addNode('concept', 'Design patterns', 'system', 0.8);
      const node2 = knowledgeGraph.addNode('concept', 'User experience', 'system', 0.9);
      
      const relationship = knowledgeGraph.createRelationship(
        node1.id,
        node2.id,
        'related_to',
        0.8,
        0.9,
        {
          evidence: ['Design patterns improve UX'],
          context: { domain: 'design' }
        }
      );

      expect(relationship).toBeDefined();
      expect(relationship?.sourceNodeId).toBe(node1.id);
      expect(relationship?.targetNodeId).toBe(node2.id);
      expect(relationship?.type).toBe('related_to');
      expect(relationship?.strength).toBe(0.8);
      expect(relationship?.confidence).toBe(0.9);
      expect(relationship?.metadata.evidence).toContain('Design patterns improve UX');

      const stats = knowledgeGraph.getStats();
      expect(stats.totalRelationships).toBe(1);
    });

    test('should perform semantic understanding analysis', async () => {
      await knowledgeGraph.initialize();
      
      const content = 'User interface design patterns improve user experience and accessibility';
      const context = { domain: 'design', user: 'designer' };

      const semanticResult = await knowledgeGraph.analyzeSemantics(content, context);

      expect(semanticResult).toBeDefined();
      expect(semanticResult.entities.length).toBeGreaterThan(0);
      expect(semanticResult.concepts.length).toBeGreaterThan(0);
      expect(semanticResult.relationships.length).toBeGreaterThan(0);
      expect(semanticResult.sentiment.overall).toBeDefined();
      expect(semanticResult.context.domain).toBe('design');

      const stats = knowledgeGraph.getStats();
      expect(stats.semanticAnalysisCount).toBe(1);
    });

    test('should generate inferences from knowledge graph', async () => {
      await knowledgeGraph.initialize();
      
      // Add some knowledge nodes
      const node1 = knowledgeGraph.addNode('concept', 'Design patterns improve usability', 'system', 0.9);
      const node2 = knowledgeGraph.addNode('concept', 'Usability leads to better user satisfaction', 'system', 0.8);
      const node3 = knowledgeGraph.addNode('concept', 'User satisfaction increases retention', 'system', 0.7);
      
      // Create relationships
      knowledgeGraph.createRelationship(node1.id, node2.id, 'causes', 0.8, 0.9);
      knowledgeGraph.createRelationship(node2.id, node3.id, 'causes', 0.7, 0.8);

      const query = 'How do design patterns affect user retention?';
      const inferences = await knowledgeGraph.generateInferences(query);

      expect(inferences.length).toBeGreaterThan(0);
      
      for (const inference of inferences) {
        expect(inference.conclusion).toBeDefined();
        expect(inference.confidence).toBeGreaterThan(0);
        expect(inference.reasoning.length).toBeGreaterThan(0);
        expect(inference.evidence.length).toBeGreaterThan(0);
      }

      const stats = knowledgeGraph.getStats();
      expect(stats.inferenceCount).toBe(1);
    });

    test('should find related knowledge nodes through relationship traversal', async () => {
      await knowledgeGraph.initialize();
      
      // Create a knowledge network
      const node1 = knowledgeGraph.addNode('concept', 'Design patterns', 'system', 0.9);
      const node2 = knowledgeGraph.addNode('concept', 'User experience', 'system', 0.8);
      const node3 = knowledgeGraph.addNode('concept', 'Accessibility', 'system', 0.7);
      const node4 = knowledgeGraph.addNode('concept', 'Performance', 'system', 0.6);
      
      // Create relationships
      knowledgeGraph.createRelationship(node1.id, node2.id, 'causes', 0.8, 0.9);
      knowledgeGraph.createRelationship(node2.id, node3.id, 'part_of', 0.7, 0.8);
      knowledgeGraph.createRelationship(node3.id, node4.id, 'influences', 0.6, 0.7);

      const relatedNodes = knowledgeGraph.findRelatedNodes(node1.id, 'causes', 3);

      expect(relatedNodes.length).toBeGreaterThan(0);
      
      for (const result of relatedNodes) {
        expect(result.node).toBeDefined();
        expect(result.path.length).toBeGreaterThan(0);
        expect(result.strength).toBeGreaterThan(0);
      }
    });
  });

  describe('Step 5.2: Knowledge Graph Integration', () => {
    test('should integrate with existing components seamlessly', async () => {
      await knowledgeGraph.initialize();
      
      // Test integration with Memory System
      const memory = memorySystem.createNode(
        'knowledge',
        'Design patterns knowledge',
        'user_input',
        ['design', 'patterns'],
        0.9
      );

      // Test integration with Learning System
      const pattern = learningSystem.learnPattern(
        'knowledge_graph_integration',
        { name: 'Knowledge Graph Integration', type: 'advanced' },
        ['knowledge_graph'],
        0.9
      );

      // Add knowledge to graph
      const knowledgeNode = knowledgeGraph.addNode(
        'concept',
        'Integration between memory and learning systems',
        'system',
        0.9
      );

      expect(memory).toBeDefined();
      expect(pattern).toBeDefined();
      expect(knowledgeNode).toBeDefined();

      const stats = knowledgeGraph.getStats();
      expect(stats.totalNodes).toBe(1);
    });

    test('should handle cross-component knowledge sharing', async () => {
      await knowledgeGraph.initialize();
      
      // Create knowledge in different components
      const memoryKnowledge = memorySystem.createNode(
        'knowledge',
        'User prefers intuitive interfaces',
        'user_input',
        ['user_preference', 'interface'],
        0.9
      );

      const learningKnowledge = learningSystem.learnPattern(
        'user_preference_pattern',
        { preference: 'intuitive', confidence: 0.9 },
        ['memory_system'],
        0.9
      );

      // Add to knowledge graph
      const node1 = knowledgeGraph.addNode(
        'concept',
        'User preference for intuitive interfaces',
        'memory_system',
        0.9
      );

      const node2 = knowledgeGraph.addNode(
        'concept',
        'Intuitive interface pattern',
        'learning_system',
        0.8
      );

      // Create relationship
      const relationship = knowledgeGraph.createRelationship(
        node1.id,
        node2.id,
        'influences',
        0.8,
        0.9
      );

      expect(relationship).toBeDefined();

      const stats = knowledgeGraph.getStats();
      expect(stats.totalNodes).toBe(2);
      expect(stats.totalRelationships).toBe(1);
    });

    test('should provide real-time knowledge graph updates', async () => {
      await knowledgeGraph.initialize();
      
      let eventReceived = false;
      let eventData: any = null;

      // Subscribe to knowledge graph events
      const subscription = eventBus.subscribe('knowledge_node_created', (event: TonyEvent) => {
        eventReceived = true;
        eventData = event.data;
      });

      // Create knowledge node
      const node = knowledgeGraph.addNode(
        'concept',
        'Real-time knowledge updates',
        'system',
        0.8
      );

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventReceived).toBe(true);
      expect(eventData).toBeDefined();
      expect(eventData.nodeId).toBe(node.id);
      expect(eventData.type).toBe('concept');

      eventBus.unsubscribe(subscription.id);
    });
  });

  describe('Step 5.2: Knowledge Graph Performance', () => {
    test('should maintain high performance under load', async () => {
      await knowledgeGraph.initialize();
      
      const startTime = Date.now();
      
      // Create high load scenario
      const promises = [];
      for (let i = 0; i < 100; i++) {
        // Add nodes
        promises.push(
          knowledgeGraph.addNode(
            'concept',
            `Concept ${i}`,
            'system',
            0.5 + (i % 5) * 0.1
          )
        );

        // Semantic analysis
        promises.push(
          knowledgeGraph.analyzeSemantics(
            `Content for analysis ${i}`,
            { context: i }
          )
        );

        // Inferences
        promises.push(
          knowledgeGraph.generateInferences(
            `Query ${i}`,
            { context: i },
            5
          )
        );
      }

      await Promise.all(promises);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify performance requirements
      expect(processingTime).toBeLessThan(10000); // Should complete in < 10 seconds

      const stats = knowledgeGraph.getStats();
      expect(stats.totalNodes).toBe(100);
      expect(stats.semanticAnalysisCount).toBe(100);
      expect(stats.inferenceCount).toBe(100);
    });

    test('should optimize graph structure automatically', async () => {
      await knowledgeGraph.initialize();
      
      // Create nodes with very low importance that should be cleaned up in test mode
      for (let i = 0; i < 5; i++) {
        knowledgeGraph.addNode(
          'concept',
          `Low importance concept ${i}`,
          'system',
          0.1, // Very low confidence
          { domain: 'test' }
        );
      }
      
      // Create some nodes with higher importance that should remain
      for (let i = 0; i < 3; i++) {
        knowledgeGraph.addNode(
          'concept',
          `High importance concept ${i}`,
          'system',
          0.9, // Very high confidence
          { domain: 'test' }
        );
      }
      
      // Trigger optimization
      const initialStats = knowledgeGraph.getStats();
      
      // Trigger optimization immediately for testing
      knowledgeGraph.optimizeGraph();
      
      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const finalStats = knowledgeGraph.getStats();
      
      // Verify optimization occurred
      expect(finalStats.graphOptimization.cleanupCount).toBeGreaterThan(0);
      expect(finalStats.totalNodes).toBeLessThanOrEqual(initialStats.totalNodes);
    });

    test('should handle concurrent knowledge operations', async () => {
      await knowledgeGraph.initialize();
      
      // Test concurrent operations
      const concurrentOperations = [
        // Concurrent node creation
        knowledgeGraph.addNode('concept', 'Concurrent concept 1', 'system', 0.8),
        knowledgeGraph.addNode('entity', 'Concurrent entity 1', 'system', 0.7),
        knowledgeGraph.addNode('relationship', 'Concurrent relationship 1', 'system', 0.6),
        
        // Concurrent semantic analysis
        knowledgeGraph.analyzeSemantics('Content for concurrent analysis 1', { context: 'ctx1' }),
        knowledgeGraph.analyzeSemantics('Content for concurrent analysis 2', { context: 'ctx2' }),
        
        // Concurrent inferences
        knowledgeGraph.generateInferences('Concurrent query 1', { context: 'ctx1' }, 3),
        knowledgeGraph.generateInferences('Concurrent query 2', { context: 'ctx2' }, 3)
      ];

      await Promise.all(concurrentOperations);

      const stats = knowledgeGraph.getStats();
      expect(stats.totalNodes).toBe(3);
      expect(stats.semanticAnalysisCount).toBe(2);
      expect(stats.inferenceCount).toBe(2);
    });
  });

  describe('Step 5.2: Knowledge Graph Intelligence', () => {
    test('should demonstrate advanced relationship mapping', async () => {
      await knowledgeGraph.initialize();
      
      // Create complex knowledge network
      const nodes = [];
      const relationships = [];
      
      // Add nodes
      for (let i = 0; i < 10; i++) {
        const node = knowledgeGraph.addNode(
          'concept',
          `Advanced concept ${i}`,
          'system',
          0.7 + (i % 3) * 0.1
        );
        nodes.push(node);
      }
      
      // Create complex relationships
      for (let i = 0; i < nodes.length - 1; i++) {
        const relationshipTypes = ['is_a', 'part_of', 'related_to', 'causes', 'influences'];
        const type = relationshipTypes[i % relationshipTypes.length];
        
        const relationship = knowledgeGraph.createRelationship(
          nodes[i].id,
          nodes[i + 1].id,
          type as any,
          0.6 + (i % 4) * 0.1,
          0.7 + (i % 3) * 0.1
        );
        relationships.push(relationship);
      }

      // Test relationship traversal
      const relatedNodes = knowledgeGraph.findRelatedNodes(nodes[0].id, undefined, 5);

      expect(relatedNodes.length).toBeGreaterThan(0);
      
      // Verify relationship complexity
      const stats = knowledgeGraph.getStats();
      expect(stats.totalNodes).toBe(10);
      expect(stats.totalRelationships).toBe(9);
      expect(stats.averageConnectivity).toBeGreaterThan(0);
    });

    test('should demonstrate semantic understanding capabilities', async () => {
      await knowledgeGraph.initialize();
      
      // Test semantic analysis with complex content
      const complexContent = `
        User interface design patterns significantly improve user experience 
        by providing consistent and intuitive interaction models. These patterns 
        enhance accessibility and reduce cognitive load, leading to higher 
        user satisfaction and increased engagement rates.
      `;

      const context = {
        domain: 'design',
        user: 'designer',
        project: 'ui_improvement',
        goals: ['usability', 'accessibility', 'engagement']
      };

      const semanticResult = await knowledgeGraph.analyzeSemantics(complexContent, context);

      // Verify semantic analysis quality
      expect(semanticResult.entities.length).toBeGreaterThan(0);
      expect(semanticResult.concepts.length).toBeGreaterThan(0);
      expect(semanticResult.relationships.length).toBeGreaterThan(0);
      expect(semanticResult.sentiment.overall).toBeDefined();
      expect(semanticResult.context.domain).toBe('design');
      expect(semanticResult.context.complexity).toBeGreaterThan(0.5);
    });

    test('should demonstrate inference engine capabilities', async () => {
      await knowledgeGraph.initialize();
      
      // Create knowledge base for inference testing
      const knowledgeBase = [
        { concept: 'Design patterns', content: 'Improve user interface consistency' },
        { concept: 'Consistency', content: 'Reduces user learning time' },
        { concept: 'Learning time', content: 'Affects user productivity' },
        { concept: 'Productivity', content: 'Increases user satisfaction' },
        { concept: 'User satisfaction', content: 'Leads to higher retention rates' }
      ];

      // Add knowledge nodes
      const nodes = knowledgeBase.map(kb => 
        knowledgeGraph.addNode('concept', kb.content, 'system', 0.8)
      );

      // Create causal relationships
      for (let i = 0; i < nodes.length - 1; i++) {
        knowledgeGraph.createRelationship(
          nodes[i].id,
          nodes[i + 1].id,
          'causes',
          0.8,
          0.9
        );
      }

      // Test inference generation
      const query = 'How do design patterns affect user retention?';
      const inferences = await knowledgeGraph.generateInferences(query, {}, 5);

      expect(inferences.length).toBeGreaterThan(0);
      
      // Verify inference quality
      for (const inference of inferences) {
        expect(inference.conclusion).toBeDefined();
        expect(inference.confidence).toBeGreaterThan(0.5);
        expect(inference.reasoning.length).toBeGreaterThan(0);
        expect(inference.evidence.length).toBeGreaterThan(0);
      }

      const stats = knowledgeGraph.getStats();
      expect(stats.inferenceCount).toBe(1);
    });
  });

  describe('Step 5.2: Knowledge Graph System Harmony', () => {
    test('should maintain system harmony with knowledge graph', async () => {
      await knowledgeGraph.initialize();
      
      // Test that knowledge graph works harmoniously with existing components
      const components = componentManager.getAllComponents();
      expect(components.size).toBe(11); // Updated to reflect all components including advanced ones

      // Verify system health
      const health = componentManager.getSystemHealth();
      expect(health.initializedCount).toBe(11);
      expect(health.failedCount).toBe(0);
      expect(componentManager.isSystemReady()).toBe(true);

      // Test knowledge graph integration
      const knowledgeGraphComponent = componentManager.getComponent<KnowledgeGraph>('KnowledgeGraph');
      expect(knowledgeGraphComponent).toBeDefined();
      expect(knowledgeGraphComponent?.getStats()).toBeDefined();
    });

    test('should enhance overall system intelligence', async () => {
      await knowledgeGraph.initialize();
      
      // Test that knowledge graph enhances other components
      
      // Create memory with knowledge graph processing
      const memory = memorySystem.createNode(
        'knowledge',
        { concept: 'Enhanced Intelligence', complexity: 'high' },
        'user_input',
        ['intelligence', 'enhanced'],
        0.9
      );

      // Create learning pattern with knowledge graph processing
      const pattern = learningSystem.learnPattern(
        'knowledge_graph_enhancement',
        { name: 'Knowledge Graph Enhancement', type: 'advanced' },
        ['knowledge_graph'],
        0.9
      );

      // Add to knowledge graph
      const knowledgeNode = knowledgeGraph.addNode(
        'concept',
        'System intelligence enhancement through knowledge graphs',
        'system',
        0.9
      );

      // Test semantic analysis
      const semanticResult = await knowledgeGraph.analyzeSemantics(
        'Enhanced system intelligence through knowledge graph integration',
        { domain: 'system', enhancement: 'intelligence' }
      );

      // Test inference generation
      const inferences = await knowledgeGraph.generateInferences(
        'How does knowledge graph enhance system intelligence?',
        { context: 'enhancement' }
      );

      expect(memory).toBeDefined();
      expect(pattern).toBeDefined();
      expect(knowledgeNode).toBeDefined();
      expect(semanticResult).toBeDefined();
      expect(inferences.length).toBeGreaterThan(0);
    });

    test('should provide comprehensive knowledge analytics', async () => {
      await knowledgeGraph.initialize();
      
      // Generate knowledge data
      for (let i = 0; i < 10; i++) {
        knowledgeGraph.addNode(
          'concept',
          `Analytics concept ${i}`,
          'system',
          0.5 + (i % 5) * 0.1
        );
      }

      // Create relationships
      const nodes = knowledgeGraph.getAllNodes();
      for (let i = 0; i < nodes.length - 1; i++) {
        knowledgeGraph.createRelationship(
          nodes[i].id,
          nodes[i + 1].id,
          'related_to',
          0.6 + (i % 4) * 0.1,
          0.7 + (i % 3) * 0.1
        );
      }

      // Perform semantic analysis
      const semanticResult = await knowledgeGraph.analyzeSemantics(
        'Comprehensive knowledge analytics testing',
        { context: 'analytics' }
      );

      // Generate inferences
      const inferences = await knowledgeGraph.generateInferences(
        'analytics_performance',
        { metrics: 'comprehensive' },
        5
      );

      // Get comprehensive analytics
      const stats = knowledgeGraph.getStats();
      const allNodes = knowledgeGraph.getAllNodes();
      const allRelationships = knowledgeGraph.getAllRelationships();

      // Verify analytics completeness
      expect(stats.totalNodes).toBe(10);
      expect(stats.totalRelationships).toBe(9);
      expect(stats.semanticAnalysisCount).toBe(1);
      expect(stats.inferenceCount).toBe(1);
      expect(allNodes.length).toBe(10);
      expect(allRelationships.length).toBe(9);

      // Verify analytics quality
      expect(stats.averageConfidence).toBeGreaterThan(0);
      expect(stats.averageConnectivity).toBeGreaterThan(0);
      expect(stats.graphOptimization.cleanupCount).toBeGreaterThanOrEqual(0);
    });
  });
}); 