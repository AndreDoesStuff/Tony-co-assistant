import { UXRepository, DesignPattern, UXKnowledgeBase, BestPractice, AntiPattern, Guideline, PatternRelationship } from '../components/core/UXRepository';
import { eventBus } from '../events/EventBus';

describe('Enhanced UX Repository - Phase 3, Step 3.1', () => {
  let uxRepository: UXRepository;

  beforeEach(() => {
    uxRepository = new UXRepository();
  });

  afterEach(async () => {
    await uxRepository.destroy();
  });

  describe('Initialization', () => {
    test('should initialize with enhanced features', async () => {
      await uxRepository.initialize();
      
      const stats = uxRepository.getStats();
      expect(stats.designPatternCount).toBe(0);
      expect(stats.knowledgeBaseStats.bestPractices).toBe(0);
      expect(stats.knowledgeBaseStats.antiPatterns).toBe(0);
      expect(stats.knowledgeBaseStats.guidelines).toBe(0);
      expect(stats.knowledgeBaseStats.relationships).toBe(0);
    });

    test('should build data index on initialization', async () => {
      await uxRepository.initialize();
      
      const dataIndex = uxRepository.getDataIndex();
      expect(dataIndex.interactions).toBeDefined();
      expect(dataIndex.patterns).toBeDefined();
      expect(dataIndex.insights).toBeDefined();
      expect(dataIndex.relationships).toBeDefined();
      expect(dataIndex.tags).toBeDefined();
      expect(dataIndex.categories).toBeDefined();
    });
  });

  describe('Design Pattern Management', () => {
    beforeEach(async () => {
      await uxRepository.initialize();
    });

    test('should add design pattern with enhanced metrics', () => {
      const pattern = uxRepository.addDesignPattern(
        'Hamburger Menu',
        'navigation',
        'Collapsible navigation menu for mobile interfaces',
        ['mobile', 'navigation', 'menu'],
        ['example1', 'example2'],
        ['mobile', 'responsive', 'navigation']
      );

      expect(pattern.id).toBeDefined();
      expect(pattern.name).toBe('Hamburger Menu');
      expect(pattern.category).toBe('navigation');
      expect(pattern.tags).toContain('mobile');
      expect(pattern.metrics.frequency).toBe(0);
      expect(pattern.metrics.successRate).toBe(0);
      expect(pattern.metrics.userSatisfaction).toBe(0);
    });

    test('should update design pattern metrics', () => {
      const pattern = uxRepository.addDesignPattern(
        'Search Bar',
        'input',
        'Text input for searching content',
        ['search', 'input'],
        [],
        ['search', 'input', 'form']
      );

      const updated = uxRepository.updateDesignPattern(pattern.id, {
        metrics: {
          frequency: 10,
          successRate: 0.85,
          userSatisfaction: 0.9,
          completionRate: 0.95,
          errorRate: 0.05,
          averageTime: 2.5
        }
      });

      expect(updated).toBe(true);
      
      const updatedPattern = uxRepository.getDesignPatternsByCategory('input')[0];
      expect(updatedPattern.metrics.frequency).toBe(10);
      expect(updatedPattern.metrics.successRate).toBe(0.85);
    });

    test('should categorize design patterns correctly', () => {
      uxRepository.addDesignPattern('Nav Bar', 'navigation', 'Top navigation bar');
      uxRepository.addDesignPattern('Form Input', 'input', 'Text input field');
      uxRepository.addDesignPattern('Toast', 'feedback', 'Notification toast');

      const navPatterns = uxRepository.getDesignPatternsByCategory('navigation');
      const inputPatterns = uxRepository.getDesignPatternsByCategory('input');
      const feedbackPatterns = uxRepository.getDesignPatternsByCategory('feedback');

      expect(navPatterns).toHaveLength(1);
      expect(inputPatterns).toHaveLength(1);
      expect(feedbackPatterns).toHaveLength(1);
    });

    test('should search patterns by tags', () => {
      uxRepository.addDesignPattern('Button', 'interaction', 'Clickable button', [], [], ['button', 'click', 'action']);
      uxRepository.addDesignPattern('Link', 'navigation', 'Navigation link', [], [], ['link', 'navigation']);
      uxRepository.addDesignPattern('Icon Button', 'interaction', 'Button with icon', [], [], ['button', 'icon', 'action']);

      const buttonPatterns = uxRepository.searchPatternsByTags(['button']);
      const actionPatterns = uxRepository.searchPatternsByTags(['action']);

      expect(buttonPatterns).toHaveLength(2);
      expect(actionPatterns).toHaveLength(2);
    });
  });

  describe('Pattern Analysis', () => {
    beforeEach(async () => {
      await uxRepository.initialize();
    });

    test('should analyze patterns and generate insights', async () => {
      // Add some patterns first
      uxRepository.addDesignPattern('Pattern 1', 'navigation', 'First pattern');
      uxRepository.addDesignPattern('Pattern 2', 'input', 'Second pattern');
      uxRepository.addDesignPattern('Pattern 3', 'navigation', 'Third pattern');

      const insights = await uxRepository.analyzePatterns();

      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some(insight => insight.type === 'pattern_frequency')).toBe(true);
    });

    test('should detect pattern relationships', () => {
      const pattern1 = uxRepository.addDesignPattern(
        'Hamburger Menu',
        'navigation',
        'Mobile navigation menu',
        ['mobile', 'navigation'],
        [],
        ['mobile', 'navigation', 'menu']
      );

      const pattern2 = uxRepository.addDesignPattern(
        'Sidebar Navigation',
        'navigation',
        'Side navigation panel',
        ['desktop', 'navigation'],
        [],
        ['desktop', 'navigation', 'sidebar']
      );

      const relationships = uxRepository.getPatternRelationships(pattern1.id);
      expect(relationships.length).toBeGreaterThan(0);
    });

    test('should calculate pattern similarity', () => {
      const pattern1 = uxRepository.addDesignPattern(
        'Search Bar',
        'input',
        'Text input for searching',
        ['search', 'input'],
        [],
        ['search', 'input', 'form']
      );

      const pattern2 = uxRepository.addDesignPattern(
        'Filter Input',
        'input',
        'Text input for filtering',
        ['filter', 'input'],
        [],
        ['filter', 'input', 'form']
      );

      // Both patterns are in the same category and have similar tags
      const relationships = uxRepository.getPatternRelationships(pattern1.id);
      expect(relationships.some(rel => rel.targetId === pattern2.id)).toBe(true);
    });
  });

  describe('Knowledge Base Management', () => {
    beforeEach(async () => {
      await uxRepository.initialize();
    });

    test('should add best practice', () => {
      const bestPractice = uxRepository.addBestPractice(
        'Consistent Navigation',
        'Maintain consistent navigation patterns across the application',
        'navigation',
        ['User research shows 85% success rate', 'Industry standard']
      );

      expect(bestPractice.id).toBeDefined();
      expect(bestPractice.title).toBe('Consistent Navigation');
      expect(bestPractice.category).toBe('navigation');
      expect(bestPractice.evidence).toHaveLength(2);
      expect(bestPractice.confidence).toBe(0.8);
    });

    test('should add anti-pattern', () => {
      const antiPattern = uxRepository.addAntiPattern(
        'Hidden Navigation',
        'Burying important navigation in obscure locations',
        'navigation',
        ['Users cannot find important features', 'Increased support calls'],
        ['Use clear, visible navigation', 'Follow established patterns']
      );

      expect(antiPattern.id).toBeDefined();
      expect(antiPattern.title).toBe('Hidden Navigation');
      expect(antiPattern.problems).toHaveLength(2);
      expect(antiPattern.solutions).toHaveLength(2);
    });

    test('should add guideline', () => {
      const guideline = uxRepository.addGuideline(
        'Color Contrast',
        'Ensure sufficient color contrast for accessibility',
        'visual',
        'high'
      );

      expect(guideline.id).toBeDefined();
      expect(guideline.title).toBe('Color Contrast');
      expect(guideline.priority).toBe('high');
      expect(guideline.compliance).toBe(0);
    });

    test('should retrieve knowledge base data', () => {
      uxRepository.addBestPractice('BP1', 'Description', 'category');
      uxRepository.addAntiPattern('AP1', 'Description', 'category');
      uxRepository.addGuideline('GL1', 'Description', 'category');

      const knowledgeBase = uxRepository.getKnowledgeBase();
      
      expect(knowledgeBase.bestPractices).toHaveLength(1);
      expect(knowledgeBase.antiPatterns).toHaveLength(1);
      expect(knowledgeBase.guidelines).toHaveLength(1);
    });
  });

  describe('Enhanced User Interaction Tracking', () => {
    beforeEach(async () => {
      await uxRepository.initialize();
    });

    test('should record interactions with enhanced analytics', () => {
      const interaction = uxRepository.recordInteraction(
        'click',
        'user123',
        { element: 'button', page: 'home' },
        { browser: 'chrome', device: 'desktop' },
        'success',
        { duration: 0.5, timestamp: Date.now() }
      );

      expect(interaction.id).toBeDefined();
      expect(interaction.type).toBe('click');
      expect(interaction.userId).toBe('user123');
      expect(interaction.outcome).toBe('success');
    });

    test('should calculate engagement metrics', () => {
      // Record some interactions
      uxRepository.recordInteraction('click', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('scroll', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('input', 'user1', {}, {}, 'success');

      const engagement = uxRepository.calculateEngagement();
      expect(engagement).toBeGreaterThan(0);
    });

    test('should calculate satisfaction metrics', () => {
      uxRepository.recordInteraction('click', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('input', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('submit', 'user1', {}, {}, 'failure');

      const satisfaction = uxRepository.calculateSatisfaction();
      expect(satisfaction).toBe(2/3); // 2 successful out of 3 total
    });

    test('should calculate efficiency metrics', () => {
      uxRepository.recordInteraction('click', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('input', 'user1', {}, {}, 'success');

      const efficiency = uxRepository.calculateEfficiency();
      expect(efficiency).toBeGreaterThan(0);
      expect(efficiency).toBeLessThanOrEqual(1);
    });

    test('should calculate error rate', () => {
      uxRepository.recordInteraction('click', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('input', 'user1', {}, {}, 'failure');
      uxRepository.recordInteraction('submit', 'user1', {}, {}, 'failure');

      const errorRate = uxRepository.calculateErrorRate();
      expect(errorRate).toBe(2/3); // 2 failures out of 3 total
    });
  });

  describe('Data Indexing and Search', () => {
    beforeEach(async () => {
      await uxRepository.initialize();
    });

    test('should index interactions by type', () => {
      uxRepository.recordInteraction('click', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('click', 'user2', {}, {}, 'success');
      uxRepository.recordInteraction('input', 'user1', {}, {}, 'success');

      const clickInteractions = uxRepository.getInteractionsByType('click');
      const inputInteractions = uxRepository.getInteractionsByType('input');

      expect(clickInteractions).toHaveLength(2);
      expect(inputInteractions).toHaveLength(1);
    });

    test('should index interactions by user', () => {
      uxRepository.recordInteraction('click', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('input', 'user1', {}, {}, 'success');
      uxRepository.recordInteraction('click', 'user2', {}, {}, 'success');

      const user1Interactions = uxRepository.getInteractionsByUser('user1');
      const user2Interactions = uxRepository.getInteractionsByUser('user2');

      expect(user1Interactions).toHaveLength(2);
      expect(user2Interactions).toHaveLength(1);
    });

    test('should maintain data index consistency', () => {
      const pattern = uxRepository.addDesignPattern('Test Pattern', 'navigation', 'Test description');
      const dataIndex = uxRepository.getDataIndex();

      // Check if pattern is indexed by category
      const navPatterns = dataIndex.patterns.get('navigation');
      expect(navPatterns).toBeDefined();
      expect(navPatterns!.some(p => p.id === pattern.id)).toBe(true);
    });
  });

  describe('Pattern Relationship Mapping', () => {
    beforeEach(async () => {
      await uxRepository.initialize();
    });

    test('should create pattern relationships', () => {
      const pattern1 = uxRepository.addDesignPattern(
        'Button',
        'interaction',
        'Clickable button element',
        ['click', 'action'],
        [],
        ['button', 'click', 'action']
      );

      const pattern2 = uxRepository.addDesignPattern(
        'Icon Button',
        'interaction',
        'Button with icon',
        ['click', 'action'],
        [],
        ['button', 'icon', 'click', 'action']
      );

      const relationships = uxRepository.getPatternRelationships(pattern1.id);
      expect(relationships.length).toBeGreaterThan(0);
      
      const relationship = relationships.find(rel => rel.targetId === pattern2.id);
      expect(relationship).toBeDefined();
      expect(relationship!.type).toBe('similar');
      expect(relationship!.strength).toBeGreaterThan(0.3);
    });

    test('should categorize relationship types', () => {
      const pattern1 = uxRepository.addDesignPattern('Pattern 1', 'navigation', 'First pattern');
      const pattern2 = uxRepository.addDesignPattern('Pattern 2', 'navigation', 'Second pattern');
      const pattern3 = uxRepository.addDesignPattern('Pattern 3', 'input', 'Third pattern');

      const relationships1 = uxRepository.getPatternRelationships(pattern1.id);
      const relationships2 = uxRepository.getPatternRelationships(pattern2.id);

      // Patterns in same category should have similar relationships
      expect(relationships1.some(rel => rel.targetId === pattern2.id)).toBe(true);
      expect(relationships2.some(rel => rel.targetId === pattern1.id)).toBe(true);
    });
  });

  describe('Comprehensive Statistics', () => {
    beforeEach(async () => {
      await uxRepository.initialize();
    });

    test('should provide comprehensive statistics', () => {
      // Add some data
      uxRepository.addDesignPattern('Pattern 1', 'navigation', 'Test pattern');
      uxRepository.addBestPractice('BP1', 'Test best practice', 'category');
      uxRepository.addAntiPattern('AP1', 'Test anti-pattern', 'category');
      uxRepository.addGuideline('GL1', 'Test guideline', 'category');
      uxRepository.recordInteraction('click', 'user1', {}, {}, 'success');

      const stats = uxRepository.getStats();

      expect(stats.designPatternCount).toBe(1);
      expect(stats.knowledgeBaseStats.bestPractices).toBe(1);
      expect(stats.knowledgeBaseStats.antiPatterns).toBe(1);
      expect(stats.knowledgeBaseStats.guidelines).toBe(1);
      expect(stats.interactionCount).toBe(1);
      expect(stats.metrics).toBeDefined();
    });

    test('should track knowledge base relationships', () => {
      const pattern1 = uxRepository.addDesignPattern('Pattern 1', 'navigation', 'Test pattern');
      const pattern2 = uxRepository.addDesignPattern('Pattern 2', 'navigation', 'Test pattern 2');

      const stats = uxRepository.getStats();
      expect(stats.knowledgeBaseStats.relationships).toBeGreaterThan(0);
    });
  });

  describe('Event System Integration', () => {
    beforeEach(async () => {
      await uxRepository.initialize();
    });

    test('should emit design pattern creation events', (done) => {
      const subscription = eventBus.subscribe('ux_design_pattern_created', (event) => {
        expect(event.data.patternId).toBeDefined();
        expect(event.data.name).toBe('Test Pattern');
        expect(event.data.category).toBe('navigation');
        eventBus.unsubscribe(subscription.id);
        done();
      });

      uxRepository.addDesignPattern('Test Pattern', 'navigation', 'Test description');
    });

    test('should emit best practice creation events', (done) => {
      const subscription = eventBus.subscribe('ux_best_practice_created', (event) => {
        expect(event.data.bestPracticeId).toBeDefined();
        expect(event.data.title).toBe('Test Best Practice');
        expect(event.data.category).toBe('navigation');
        eventBus.unsubscribe(subscription.id);
        done();
      });

      uxRepository.addBestPractice('Test Best Practice', 'Test description', 'navigation');
    });

    test('should emit anti-pattern creation events', (done) => {
      const subscription = eventBus.subscribe('ux_anti_pattern_created', (event) => {
        expect(event.data.antiPatternId).toBeDefined();
        expect(event.data.title).toBe('Test Anti-Pattern');
        expect(event.data.category).toBe('navigation');
        eventBus.unsubscribe(subscription.id);
        done();
      });

      uxRepository.addAntiPattern('Test Anti-Pattern', 'Test description', 'navigation');
    });

    test('should emit guideline creation events', (done) => {
      const subscription = eventBus.subscribe('ux_guideline_created', (event) => {
        expect(event.data.guidelineId).toBeDefined();
        expect(event.data.title).toBe('Test Guideline');
        expect(event.data.category).toBe('navigation');
        expect(event.data.priority).toBe('high');
        eventBus.unsubscribe(subscription.id);
        done();
      });

      uxRepository.addGuideline('Test Guideline', 'Test description', 'navigation', 'high');
    });
  });
}); 