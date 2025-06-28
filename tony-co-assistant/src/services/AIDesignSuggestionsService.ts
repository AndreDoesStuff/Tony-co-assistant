import { 
  DesignSuggestion, 
  SuggestionContext, 
  ContextAnalysis, 
  SuggestionEngine,
  RecommendationHistory,
  SuggestionPerformance,
  SuggestionConfig
} from '../types/tony';

/**
 * AI Design Suggestions Service
 * Handles backend API integration for AI design suggestions
 */
export class AIDesignSuggestionsService {
  private baseUrl: string;
  private apiKey: string;
  private isOnline: boolean = true;

  constructor(baseUrl: string = '/api/ai-suggestions', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || '';
  }

  /**
   * Generate design suggestions
   */
  async generateSuggestions(
    userId: string,
    context: any,
    maxSuggestions: number = 5
  ): Promise<DesignSuggestion[]> {
    try {
      const response = await this.makeRequest('POST', '/generate', {
        userId,
        context,
        maxSuggestions
      });

      return response.suggestions || [];
    } catch (error) {
      console.error('Failed to generate suggestions via API:', error);
      return this.generateSuggestionsLocal(userId, context, maxSuggestions);
    }
  }

  /**
   * Analyze context
   */
  async analyzeContext(userId: string, context: any): Promise<SuggestionContext> {
    try {
      const response = await this.makeRequest('POST', '/analyze-context', {
        userId,
        context
      });

      return response.analysis;
    } catch (error) {
      console.error('Failed to analyze context via API:', error);
      return this.analyzeContextLocal(userId, context);
    }
  }

  /**
   * Add suggestion feedback
   */
  async addSuggestionFeedback(
    suggestionId: string,
    userId: string,
    rating: number,
    comment?: string,
    implemented: boolean = false,
    effectiveness: number = 0
  ): Promise<boolean> {
    try {
      const response = await this.makeRequest('POST', '/feedback', {
        suggestionId,
        userId,
        rating,
        comment,
        implemented,
        effectiveness
      });

      return response.success;
    } catch (error) {
      console.error('Failed to add feedback via API:', error);
      return this.addFeedbackLocal(suggestionId, userId, rating, comment, implemented, effectiveness);
    }
  }

  /**
   * Get suggestions by type
   */
  async getSuggestionsByType(type: DesignSuggestion['type']): Promise<DesignSuggestion[]> {
    try {
      const response = await this.makeRequest('GET', `/suggestions/type/${type}`);
      return response.suggestions || [];
    } catch (error) {
      console.error('Failed to get suggestions by type via API:', error);
      return this.getSuggestionsByTypeLocal(type);
    }
  }

  /**
   * Get suggestions by priority
   */
  async getSuggestionsByPriority(priority: DesignSuggestion['priority']): Promise<DesignSuggestion[]> {
    try {
      const response = await this.makeRequest('GET', `/suggestions/priority/${priority}`);
      return response.suggestions || [];
    } catch (error) {
      console.error('Failed to get suggestions by priority via API:', error);
      return this.getSuggestionsByPriorityLocal(priority);
    }
  }

  /**
   * Get high-confidence suggestions
   */
  async getHighConfidenceSuggestions(minConfidence: number = 0.8): Promise<DesignSuggestion[]> {
    try {
      const response = await this.makeRequest('GET', `/suggestions/confidence/${minConfidence}`);
      return response.suggestions || [];
    } catch (error) {
      console.error('Failed to get high-confidence suggestions via API:', error);
      return this.getHighConfidenceSuggestionsLocal(minConfidence);
    }
  }

  /**
   * Get recent suggestions
   */
  async getRecentSuggestions(hours: number = 24): Promise<DesignSuggestion[]> {
    try {
      const response = await this.makeRequest('GET', `/suggestions/recent/${hours}`);
      return response.suggestions || [];
    } catch (error) {
      console.error('Failed to get recent suggestions via API:', error);
      return this.getRecentSuggestionsLocal(hours);
    }
  }

