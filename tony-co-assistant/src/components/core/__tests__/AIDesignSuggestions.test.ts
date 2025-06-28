import { AIDesignSuggestions } from '../AIDesignSuggestions';
import { 
  DesignSuggestion, 
  SuggestionContext, 
  SuggestionConfig 
} from '../../../types/tony';

// Mock the EventBus module
jest.mock('../../../events/EventBus', () => ({
  eventBus: {
    subscribe: jest.fn().mockReturnValue({ id: 'test-subscription' }),
    publishSimple: jest.fn().mockResolvedValue(undefined),
    unsubscribe: jest.fn()
  }
}));

// Mock the service
jest.mock('../../../services/AIDesignSuggestionsService');

describe('AIDesignSuggestions', () => {
  let aiSuggestions: AIDesignSuggestions;

  beforeEach(() => {
    aiSuggestions = new AIDesignSuggestions();
  });

  afterEach(async () => {
    try {
      await aiSuggestions.destroy();
    } catch (error) {
      // Ignore destroy errors in tests
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(aiSuggestions.initialize()).resolves.not.toThrow();
      expect(aiSuggestions.getState()).toBeDefined();
    });

    test('should not initialize twice', async () => {
      await aiSuggestions.initialize();
      await aiSuggestions.initialize(); // Should not throw
    });

    test('should have correct initial state structure', async () => {
      await aiSuggestions.initialize();
      const state = aiSuggestions.getState();
      
      expect(state).toHaveProperty('suggestions');
      expect(state).toHaveProperty('contextAnalysis');
      expect(state).toHaveProperty('suggestionEngine');
      expect(state).toHaveProperty('recommendationHistory');
      expect(state).toHaveProperty('performance');
      expect(state).toHaveProperty('configuration');
      
      expect(Array.isArray(state.suggestions)).toBe(true);
      expect(Array.isArray(state.contextAnalysis)).toBe(true);
      expect(Array.isArray(state.recommendationHistory)).toBe(true);
      expect(state.suggestionEngine).toHaveProperty('active');
      expect(state.suggestionEngine).toHaveProperty('algorithms');
      expect(state.suggestionEngine).toHaveProperty('statistics');
      expect(state.performance).toHaveProperty('overall');
      expect(state.configuration).toHaveProperty('enabled');
    });
  });

  describe('Suggestion Generation', () => {
    beforeEach(async () => {
      await aiSuggestions.initialize();
    });

    test('should generate suggestions successfully', async () => {
      const userId = 'test-user';
      const context = {
        preferences: { theme: 'dark' },
        skillLevel: 'intermediate',
        projectType: 'web',
        platform: 'web',
        deviceType: 'desktop',
        currentDesign: { type: 'dashboard' },
        designSystem: { colors: ['blue', 'green'] },
        availableAssets: ['icon1', 'icon2'],
        userInteractions: [],
        interactionPatterns: [],
        userBehavior: {},
        learnedPatterns: [],
        knowledgeBase: [],
        userProgress: {},
        strengths: ['layout'],
        weaknesses: ['typography']
      };

      const suggestions = await aiSuggestions.generateSuggestions(userId, context, 5);
      
      expect(Array.isArray(suggestions)).toBe(true);
      // Since we're using mock data, we expect some suggestions to be generated
      expect(suggestions.length).toBeGreaterThan(0);
      
      if (suggestions.length > 0) {
        expect(suggestions[0]).toHaveProperty('id');
        expect(suggestions[0]).toHaveProperty('type');
        expect(suggestions[0]).toHaveProperty('title');
        expect(suggestions[0]).toHaveProperty('description');
        expect(suggestions[0]).toHaveProperty('confidence');
        expect(suggestions[0]).toHaveProperty('relevance');
        expect(suggestions[0]).toHaveProperty('priority');
        expect(suggestions[0]).toHaveProperty('context');
        expect(suggestions[0]).toHaveProperty('reasoning');
        expect(suggestions[0]).toHaveProperty('implementation');
      }
    });

    test('should throw error if not initialized', async () => {
      const newAiSuggestions = new AIDesignSuggestions();
      await expect(
        newAiSuggestions.generateSuggestions('user', {}, 5)
      ).rejects.toThrow('AI Design Suggestions not initialized');
    });

    test('should respect max suggestions limit', async () => {
      const userId = 'test-user';
      const context = { preferences: {} };
      
      const suggestions = await aiSuggestions.generateSuggestions(userId, context, 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Context Analysis', () => {
    beforeEach(async () => {
      await aiSuggestions.initialize();
    });

    test('should analyze context successfully', async () => {
      const userId = 'test-user';
      const context = {
        preferences: { theme: 'dark', layout: 'grid' },
        skillLevel: 'advanced',
        projectType: 'mobile',
        platform: 'mobile',
        deviceType: 'phone',
        currentDesign: { components: ['Button', 'Card'] },
        designSystem: { styles: { colors: ['red', 'blue'] } },
        availableAssets: ['asset1', 'asset2'],
        userInteractions: [
          { type: 'click', outcome: 'success', duration: 1000 },
          { type: 'scroll', outcome: 'failure', duration: 6000 }
        ],
        interactionPatterns: ['swipe', 'tap'],
        userBehavior: { sessionTime: 300000 },
        learnedPatterns: ['responsive-design'],
        knowledgeBase: ['accessibility'],
        userProgress: { completedLessons: 5 },
        strengths: ['visual-design'],
        weaknesses: ['accessibility'],
        technicalConstraints: ['performance'],
        businessConstraints: ['budget'],
        accessibilityConstraints: ['wcag'],
        performanceConstraints: ['load-time'],
        budgetConstraints: ['cost'],
        timelineConstraints: ['deadline']
      };

      const analyzedContext = await aiSuggestions.analyzeContext(userId, context);
      
      expect(analyzedContext).toHaveProperty('userContext');
      expect(analyzedContext).toHaveProperty('designContext');
      expect(analyzedContext).toHaveProperty('interactionContext');
      expect(analyzedContext).toHaveProperty('learningContext');
      expect(analyzedContext).toHaveProperty('constraints');
      
      expect(analyzedContext.userContext.userId).toBe(userId);
      expect(analyzedContext.userContext.skillLevel).toBe('advanced');
      expect(analyzedContext.userContext.projectType).toBe('mobile');
      expect(analyzedContext.designContext.platform).toBe('mobile');
      expect(analyzedContext.designContext.deviceType).toBe('phone');
    });

    test('should handle empty context gracefully', async () => {
      const userId = 'test-user';
      const context = {};
      
      const analyzedContext = await aiSuggestions.analyzeContext(userId, context);
      
      expect(analyzedContext.userContext.skillLevel).toBe('intermediate');
      expect(analyzedContext.userContext.projectType).toBe('general');
      expect(analyzedContext.designContext.platform).toBe('web');
      expect(analyzedContext.designContext.deviceType).toBe('desktop');
    });
  });

  describe('Feedback Management', () => {
    beforeEach(async () => {
      await aiSuggestions.initialize();
    });

    test('should add feedback successfully', () => {
      const suggestionId = 'test-suggestion';
      const userId = 'test-user';
      const rating = 4;
      const comment = 'Great suggestion!';
      const implemented = true;
      const effectiveness = 0.9;

      // First, we need to have a suggestion in the store
      const mockSuggestion: DesignSuggestion = {
        id: suggestionId,
        type: 'pattern',
        title: 'Test Suggestion',
        description: 'Test description',
        content: {},
        confidence: 0.8,
        relevance: 0.7,
        priority: 'medium',
        context: {} as SuggestionContext,
        sources: [],
        reasoning: [],
        alternatives: [],
        implementation: {
          steps: [],
          codeExamples: [],
          resources: [],
          estimatedTime: 30,
          difficulty: 'medium',
          prerequisites: []
        },
        feedback: [],
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      // Manually add suggestion to store for testing
      const state = aiSuggestions.getState();
      state.suggestions = [mockSuggestion];

      const result = aiSuggestions.addSuggestionFeedback(
        suggestionId,
        userId,
        rating,
        comment,
        implemented,
        effectiveness
      );

      expect(result).toBe(true);
      
      // Verify feedback was added
      const updatedState = aiSuggestions.getState();
      const updatedSuggestion = updatedState.suggestions.find(s => s.id === suggestionId);
      expect(updatedSuggestion?.feedback).toHaveLength(1);
      expect(updatedSuggestion?.feedback[0]).toEqual({
        userId,
        rating,
        comment,
        implemented,
        effectiveness,
        timestamp: expect.any(Number)
      });
    });

    test('should return false for non-existent suggestion', () => {
      const result = aiSuggestions.addSuggestionFeedback(
        'non-existent',
        'test-user',
        5,
        'Great!',
        false,
        0.8
      );
      
      expect(result).toBe(false);
    });

    test('should update statistics when feedback is added', () => {
      const suggestionId = 'test-suggestion';
      const userId = 'test-user';

      // Add a suggestion first
      const mockSuggestion: DesignSuggestion = {
        id: suggestionId,
        type: 'pattern',
        title: 'Test Suggestion',
        description: 'Test description',
        content: {},
        confidence: 0.8,
        relevance: 0.7,
        priority: 'medium',
        context: {} as SuggestionContext,
        sources: [],
        reasoning: [],
        alternatives: [],
        implementation: {
          steps: [],
          codeExamples: [],
          resources: [],
          estimatedTime: 30,
          difficulty: 'medium',
          prerequisites: []
        },
        feedback: [],
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const state = aiSuggestions.getState();
      state.suggestions = [mockSuggestion];
      const initialStats = state.suggestionEngine.statistics;

      // Add implemented feedback
      aiSuggestions.addSuggestionFeedback(suggestionId, userId, 5, 'Implemented', true, 1.0);
      
      const updatedState = aiSuggestions.getState();
      const updatedStats = updatedState.suggestionEngine.statistics;
      
      expect(updatedStats.suggestionsAccepted).toBe(initialStats.suggestionsAccepted + 1);
    });
  });

  describe('Suggestion Filtering', () => {
    beforeEach(async () => {
      await aiSuggestions.initialize();
    });

    test('should filter suggestions by type', () => {
      const patternSuggestions = aiSuggestions.getSuggestionsByType('pattern');
      const componentSuggestions = aiSuggestions.getSuggestionsByType('component');
      
      expect(Array.isArray(patternSuggestions)).toBe(true);
      expect(Array.isArray(componentSuggestions)).toBe(true);
    });

    test('should filter suggestions by priority', () => {
      const highPrioritySuggestions = aiSuggestions.getSuggestionsByPriority('high');
      const mediumPrioritySuggestions = aiSuggestions.getSuggestionsByPriority('medium');
      
      expect(Array.isArray(highPrioritySuggestions)).toBe(true);
      expect(Array.isArray(mediumPrioritySuggestions)).toBe(true);
    });

    test('should filter high-confidence suggestions', () => {
      const highConfidenceSuggestions = aiSuggestions.getHighConfidenceSuggestions(0.8);
      expect(Array.isArray(highConfidenceSuggestions)).toBe(true);
    });

    test('should filter recent suggestions', () => {
      const recentSuggestions = aiSuggestions.getRecentSuggestions(24);
      expect(Array.isArray(recentSuggestions)).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    beforeEach(async () => {
      await aiSuggestions.initialize();
    });

    test('should update configuration successfully', () => {
      const updates: Partial<SuggestionConfig> = {
        autoSuggest: false,
        suggestionLimit: 10,
        confidenceThreshold: 0.8
      };

      aiSuggestions.updateConfiguration(updates);
      
      // Verify configuration was updated
      const state = aiSuggestions.getState();
      expect(state.configuration.autoSuggest).toBe(false);
      expect(state.configuration.suggestionLimit).toBe(10);
      expect(state.configuration.confidenceThreshold).toBe(0.8);
    });
  });

  describe('Statistics and Performance', () => {
    beforeEach(async () => {
      await aiSuggestions.initialize();
    });

    test('should return comprehensive statistics', () => {
      const stats = aiSuggestions.getStats();
      
      expect(stats).toHaveProperty('suggestions');
      expect(stats).toHaveProperty('contextAnalysis');
      expect(stats).toHaveProperty('recommendationHistory');
      expect(stats).toHaveProperty('suggestionEngine');
      expect(stats).toHaveProperty('performance');
      expect(stats).toHaveProperty('configuration');
      
      expect(typeof stats.suggestions).toBe('number');
      expect(typeof stats.contextAnalysis).toBe('number');
      expect(typeof stats.recommendationHistory).toBe('number');
      expect(stats.suggestionEngine).toHaveProperty('active');
      expect(stats.suggestionEngine).toHaveProperty('algorithms');
      expect(stats.suggestionEngine).toHaveProperty('statistics');
      expect(stats.performance).toHaveProperty('overall');
      expect(stats.configuration).toHaveProperty('enabled');
    });
  });

  describe('Error Handling', () => {
    test('should handle initialization errors gracefully', async () => {
      // Test with a new instance that hasn't been initialized
      const newAiSuggestions = new AIDesignSuggestions();
      
      // Should not throw during initialization
      await expect(newAiSuggestions.initialize()).resolves.not.toThrow();
    });

    test('should handle suggestion generation errors', async () => {
      await aiSuggestions.initialize();
      
      // Test with invalid context
      const invalidContext = null as any;
      
      // Should handle gracefully
      await expect(
        aiSuggestions.generateSuggestions('user', invalidContext, 5)
      ).resolves.toBeDefined();
    });
  });

  describe('Cleanup', () => {
    test('should destroy component successfully', async () => {
      await aiSuggestions.initialize();
      await expect(aiSuggestions.destroy()).resolves.not.toThrow();
    });

    test('should not destroy twice', async () => {
      await aiSuggestions.initialize();
      await aiSuggestions.destroy();
      await expect(aiSuggestions.destroy()).resolves.not.toThrow();
    });
  });

  describe('Integration Features', () => {
    beforeEach(async () => {
      await aiSuggestions.initialize();
    });

    test('should integrate with UX Repository patterns', async () => {
      const uxPatterns = await (aiSuggestions as any).getUXPatterns();
      expect(Array.isArray(uxPatterns)).toBe(true);
    });

    test('should integrate with Design System patterns', async () => {
      const designPatterns = await (aiSuggestions as any).getDesignPatterns();
      expect(Array.isArray(designPatterns)).toBe(true);
    });

    test('should integrate with Asset Library', async () => {
      const assets = await (aiSuggestions as any).getAssets();
      expect(Array.isArray(assets)).toBe(true);
    });

    test('should integrate with School Bench knowledge', async () => {
      const knowledgeBase = await (aiSuggestions as any).getKnowledgeBase();
      expect(Array.isArray(knowledgeBase)).toBe(true);
    });
  });
}); 