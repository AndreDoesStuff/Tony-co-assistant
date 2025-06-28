import { componentManager } from '../ComponentManager';
import { memorySystem } from '../MemorySystem';
import { learningSystem } from '../LearningSystem';
import { designSystem } from '../DesignSystem';
import { uxRepository } from '../UXRepository';
import { schoolBench } from '../SchoolBench';
import { assetLibrary } from '../AssetLibrary';

describe('Component Scaffolding', () => {
  beforeEach(async () => {
    // Clean up before each test
    await componentManager.cleanup();
  });

  afterAll(async () => {
    // Clean up after all tests
    await componentManager.cleanup();
  });

  describe('Component Manager', () => {
    test('should register all components', () => {
      const components = componentManager.getAllComponents();
      expect(components.size).toBe(6);
      
      expect(components.has('MemorySystem')).toBe(true);
      expect(components.has('LearningSystem')).toBe(true);
      expect(components.has('DesignSystem')).toBe(true);
      expect(components.has('UXRepository')).toBe(true);
      expect(components.has('SchoolBench')).toBe(true);
      expect(components.has('AssetLibrary')).toBe(true);
    });

    test('should validate dependencies', () => {
      const validation = componentManager.validateDependencies();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should get initialization order', () => {
      const order = componentManager.getInitializationOrder();
      expect(order).toHaveLength(6);
      expect(order[0]).toBe('MemorySystem');
      expect(order[1]).toBe('LearningSystem');
    });

    test('should initialize all components', async () => {
      await componentManager.initialize();
      
      const health = componentManager.getSystemHealth();
      expect(health.isInitialized).toBe(true);
      expect(health.initializedCount).toBe(6);
      expect(health.componentCount).toBe(6);
      
      // Check that all components are active
      Object.values(health.status).forEach(status => {
        expect(status).toBe(true);
      });
    });

    test('should get component statistics', async () => {
      await componentManager.initialize();
      
      const stats = await componentManager.getComponentStats();
      expect(stats).toBeDefined();
      expect(Object.keys(stats)).toHaveLength(6);
      
      // Check that each component has stats
      expect(stats.MemorySystem).toBeDefined();
      expect(stats.LearningSystem).toBeDefined();
      expect(stats.DesignSystem).toBeDefined();
      expect(stats.UXRepository).toBeDefined();
      expect(stats.SchoolBench).toBeDefined();
      expect(stats.AssetLibrary).toBeDefined();
    });
  });

  describe('Memory System', () => {
    test('should initialize memory system', async () => {
      await memorySystem.initialize();
      expect(memorySystem.getState()).toBeDefined();
    });

    test('should create memory nodes', () => {
      const node = memorySystem.createNode('interaction', { test: 'data' }, 'test');
      expect(node).toBeDefined();
      expect(node.id).toBeDefined();
      expect(node.type).toBe('interaction');
      expect(node.data).toEqual({ test: 'data' });
    });

    test('should search memory nodes', () => {
      memorySystem.createNode('interaction', { test: 'data' }, 'test', ['tag1']);
      const results = memorySystem.searchNodes({ type: 'interaction', tags: ['tag1'] });
      expect(results).toHaveLength(1);
    });

    test('should get memory statistics', () => {
      const stats = memorySystem.getStats();
      expect(stats.totalNodes).toBeGreaterThanOrEqual(0);
      expect(stats.shortTermCount).toBeGreaterThanOrEqual(0);
      expect(stats.longTermCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Learning System', () => {
    test('should initialize learning system', async () => {
      await learningSystem.initialize();
      expect(learningSystem.getState()).toBeDefined();
    });

    test('should learn patterns', () => {
      const pattern = learningSystem.learnPattern('test', { data: 'test' }, ['source']);
      expect(pattern).toBeDefined();
      expect(pattern.type).toBe('test');
      expect(pattern.confidence).toBe(0.5);
    });

    test('should add feedback loops', () => {
      const feedback = learningSystem.addFeedbackLoop('user', { rating: 5 });
      expect(feedback).toBeDefined();
      expect(feedback.type).toBe('user');
      expect(feedback.processed).toBe(false);
    });

    test('should get learning statistics', () => {
      const stats = learningSystem.getStats();
      expect(stats.patternCount).toBeGreaterThanOrEqual(0);
      expect(stats.feedbackCount).toBeGreaterThanOrEqual(0);
      expect(stats.knowledgeCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Design System', () => {
    test('should initialize design system', async () => {
      await designSystem.initialize();
      expect(designSystem.getState()).toBeDefined();
    });

    test('should add design patterns', () => {
      const pattern = designSystem.addPattern('Button', 'UI', 'A clickable button component');
      expect(pattern).toBeDefined();
      expect(pattern.name).toBe('Button');
      expect(pattern.category).toBe('UI');
    });

    test('should add design components', () => {
      const component = designSystem.addComponent('Button', 'button', { text: 'Click me' });
      expect(component).toBeDefined();
      expect(component.name).toBe('Button');
      expect(component.type).toBe('button');
    });

    test('should get design statistics', () => {
      const stats = designSystem.getStats();
      expect(stats.patternCount).toBeGreaterThanOrEqual(0);
      expect(stats.componentCount).toBeGreaterThanOrEqual(0);
      expect(stats.assetCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('UX Repository', () => {
    test('should initialize UX repository', async () => {
      await uxRepository.initialize();
      expect(uxRepository.getState()).toBeDefined();
    });

    test('should record interactions', () => {
      const interaction = uxRepository.recordInteraction('click', 'user1', { button: 'submit' });
      expect(interaction).toBeDefined();
      expect(interaction.type).toBe('click');
      expect(interaction.userId).toBe('user1');
    });

    test('should add UX patterns', () => {
      const pattern = uxRepository.addDesignPattern('Button Click', 'interaction', 'Users frequently click buttons');
      expect(pattern).toBeDefined();
      expect(pattern.name).toBe('Button Click');
      expect(pattern.category).toBe('interaction');
    });

    test('should get UX statistics', () => {
      const stats = uxRepository.getStats();
      expect(stats.interactionCount).toBeGreaterThanOrEqual(0);
      expect(stats.patternCount).toBeGreaterThanOrEqual(0);
      expect(stats.insightCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('School Bench', () => {
    test('should initialize school bench', async () => {
      await schoolBench.initialize();
      expect(schoolBench.getState()).toBeDefined();
    });

    test('should add lessons', () => {
      const lesson = schoolBench.addLesson('React Basics', { content: 'Learn React' });
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe('React Basics');
      expect(lesson.completed).toBe(false);
    });

    test('should complete lessons', () => {
      const lesson = schoolBench.addLesson('Test Lesson', { content: 'test' });
      const result = schoolBench.completeLesson(lesson.id, 0.8);
      expect(result).toBe(true);
    });

    test('should get school statistics', () => {
      const stats = schoolBench.getStats();
      expect(stats.lessonCount).toBeGreaterThanOrEqual(0);
      expect(stats.completedLessonCount).toBeGreaterThanOrEqual(0);
      expect(stats.assessmentCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Asset Library', () => {
    test('should initialize asset library', async () => {
      await assetLibrary.initialize();
      expect(assetLibrary.getState()).toBeDefined();
    });

    test('should add assets', () => {
      const asset = assetLibrary.addAsset('Test Image', 'image', 'test.jpg', {}, ['tag1']);
      expect(asset).toBeDefined();
      expect(asset.name).toBe('Test Image');
      expect(asset.type).toBe('image');
      expect(asset.url).toBe('test.jpg');
    });

    test('should add categories', () => {
      const category = assetLibrary.addCategory('Icons', 'Icon assets');
      expect(category).toBeDefined();
      expect(category.name).toBe('Icons');
      expect(category.description).toBe('Icon assets');
    });

    test('should get asset statistics', () => {
      const stats = assetLibrary.getStats();
      expect(stats.assetCount).toBeGreaterThanOrEqual(0);
      expect(stats.categoryCount).toBeGreaterThanOrEqual(0);
      expect(stats.tagCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Component Integration', () => {
    test('should handle component lifecycle', async () => {
      // Initialize
      await componentManager.initialize();
      expect(componentManager.isSystemReady()).toBe(true);

      // Get component by name
      const memory = componentManager.getComponent('MemorySystem');
      expect(memory).toBeDefined();

      // Restart component
      const restartResult = await componentManager.restartComponent('MemorySystem');
      expect(restartResult).toBe(true);

      // Cleanup
      await componentManager.cleanup();
      expect(componentManager.isSystemReady()).toBe(false);
    });

    test('should handle component dependencies', () => {
      const dependencies = componentManager.getComponentDependencies();
      expect(dependencies.MemorySystem).toEqual([]);
      expect(dependencies.LearningSystem).toContain('MemorySystem');
      expect(dependencies.UXRepository).toContain('MemorySystem');
      expect(dependencies.UXRepository).toContain('LearningSystem');
    });
  });
}); 