  /**
   * Get suggestion statistics
   */
  async getSuggestionStats(): Promise<{
    totalSuggestions: number;
    suggestionsByType: Record<string, number>;
    suggestionsByPriority: Record<string, number>;
    averageConfidence: number;
    averageRelevance: number;
    acceptanceRate: number;
    implementationRate: number;
  }> {
    try {
      const response = await this.makeRequest('GET', '/stats');
      return response.stats;
    } catch (error) {
      console.error('Failed to get suggestion stats via API:', error);
      return this.getSuggestionStatsLocal();
    }
  }

  /**
   * Get recommendation history
   */
  async getRecommendationHistory(userId?: string): Promise<RecommendationHistory[]> {
    try {
      const url = userId ? `/history/user/${userId}` : '/history';
      const response = await this.makeRequest('GET', url);
      return response.history || [];
    } catch (error) {
      console.error('Failed to get recommendation history via API:', error);
      return this.getRecommendationHistoryLocal(userId);
    }
  }

  /**
   * Update suggestion configuration
   */
  async updateConfiguration(updates: Partial<SuggestionConfig>): Promise<boolean> {
    try {
      const response = await this.makeRequest('PUT', '/configuration', { updates });
      return response.success;
    } catch (error) {
      console.error('Failed to update configuration via API:', error);
      return this.updateConfigurationLocal(updates);
    }
  }

