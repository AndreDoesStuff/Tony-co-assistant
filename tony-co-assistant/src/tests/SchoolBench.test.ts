import { SchoolBench } from '../components/core/SchoolBench';
import { eventBus } from '../events/EventBus';

describe('Enhanced School Bench', () => {
  let schoolBench: SchoolBench;

  beforeEach(async () => {
    schoolBench = new SchoolBench();
    await schoolBench.initialize();
  });

  afterEach(async () => {
    await schoolBench.destroy();
  });

  describe('Initialization', () => {
    test('should initialize with enhanced features', async () => {
      const stats = schoolBench.getStats();
      
      expect(stats.learningPathways).toBe(0);
      expect(stats.patternEvolutions).toBe(0);
      expect(stats.knowledgeBaseItems).toBe(0);
      expect(stats.adaptiveLearning.enabled).toBe(true);
      expect(stats.interactionLearning).toBeDefined();
    });

    test('should have adaptive configuration', () => {
      const config = schoolBench.getAdaptiveConfig();
      
      expect(config.enabled).toBe(true);
      expect(config.learningRate).toBe(0.1);
      expect(config.difficultyAdjustment).toBe(0.2);
      expect(config.feedbackThreshold).toBe(0.7);
      expect(config.patternUpdateThreshold).toBe(0.8);
    });
  });

  describe('Interaction Learning', () => {
    test('should learn from user interactions', async () => {
      const interaction = {
        id: 'test-interaction-1',
        type: 'click',
        userId: 'user1',
        element: 'submit-button',
        duration: 2500,
        outcome: 'success',
        context: { page: 'checkout' }
      };

      const learningResult = await schoolBench.learnFromInteraction(interaction);

      expect(learningResult).toBeDefined();
      expect(learningResult.type).toBe('click');
      expect(learningResult.patterns).toBeDefined();
      expect(learningResult.insights).toBeDefined();
      expect(learningResult.recommendations).toBeDefined();
      expect(learningResult.confidence).toBeGreaterThan(0);
    });

    test('should extract patterns from interactions', async () => {
      const interaction = {
        id: 'test-interaction-2',
        type: 'scroll',
        userId: 'user1',
        element: 'product-list',
        duration: 8000,
        outcome: 'success',
        context: { page: 'products' }
      };

      const learningResult = await schoolBench.learnFromInteraction(interaction);

      expect(learningResult.patterns.length).toBeGreaterThan(0);
      expect(learningResult.patterns.some((p: any) => p.type === 'timing')).toBe(true);
      expect(learningResult.patterns.some((p: any) => p.type === 'element_usage')).toBe(true);
    });

    test('should generate insights from successful interactions', async () => {
      const interaction = {
        id: 'test-interaction-3',
        type: 'form_submit',
        userId: 'user1',
        outcome: 'success',
        context: { form: 'registration' }
      };

      const learningResult = await schoolBench.learnFromInteraction(interaction);

      expect(learningResult.insights.length).toBeGreaterThan(0);
      expect(learningResult.insights.some((i: any) => i.type === 'success_pattern')).toBe(true);
    });

    test('should generate recommendations for slow interactions', async () => {
      const interaction = {
        id: 'test-interaction-4',
        type: 'navigation',
        userId: 'user1',
        duration: 6000, // 6 seconds - should trigger optimization recommendation
        outcome: 'success'
      };

      const learningResult = await schoolBench.learnFromInteraction(interaction);

      expect(learningResult.recommendations.length).toBeGreaterThan(0);
      expect(learningResult.recommendations.some((r: any) => r.type === 'optimization')).toBe(true);
    });
  });

  describe('Learning Pathways', () => {
    test('should create learning pathways', () => {
      const pathway = schoolBench.createLearningPathway(
        'UX Design Fundamentals',
        'Learn the basics of UX design',
        'beginner',
        ['lesson1', 'lesson2', 'lesson3'],
        [],
        ['Understand UX principles', 'Apply design thinking'],
        true
      );

      expect(pathway).toBeDefined();
      expect(pathway.name).toBe('UX Design Fundamentals');
      expect(pathway.difficulty).toBe('beginner');
      expect(pathway.lessons).toHaveLength(3);
      expect(pathway.adaptive).toBe(true);
      expect(pathway.estimatedDuration).toBe(90); // 3 lessons * 30 minutes
    });

    test('should get learning pathways by difficulty', () => {
      schoolBench.createLearningPathway('Beginner Course', 'Basic course', 'beginner', ['lesson1']);
      schoolBench.createLearningPathway('Advanced Course', 'Advanced course', 'advanced', ['lesson2']);

      const beginnerPathways = schoolBench.getLearningPathways('beginner');
      const advancedPathways = schoolBench.getLearningPathways('advanced');

      expect(beginnerPathways.length).toBe(1);
      expect(advancedPathways.length).toBe(1);
      expect(beginnerPathways[0].difficulty).toBe('beginner');
      expect(advancedPathways[0].difficulty).toBe('advanced');
    });

    test('should get learning pathway by ID', () => {
      const pathway = schoolBench.createLearningPathway(
        'Test Pathway',
        'Test description',
        'intermediate',
        ['lesson1']
      );

      const retrieved = schoolBench.getLearningPathway(pathway.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Pathway');
    });

    test('should delete learning pathway', () => {
      const pathway = schoolBench.createLearningPathway(
        'To Delete',
        'Will be deleted',
        'beginner',
        ['lesson1']
      );

      const deleteResult = schoolBench.deleteLearningPathway(pathway.id);
      expect(deleteResult).toBe(true);

      const retrieved = schoolBench.getLearningPathway(pathway.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Pattern Evolution Tracking', () => {
    test('should track pattern evolution', () => {
      const evolution = schoolBench.trackPatternEvolution(
        'pattern-123',
        'modification',
        'description',
        'Old description',
        'New description',
        'Updated based on user feedback',
        0.9
      );

      expect(evolution).toBeDefined();
      expect(evolution.patternId).toBe('pattern-123');
      expect(evolution.version).toBe(1);
      expect(evolution.changes).toHaveLength(1);
      expect(evolution.changes[0].type).toBe('modification');
      expect(evolution.changes[0].field).toBe('description');
      expect(evolution.changes[0].oldValue).toBe('Old description');
      expect(evolution.changes[0].newValue).toBe('New description');
    });

    test('should increment version on subsequent changes', () => {
      schoolBench.trackPatternEvolution('pattern-123', 'modification', 'field1', 'old1', 'new1', 'reason1');
      const evolution2 = schoolBench.trackPatternEvolution('pattern-123', 'addition', 'field2', undefined, 'new2', 'reason2');

      expect(evolution2.version).toBe(2);
      expect(evolution2.changes).toHaveLength(2);
    });

    test('should add user feedback to pattern evolution', () => {
      schoolBench.trackPatternEvolution('pattern-123', 'modification', 'field', 'old', 'new', 'reason');

      const feedbackResult = schoolBench.addPatternFeedback(
        'pattern-123',
        'user1',
        5,
        'Excellent pattern!',
        { context: 'mobile' }
      );

      expect(feedbackResult).toBe(true);

      const evolution = schoolBench.getPatternEvolution('pattern-123');
      expect(evolution?.userFeedback).toHaveLength(1);
      expect(evolution?.userFeedback[0].userId).toBe('user1');
      expect(evolution?.userFeedback[0].rating).toBe(5);
      expect(evolution?.userFeedback[0].comment).toBe('Excellent pattern!');
    });

    test('should update performance metrics based on feedback', () => {
      schoolBench.trackPatternEvolution('pattern-123', 'modification', 'field', 'old', 'new', 'reason');

      // Add positive feedback
      schoolBench.addPatternFeedback('pattern-123', 'user1', 5, 'Great!');
      schoolBench.addPatternFeedback('pattern-123', 'user2', 4, 'Good');

      const evolution = schoolBench.getPatternEvolution('pattern-123');
      expect(evolution?.performance.userSatisfaction).toBeGreaterThan(0.8);
      expect(evolution?.performance.adoptionRate).toBeGreaterThan(0.6);
    });

    test('should get pattern evolutions by pattern ID', () => {
      schoolBench.trackPatternEvolution('pattern-123', 'modification', 'field1', 'old1', 'new1', 'reason1');
      schoolBench.trackPatternEvolution('pattern-456', 'addition', 'field2', undefined, 'new2', 'reason2');

      const evolutions123 = schoolBench.getPatternEvolutions('pattern-123');
      const evolutions456 = schoolBench.getPatternEvolutions('pattern-456');

      expect(evolutions123.length).toBe(1);
      expect(evolutions456.length).toBe(1);
      expect(evolutions123[0].patternId).toBe('pattern-123');
      expect(evolutions456[0].patternId).toBe('pattern-456');
    });
  });

  describe('Knowledge Base Management', () => {
    test('should add knowledge items', () => {
      const knowledgeItem = schoolBench.addKnowledgeItem(
        'best_practice',
        'Mobile Navigation Best Practices',
        {
          description: 'Guidelines for mobile navigation design',
          examples: ['hamburger menu', 'bottom navigation'],
          sources: ['UX research', 'User testing']
        },
        'navigation',
        ['mobile', 'navigation', 'best-practices'],
        0.9
      );

      expect(knowledgeItem).toBeDefined();
      expect(knowledgeItem.type).toBe('best_practice');
      expect(knowledgeItem.title).toBe('Mobile Navigation Best Practices');
      expect(knowledgeItem.category).toBe('navigation');
      expect(knowledgeItem.tags).toContain('mobile');
      expect(knowledgeItem.confidence).toBe(0.9);
    });

    test('should update knowledge items', () => {
      const item = schoolBench.addKnowledgeItem('lesson', 'Test Lesson', { content: 'test' });
      
      const updateResult = schoolBench.updateKnowledgeItem(item.id, {
        title: 'Updated Lesson',
        confidence: 0.95
      });

      expect(updateResult).toBe(true);

      const updatedItem = schoolBench.getKnowledgeItem(item.id);
      expect(updatedItem?.title).toBe('Updated Lesson');
      expect(updatedItem?.confidence).toBe(0.95);
    });

    test('should search knowledge base', () => {
      schoolBench.addKnowledgeItem('lesson', 'UX Design Basics', { content: 'Learn UX design' }, 'design', ['ux', 'basics']);
      schoolBench.addKnowledgeItem('pattern', 'Button Design', { content: 'Button patterns' }, 'ui', ['buttons', 'patterns']);
      schoolBench.addKnowledgeItem('best_practice', 'Color Theory', { content: 'Color guidelines' }, 'design', ['colors', 'theory']);

      const designResults = schoolBench.searchKnowledgeBase('design', 'lesson', 'design');
      const buttonResults = schoolBench.searchKnowledgeBase('button');
      const colorResults = schoolBench.searchKnowledgeBase('color', undefined, undefined, ['colors']);

      expect(designResults.length).toBe(1);
      expect(designResults[0].title).toBe('UX Design Basics');
      
      expect(buttonResults.length).toBe(1);
      expect(buttonResults[0].title).toBe('Button Design');
      
      expect(colorResults.length).toBe(1);
      expect(colorResults[0].title).toBe('Color Theory');
    });

    test('should delete knowledge items', () => {
      const item = schoolBench.addKnowledgeItem('lesson', 'To Delete', { content: 'test' });
      
      const deleteResult = schoolBench.deleteKnowledgeItem(item.id);
      expect(deleteResult).toBe(true);

      const retrieved = schoolBench.getKnowledgeItem(item.id);
      expect(retrieved).toBeUndefined();
    });

    test('should get knowledge items by type', () => {
      schoolBench.addKnowledgeItem('lesson', 'Lesson 1', { content: 'test' });
      schoolBench.addKnowledgeItem('pattern', 'Pattern 1', { content: 'test' });
      schoolBench.addKnowledgeItem('best_practice', 'Practice 1', { content: 'test' });

      const lessons = schoolBench.getKnowledgeBaseItems('lesson');
      const patterns = schoolBench.getKnowledgeBaseItems('pattern');
      const practices = schoolBench.getKnowledgeBaseItems('best_practice');

      expect(lessons.length).toBe(1);
      expect(patterns.length).toBe(1);
      expect(practices.length).toBe(1);
    });
  });

  describe('Adaptive Learning', () => {
    test('should generate adaptive recommendations', () => {
      // Add some knowledge items
      schoolBench.addKnowledgeItem('lesson', 'UX Fundamentals', { content: 'Learn UX basics' }, 'ux', ['basics']);
      schoolBench.addKnowledgeItem('lesson', 'Design Patterns', { content: 'Learn patterns' }, 'patterns', ['design']);

      // Mock user progress with weaknesses
      const recommendations = schoolBench.getAdaptiveRecommendations('user1');

      expect(Array.isArray(recommendations)).toBe(true);
    });

    test('should update adaptive configuration', () => {
      const newConfig = {
        learningRate: 0.15,
        difficultyAdjustment: 0.25,
        feedbackThreshold: 0.8
      };

      schoolBench.updateAdaptiveConfig(newConfig);

      const updatedConfig = schoolBench.getAdaptiveConfig();
      expect(updatedConfig.learningRate).toBe(0.15);
      expect(updatedConfig.difficultyAdjustment).toBe(0.25);
      expect(updatedConfig.feedbackThreshold).toBe(0.8);
    });
  });

  describe('Enhanced Statistics', () => {
    test('should provide comprehensive statistics', () => {
      // Add some data
      schoolBench.createLearningPathway('Pathway 1', 'Test pathway', 'beginner', ['lesson1']);
      schoolBench.trackPatternEvolution('pattern-123', 'modification', 'field', 'old', 'new', 'reason');
      schoolBench.addKnowledgeItem('lesson', 'Test Lesson', { content: 'test' });

      const stats = schoolBench.getStats();

      expect(stats.learningPathways).toBe(1);
      expect(stats.patternEvolutions).toBe(1);
      expect(stats.knowledgeBaseItems).toBe(1);
      expect(stats.adaptiveLearning.enabled).toBe(true);
      expect(stats.adaptiveLearning.activePathways).toBe(1);
      expect(stats.interactionLearning).toBeDefined();
    });
  });

  describe('Import/Export', () => {
    test('should export learning data', () => {
      // Add some data
      const pathway = schoolBench.createLearningPathway('Test Pathway', 'Test', 'beginner', ['lesson1']);
      const evolution = schoolBench.trackPatternEvolution('pattern-123', 'modification', 'field', 'old', 'new', 'reason');
      const knowledge = schoolBench.addKnowledgeItem('lesson', 'Test Lesson', { content: 'test' });

      const exportedData = schoolBench.exportLearningData();

      expect(exportedData.learningPathways).toHaveLength(1);
      expect(exportedData.patternEvolutions).toHaveLength(1);
      expect(exportedData.knowledgeBase).toHaveLength(1);
      expect(exportedData.exportTimestamp).toBeDefined();
    });

    test('should import learning data', () => {
      const testData = {
        learningPathways: [
          {
            id: 'imported-pathway',
            name: 'Imported Pathway',
            description: 'Test import',
            difficulty: 'intermediate' as const,
            lessons: ['lesson1'],
            prerequisites: [],
            outcomes: [],
            estimatedDuration: 30,
            adaptive: true,
            createdAt: Date.now(),
            lastUpdated: Date.now()
          }
        ],
        patternEvolutions: [],
        knowledgeBase: [],
        adaptiveConfig: { enabled: true, learningRate: 0.2 }
      };

      const importResult = schoolBench.importLearningData(testData);
      expect(importResult).toBe(true);

      const importedPathway = schoolBench.getLearningPathway('imported-pathway');
      expect(importedPathway).toBeDefined();
      expect(importedPathway?.name).toBe('Imported Pathway');
    });
  });

  describe('Event Integration', () => {
    test('should emit events for major operations', async () => {
      const events: any[] = [];
      
      const subscription = eventBus.subscribe('learning_pathway_created', (event) => {
        events.push(event);
      });

      schoolBench.createLearningPathway('Test Pathway', 'Test', 'beginner', ['lesson1']);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(events.length).toBe(1);
      expect(events[0].data.name).toBe('Test Pathway');

      // Clean up subscription
      if (subscription && typeof subscription === 'object' && 'id' in subscription) {
        eventBus.unsubscribe(subscription.id);
      }
    });

    test('should handle interaction learning events', async () => {
      const events: any[] = [];
      
      const subscription = eventBus.subscribe('interaction_learned', (event) => {
        events.push(event);
      });

      const interaction = {
        id: 'test-interaction',
        type: 'click',
        userId: 'user1',
        outcome: 'success'
      };

      await schoolBench.learnFromInteraction(interaction);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(events.length).toBe(1);
      expect(events[0].data.interactionId).toBe('test-interaction');

      // Clean up subscription
      if (subscription && typeof subscription === 'object' && 'id' in subscription) {
        eventBus.unsubscribe(subscription.id);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid pattern evolution tracking', () => {
      const evolution = schoolBench.trackPatternEvolution(
        'invalid-pattern',
        'modification',
        'field',
        'old',
        'new',
        'reason',
        -1 // Invalid confidence
      );

      expect(evolution).toBeDefined();
      expect(evolution.changes[0].confidence).toBe(-1); // Should still work but with invalid value
    });

    test('should handle knowledge base operations with invalid data', () => {
      const item = schoolBench.addKnowledgeItem(
        'invalid_type' as any,
        '',
        {},
        '',
        [],
        -1
      );

      expect(item).toBeDefined();
      expect(item.confidence).toBe(-1);
    });
  });

  describe('Performance', () => {
    test('should handle multiple operations efficiently', async () => {
      const startTime = Date.now();

      // Create multiple pathways
      for (let i = 0; i < 10; i++) {
        schoolBench.createLearningPathway(
          `Pathway ${i}`,
          `Description ${i}`,
          'beginner',
          [`lesson${i}`]
        );
      }

      // Track multiple evolutions
      for (let i = 0; i < 10; i++) {
        schoolBench.trackPatternEvolution(
          `pattern-${i}`,
          'modification',
          'field',
          'old',
          'new',
          'reason'
        );
      }

      // Add multiple knowledge items
      for (let i = 0; i < 10; i++) {
        schoolBench.addKnowledgeItem(
          'lesson',
          `Lesson ${i}`,
          { content: `Content ${i}` }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second

      const stats = schoolBench.getStats();
      expect(stats.learningPathways).toBe(10);
      expect(stats.patternEvolutions).toBe(10);
      expect(stats.knowledgeBaseItems).toBe(10);
    });
  });
}); 