  /**
   * Get suggestion engine status
   */
  async getSuggestionEngineStatus(): Promise<SuggestionEngine> {
    try {
      const response = await this.makeRequest('GET', '/engine/status');
      return response.engine;
    } catch (error) {
      console.error('Failed to get engine status via API:', error);
      return this.getSuggestionEngineStatusLocal();
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<SuggestionPerformance> {
    try {
      const response = await this.makeRequest('GET', '/performance');
      return response.performance;
    } catch (error) {
      console.error('Failed to get performance metrics via API:', error);
      return this.getPerformanceMetricsLocal();
    }
  }

  /**
   * Export suggestions data
   */
  async exportSuggestions(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const response = await this.makeRequest('GET', `/export/${format}`);
      return response.data;
    } catch (error) {
      console.error('Failed to export suggestions via API:', error);
      return this.exportSuggestionsLocal(format);
    }
  }

  /**
   * Import suggestions data
   */
  async importSuggestions(data: string, format: 'json' | 'csv' = 'json'): Promise<boolean> {
    try {
      const response = await this.makeRequest('POST', `/import/${format}`, { data });
      return response.success;
    } catch (error) {
      console.error('Failed to import suggestions via API:', error);
      return this.importSuggestionsLocal(data, format);
    }
  }

  /**
   * Get context analysis history
   */
  async getContextAnalysisHistory(userId?: string): Promise<ContextAnalysis[]> {
    try {
      const url = userId ? `/context-analysis/user/${userId}` : '/context-analysis';
      const response = await this.makeRequest('GET', url);
      return response.analysis || [];
    } catch (error) {
      console.error('Failed to get context analysis history via API:', error);
      return this.getContextAnalysisHistoryLocal(userId);
    }
  }

  /**
   * Get suggestion analytics
   */
  async getSuggestionAnalytics(timeframe: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<{
    suggestionsGenerated: number;
    suggestionsAccepted: number;
    suggestionsRejected: number;
    averageConfidence: number;
    averageRelevance: number;
    topSuggestionTypes: Array<{ type: string; count: number }>;
    userSatisfaction: number;
    implementationRate: number;
  }> {
    try {
      const response = await this.makeRequest('GET', `/analytics/${timeframe}`);
      return response.analytics;
    } catch (error) {
      console.error('Failed to get suggestion analytics via API:', error);
      return this.getSuggestionAnalyticsLocal(timeframe);
    }
  }

  /**
   * Search suggestions
   */
  async searchSuggestions(query: string, filters?: {
    type?: DesignSuggestion['type'];
    priority?: DesignSuggestion['priority'];
    minConfidence?: number;
    minRelevance?: number;
  }): Promise<DesignSuggestion[]> {
    try {
      const response = await this.makeRequest('POST', '/search', {
        query,
        filters
      });
      return response.suggestions || [];
    } catch (error) {
      console.error('Failed to search suggestions via API:', error);
      return this.searchSuggestionsLocal(query, filters);
    }
  }

  /**
   * Make HTTP request
   */
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.isOnline) {
      throw new Error('Service is offline');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include'
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Local fallback methods

  /**
   * Generate suggestions locally
   */
  private generateSuggestionsLocal(
    userId: string,
    context: any,
    maxSuggestions: number
  ): DesignSuggestion[] {
    // Mock implementation for offline mode
    return [
      {
        id: `local_suggestion_${Date.now()}`,
        type: 'pattern',
        title: 'Apply Card Layout Pattern',
        description: 'Consider using a card layout for better content organization',
        content: { name: 'Card Layout', category: 'layout' },
        confidence: 0.8,
        relevance: 0.7,
        priority: 'medium',
        context: this.analyzeContextLocal(userId, context),
        sources: ['local_pattern_library'],
        reasoning: ['Improves content organization', 'Enhances user experience'],
        alternatives: [],
        implementation: {
          steps: [
            { order: 1, title: 'Review Card Layout', description: 'Understand the pattern', tips: ['Read documentation'] },
            { order: 2, title: 'Plan Implementation', description: 'Plan integration', tips: ['Consider dependencies'] },
            { order: 3, title: 'Implement Pattern', description: 'Apply the pattern', tips: ['Test thoroughly'] }
          ],
          codeExamples: [],
          resources: [],
          estimatedTime: 30,
          difficulty: 'medium',
          prerequisites: []
        },
        feedback: [],
        createdAt: Date.now(),
        lastUpdated: Date.now()
      }
    ];
  }

  /**
   * Analyze context locally
   */
  private analyzeContextLocal(userId: string, context: any): SuggestionContext {
    return {
      userContext: {
        userId,
        preferences: context.preferences || {},
        skillLevel: context.skillLevel || 'intermediate',
        projectType: context.projectType || 'general',
        goals: [],
        constraints: []
      },
      designContext: {
        currentDesign: context.currentDesign || {},
        designSystem: context.designSystem || {},
        availableAssets: context.availableAssets || [],
        designPatterns: [],
        styleGuide: {},
        platform: context.platform || 'web',
        deviceType: context.deviceType || 'desktop'
      },
      interactionContext: {
        userInteractions: context.userInteractions || [],
        interactionPatterns: context.interactionPatterns || [],
        userBehavior: context.userBehavior || {},
        painPoints: [],
        successMetrics: { successRate: 0, averageDuration: 0, totalInteractions: 0 }
      },
      learningContext: {
        learnedPatterns: context.learnedPatterns || [],
        knowledgeBase: context.knowledgeBase || [],
        userProgress: context.userProgress || {},
        strengths: [],
        weaknesses: []
      },
      constraints: {
        technical: context.technicalConstraints || [],
        business: context.businessConstraints || [],
        accessibility: context.accessibilityConstraints || [],
        performance: context.performanceConstraints || [],
        budget: context.budgetConstraints || [],
        timeline: context.timelineConstraints || []
      }
    };
  }

  /**
   * Add feedback locally
   */
  private addFeedbackLocal(
    suggestionId: string,
    userId: string,
    rating: number,
    comment?: string,
    implemented: boolean = false,
    effectiveness: number = 0
  ): boolean {
    // Store feedback in localStorage for offline mode
    const feedback = {
      suggestionId,
      userId,
      rating,
      comment,
      implemented,
      effectiveness,
      timestamp: Date.now()
    };

    const existingFeedback = JSON.parse(localStorage.getItem('ai_suggestions_feedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('ai_suggestions_feedback', JSON.stringify(existingFeedback));

    return true;
  }

  /**
   * Get suggestions by type locally
   */
  private getSuggestionsByTypeLocal(type: DesignSuggestion['type']): DesignSuggestion[] {
    // Mock implementation
    return [];
  }

  /**
   * Get suggestions by priority locally
   */
  private getSuggestionsByPriorityLocal(priority: DesignSuggestion['priority']): DesignSuggestion[] {
    // Mock implementation
    return [];
  }

  /**
   * Get high-confidence suggestions locally
   */
  private getHighConfidenceSuggestionsLocal(minConfidence: number): DesignSuggestion[] {
    // Mock implementation
    return [];
  }

  /**
   * Get recent suggestions locally
   */
  private getRecentSuggestionsLocal(hours: number): DesignSuggestion[] {
    // Mock implementation
    return [];
  }

  /**
   * Get suggestion stats locally
   */
  private getSuggestionStatsLocal(): {
    totalSuggestions: number;
    suggestionsByType: Record<string, number>;
    suggestionsByPriority: Record<string, number>;
    averageConfidence: number;
    averageRelevance: number;
    acceptanceRate: number;
    implementationRate: number;
  } {
    return {
      totalSuggestions: 0,
      suggestionsByType: {},
      suggestionsByPriority: {},
      averageConfidence: 0,
      averageRelevance: 0,
      acceptanceRate: 0,
      implementationRate: 0
    };
  }

  /**
   * Get recommendation history locally
   */
  private getRecommendationHistoryLocal(userId?: string): RecommendationHistory[] {
    // Mock implementation
    return [];
  }

  /**
   * Update configuration locally
   */
  private updateConfigurationLocal(updates: Partial<SuggestionConfig>): boolean {
    // Store configuration in localStorage
    const existingConfig = JSON.parse(localStorage.getItem('ai_suggestions_config') || '{}');
    const newConfig = { ...existingConfig, ...updates };
    localStorage.setItem('ai_suggestions_config', JSON.stringify(newConfig));
    return true;
  }

  /**
   * Get suggestion engine status locally
   */
  private getSuggestionEngineStatusLocal(): SuggestionEngine {
    return {
      active: true,
      algorithms: [],
      thresholds: {
        confidence: 0.7,
        relevance: 0.6,
        similarity: 0.8,
        frequency: 0.5,
        recency: 0.3
      },
      statistics: {
        suggestionsGenerated: 0,
        suggestionsAccepted: 0,
        suggestionsRejected: 0,
        averageConfidence: 0,
        averageRelevance: 0,
        processingTime: 0,
        byType: {},
        byAlgorithm: {}
      },
      configuration: {
        maxSuggestions: 5,
        suggestionLifetime: 3600000,
        updateInterval: 300000,
        learningEnabled: true,
        contextWeight: 0.4,
        patternWeight: 0.3,
        userPreferenceWeight: 0.3
      }
    };
  }

  /**
   * Get performance metrics locally
   */
  private getPerformanceMetricsLocal(): SuggestionPerformance {
    return {
      overall: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        responseTime: 0,
        throughput: 0,
        errorRate: 0
      },
      byType: {},
      byAlgorithm: {},
      trends: [],
      userSatisfaction: 0,
      implementationRate: 0,
      effectivenessRate: 0
    };
  }

  /**
   * Export suggestions locally
   */
  private exportSuggestionsLocal(format: 'json' | 'csv'): string {
    // Mock implementation
    return format === 'json' ? '{}' : '';
  }

  /**
   * Import suggestions locally
   */
  private importSuggestionsLocal(data: string, format: 'json' | 'csv'): boolean {
    // Mock implementation
    return true;
  }

  /**
   * Get context analysis history locally
   */
  private getContextAnalysisHistoryLocal(userId?: string): ContextAnalysis[] {
    // Mock implementation
    return [];
  }

  /**
   * Get suggestion analytics locally
   */
  private getSuggestionAnalyticsLocal(timeframe: 'day' | 'week' | 'month' | 'year'): {
    suggestionsGenerated: number;
    suggestionsAccepted: number;
    suggestionsRejected: number;
    averageConfidence: number;
    averageRelevance: number;
    topSuggestionTypes: Array<{ type: string; count: number }>;
    userSatisfaction: number;
    implementationRate: number;
  } {
    return {
      suggestionsGenerated: 0,
      suggestionsAccepted: 0,
      suggestionsRejected: 0,
      averageConfidence: 0,
      averageRelevance: 0,
      topSuggestionTypes: [],
      userSatisfaction: 0,
      implementationRate: 0
    };
  }

  /**
   * Search suggestions locally
   */
  private searchSuggestionsLocal(
    query: string,
    filters?: {
      type?: DesignSuggestion['type'];
      priority?: DesignSuggestion['priority'];
      minConfidence?: number;
      minRelevance?: number;
    }
  ): DesignSuggestion[] {
    // Mock implementation
    return [];
  }

  /**
   * Set online/offline status
   */
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
  }

  /**
   * Get online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }
} 