import { UXRepository as UXRepositoryType, UserInteraction, UXPattern, UXInsight, UXMetrics } from '../../types/tony';
import { eventBus } from '../../events/EventBus';

// Enhanced interfaces for Phase 3, Step 3.1
export interface DesignPattern {
  id: string;
  name: string;
  category: 'navigation' | 'input' | 'feedback' | 'layout' | 'interaction' | 'visual';
  description: string;
  usage: string[];
  examples: any[];
  confidence: number;
  lastUsed: number;
  relationships: string[];
  tags: string[];
  metrics: PatternMetrics;
}

export interface PatternMetrics {
  frequency: number;
  successRate: number;
  userSatisfaction: number;
  completionRate: number;
  errorRate: number;
  averageTime: number;
}

export interface UXDataIndex {
  interactions: Map<string, UserInteraction[]>;
  patterns: Map<string, DesignPattern[]>;
  insights: Map<string, UXInsight[]>;
  relationships: Map<string, string[]>;
  tags: Map<string, string[]>;
  categories: Map<string, string[]>;
}

export interface PatternRelationship {
  sourceId: string;
  targetId: string;
  type: 'similar' | 'complementary' | 'conflicting' | 'dependent' | 'alternative';
  strength: number;
  evidence: string[];
  lastUpdated: number;
}

export interface UXKnowledgeBase {
  patterns: DesignPattern[];
  relationships: PatternRelationship[];
  insights: UXInsight[];
  bestPractices: BestPractice[];
  antiPatterns: AntiPattern[];
  guidelines: Guideline[];
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  category: string;
  evidence: string[];
  confidence: number;
  lastUpdated: number;
}

export interface AntiPattern {
  id: string;
  title: string;
  description: string;
  category: string;
  problems: string[];
  solutions: string[];
  frequency: number;
  lastObserved: number;
}

export interface Guideline {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  compliance: number;
  lastUpdated: number;
}

/**
 * Pattern Analysis Engine
 * Handles pattern recognition, similarity calculations, and analysis algorithms
 */
class PatternAnalysisEngine {
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    this.isInitialized = true;
    console.log('Pattern Analysis Engine initialized');
  }

  /**
   * Analyze interaction for patterns
   */
  analyzeInteraction(interaction: UserInteraction): any {
    return {
      type: interaction.type,
      outcome: interaction.outcome,
      timestamp: interaction.timestamp,
      analysis: {
        complexity: this.calculateInteractionComplexity(interaction),
        success: interaction.outcome === 'success',
        duration: this.estimateInteractionDuration(interaction)
      }
    };
  }

  /**
   * Calculate pattern similarity
   */
  calculatePatternSimilarity(pattern1: DesignPattern, pattern2: DesignPattern): number {
    let similarity = 0;
    let factors = 0;

    // Category similarity
    if (pattern1.category === pattern2.category) {
      similarity += 0.3;
    }
    factors++;

    // Tag similarity
    const commonTags = pattern1.tags.filter(tag => pattern2.tags.includes(tag));
    const tagSimilarity = commonTags.length / Math.max(pattern1.tags.length, pattern2.tags.length, 1);
    similarity += tagSimilarity * 0.2;
    factors++;

    // Description similarity (simple word overlap)
    const words1 = pattern1.description.toLowerCase().split(/\s+/);
    const words2 = pattern2.description.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length, 1);
    similarity += wordSimilarity * 0.3;
    factors++;

    // Usage similarity
    const commonUsage = pattern1.usage.filter(usage => pattern2.usage.includes(usage));
    const usageSimilarity = commonUsage.length / Math.max(pattern1.usage.length, pattern2.usage.length, 1);
    similarity += usageSimilarity * 0.2;
    factors++;

    return similarity / factors;
  }

  /**
   * Check if interaction matches a pattern
   */
  checkPatternMatch(interaction: UserInteraction, pattern: DesignPattern): { confidence: number; reason: string } {
    // Simple matching based on interaction type and pattern usage
    const typeMatch = pattern.usage.some(usage => 
      usage.toLowerCase().includes(interaction.type.toLowerCase())
    );
    
    const confidence = typeMatch ? 0.7 : 0.2;
    const reason = typeMatch ? 'Interaction type matches pattern usage' : 'No direct match found';

    return { confidence, reason };
  }

  /**
   * Analyze pattern frequency
   */
  analyzePatternFrequency(patterns: Map<string, DesignPattern>): UXInsight | null {
    const patternArray = Array.from(patterns.values());
    if (patternArray.length === 0) return null;

    const totalFrequency = patternArray.reduce((sum, pattern) => sum + pattern.metrics.frequency, 0);
    const avgFrequency = totalFrequency / patternArray.length;
    
    const mostFrequent = patternArray.reduce((max, pattern) => 
      pattern.metrics.frequency > max.metrics.frequency ? pattern : max
    );

    return {
      id: `frequency_insight_${Date.now()}`,
      type: 'pattern_frequency',
      description: `Most frequent pattern: ${mostFrequent.name} (${mostFrequent.metrics.frequency} uses)`,
      confidence: 0.8,
      data: {
        totalPatterns: patternArray.length,
        averageFrequency: avgFrequency,
        mostFrequentPattern: mostFrequent.name,
        frequencyDistribution: patternArray.map(p => ({ name: p.name, frequency: p.metrics.frequency }))
      },
      timestamp: Date.now()
    };
  }

  /**
   * Analyze pattern relationships
   */
  analyzePatternRelationships(relationships: Map<string, PatternRelationship[]>): UXInsight | null {
    const allRelationships = Array.from(relationships.values()).flat();
    if (allRelationships.length === 0) return null;

    const relationshipTypes = allRelationships.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const strongestRelationship = allRelationships.reduce((max, rel) => 
      rel.strength > max.strength ? rel : max
    );

    return {
      id: `relationship_insight_${Date.now()}`,
      type: 'pattern_relationships',
      description: `Strongest pattern relationship: ${strongestRelationship.type} (strength: ${strongestRelationship.strength.toFixed(3)})`,
      confidence: 0.7,
      data: {
        totalRelationships: allRelationships.length,
        relationshipTypes,
        strongestRelationship: {
          source: strongestRelationship.sourceId,
          target: strongestRelationship.targetId,
          type: strongestRelationship.type,
          strength: strongestRelationship.strength
        }
      },
      timestamp: Date.now()
    };
  }

  /**
   * Analyze user satisfaction
   */
  analyzeUserSatisfaction(interactions: UserInteraction[]): UXInsight | null {
    if (interactions.length === 0) return null;

    const successfulInteractions = interactions.filter(i => i.outcome === 'success');
    const satisfactionRate = successfulInteractions.length / interactions.length;

    return {
      id: `satisfaction_insight_${Date.now()}`,
      type: 'user_satisfaction',
      description: `User satisfaction rate: ${(satisfactionRate * 100).toFixed(1)}%`,
      confidence: 0.9,
      data: {
        totalInteractions: interactions.length,
        successfulInteractions: successfulInteractions.length,
        satisfactionRate,
        byType: this.groupInteractionsByType(interactions)
      },
      timestamp: Date.now()
    };
  }

  /**
   * Analyze error patterns
   */
  analyzeErrorPatterns(interactions: UserInteraction[]): UXInsight | null {
    const failedInteractions = interactions.filter(i => i.outcome === 'failure');
    if (failedInteractions.length === 0) return null;

    const errorByType = this.groupInteractionsByType(failedInteractions);
    const mostCommonError = Object.entries(errorByType).reduce((max, [type, count]) => 
      count > max.count ? { type, count } : max
    , { type: '', count: 0 });

    return {
      id: `error_insight_${Date.now()}`,
      type: 'error_patterns',
      description: `Most common error type: ${mostCommonError.type} (${mostCommonError.count} occurrences)`,
      confidence: 0.8,
      data: {
        totalErrors: failedInteractions.length,
        errorByType,
        mostCommonError: mostCommonError.type,
        errorRate: failedInteractions.length / interactions.length
      },
      timestamp: Date.now()
    };
  }

  /**
   * Calculate interaction complexity
   */
  private calculateInteractionComplexity(interaction: UserInteraction): number {
    // Simple complexity calculation based on data size and context
    const dataComplexity = JSON.stringify(interaction.data).length / 1000;
    const contextComplexity = JSON.stringify(interaction.context).length / 1000;
    return Math.min(1, (dataComplexity + contextComplexity) / 10);
  }

  /**
   * Estimate interaction duration
   */
  private estimateInteractionDuration(interaction: UserInteraction): number {
    // Simple estimation based on interaction type
    const durationMap: Record<string, number> = {
      'click': 0.1,
      'scroll': 0.5,
      'input': 2.0,
      'navigation': 1.0,
      'search': 3.0,
      'form_submit': 5.0
    };
    return durationMap[interaction.type] || 1.0;
  }

  /**
   * Group interactions by type
   */
  private groupInteractionsByType(interactions: UserInteraction[]): Record<string, number> {
    return interactions.reduce((acc, interaction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

/**
 * Enhanced UX Repository Component
 * Phase 3, Step 3.1 Implementation
 * Handles user interaction tracking, UX patterns, insights, and knowledge base
 */
export class UXRepository {
  private store: UXRepositoryType;
  private designPatterns: Map<string, DesignPattern> = new Map();
  private dataIndex: UXDataIndex;
  private knowledgeBase: UXKnowledgeBase;
  private patternRelationships: Map<string, PatternRelationship[]> = new Map();
  private isInitialized: boolean = false;
  private eventSubscriptions: any[] = [];
  private analysisEngine: PatternAnalysisEngine;

  constructor() {
    this.store = {
      interactions: [],
      patterns: [],
      insights: [],
      metrics: {
        engagement: 0,
        satisfaction: 0,
        efficiency: 0,
        errorRate: 0,
        completionRate: 0
      }
    };

    this.dataIndex = {
      interactions: new Map(),
      patterns: new Map(),
      insights: new Map(),
      relationships: new Map(),
      tags: new Map(),
      categories: new Map()
    };

    this.knowledgeBase = {
      patterns: [],
      relationships: [],
      insights: [],
      bestPractices: [],
      antiPatterns: [],
      guidelines: []
    };

    this.analysisEngine = new PatternAnalysisEngine();
  }

  /**
   * Initialize the enhanced UX repository
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Subscribe to enhanced UX-related events
      this.eventSubscriptions.push(
        eventBus.subscribe('ux_interaction', this.handleInteraction.bind(this)),
        eventBus.subscribe('ux_pattern_detected', this.handlePatternDetection.bind(this)),
        eventBus.subscribe('ux_insight_generated', this.handleInsightGeneration.bind(this)),
        eventBus.subscribe('ux_metrics_update', this.handleMetricsUpdate.bind(this)),
        eventBus.subscribe('ux_design_pattern_created', this.handleDesignPatternCreation.bind(this)),
        eventBus.subscribe('ux_pattern_relationship_detected', this.handlePatternRelationship.bind(this)),
        eventBus.subscribe('ux_knowledge_base_updated', this.handleKnowledgeBaseUpdate.bind(this))
      );
      
      // Initialize analysis engine
      await this.analysisEngine.initialize();
      
      // Build initial data index
      await this.buildDataIndex();
      
      this.isInitialized = true;
      console.log('Enhanced UX Repository initialized');
      
      // Emit initialization event
      await eventBus.publishSimple(
        'ux_repository_initialized',
        'UXRepository',
        { 
          timestamp: Date.now(),
          features: ['design_patterns', 'pattern_analysis', 'data_indexing', 'relationship_mapping', 'knowledge_base']
        },
        { component: 'UXRepository' }
      );
    } catch (error) {
      console.error('Failed to initialize Enhanced UX Repository:', error);
      throw error;
    }
  }

  /**
   * Enhanced user interaction tracking with detailed analytics
   */
  recordInteraction(
    type: string,
    userId: string,
    data: any,
    context: any = {},
    outcome: 'success' | 'failure' | 'partial' = 'success',
    metadata: any = {}
  ): UserInteraction {
    const id = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const interaction: UserInteraction = {
      id,
      type,
      userId,
      timestamp: Date.now(),
      data,
      context,
      outcome
    };

    this.store.interactions.push(interaction);

    // Update data index
    this.updateInteractionIndex(interaction);

    // Analyze interaction for patterns
    this.analyzeInteractionForPatterns(interaction);

    // Emit enhanced interaction recorded event
    eventBus.publishSimple(
      'ux_interaction_recorded',
      'UXRepository',
      { 
        interactionId: id, 
        type, 
        userId, 
        outcome,
        patternAnalysis: this.analysisEngine.analyzeInteraction(interaction)
      },
      { component: 'UXRepository' }
    );

    return interaction;
  }

  /**
   * Enhanced UX pattern management with design patterns
   */
  addDesignPattern(
    name: string,
    category: DesignPattern['category'],
    description: string,
    usage: string[] = [],
    examples: any[] = [],
    tags: string[] = []
  ): DesignPattern {
    const id = `design_pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const pattern: DesignPattern = {
      id,
      name,
      category,
      description,
      usage,
      examples,
      confidence: 0.5,
      lastUsed: Date.now(),
      relationships: [],
      tags,
      metrics: {
        frequency: 0,
        successRate: 0,
        userSatisfaction: 0,
        completionRate: 0,
        errorRate: 0,
        averageTime: 0
      }
    };

    this.designPatterns.set(id, pattern);
    this.knowledgeBase.patterns.push(pattern);

    // Update data index
    this.updatePatternIndex(pattern);

    // Analyze pattern relationships
    this.analyzePatternRelationships(pattern);

    // Emit design pattern creation event
    eventBus.publishSimple(
      'ux_design_pattern_created',
      'UXRepository',
      { 
        patternId: id, 
        name, 
        category,
        relationships: pattern.relationships
      },
      { component: 'UXRepository' }
    );

    return pattern;
  }

  /**
   * Update design pattern with enhanced metrics
   */
  updateDesignPattern(patternId: string, updates: Partial<DesignPattern>): boolean {
    const pattern = this.designPatterns.get(patternId);
    if (!pattern) {
      return false;
    }

    Object.assign(pattern, updates);
    pattern.lastUsed = Date.now();

    // Update data index
    this.updatePatternIndex(pattern);

    // Re-analyze relationships
    this.analyzePatternRelationships(pattern);

    // Emit pattern update event
    eventBus.publishSimple(
      'ux_design_pattern_updated',
      'UXRepository',
      { patternId, updates, relationships: pattern.relationships },
      { component: 'UXRepository' }
    );

    return true;
  }

  /**
   * Pattern analysis algorithms
   */
  async analyzePatterns(): Promise<UXInsight[]> {
    const insights: UXInsight[] = [];

    // Analyze pattern frequency and trends
    const frequencyInsight = this.analysisEngine.analyzePatternFrequency(this.designPatterns);
    if (frequencyInsight) insights.push(frequencyInsight);

    // Analyze pattern relationships
    const relationshipInsight = this.analysisEngine.analyzePatternRelationships(this.patternRelationships);
    if (relationshipInsight) insights.push(relationshipInsight);

    // Analyze user satisfaction patterns
    const satisfactionInsight = this.analysisEngine.analyzeUserSatisfaction(this.store.interactions);
    if (satisfactionInsight) insights.push(satisfactionInsight);

    // Analyze error patterns
    const errorInsight = this.analysisEngine.analyzeErrorPatterns(this.store.interactions);
    if (errorInsight) insights.push(errorInsight);

    // Add insights to knowledge base
    insights.forEach(insight => {
      this.knowledgeBase.insights.push(insight);
      this.updateInsightIndex(insight);
    });

    return insights;
  }

  /**
   * UX data indexing system
   */
  private async buildDataIndex(): Promise<void> {
    // Index interactions by type
    this.store.interactions.forEach(interaction => {
      this.updateInteractionIndex(interaction);
    });

    // Index patterns by category
    this.designPatterns.forEach(pattern => {
      this.updatePatternIndex(pattern);
    });

    // Index insights by type
    this.store.insights.forEach(insight => {
      this.updateInsightIndex(insight);
    });

    // Build relationship index
    this.buildRelationshipIndex();
  }

  /**
   * Update interaction index
   */
  private updateInteractionIndex(interaction: UserInteraction): void {
    // Index by type
    if (!this.dataIndex.interactions.has(interaction.type)) {
      this.dataIndex.interactions.set(interaction.type, []);
    }
    this.dataIndex.interactions.get(interaction.type)!.push(interaction);

    // Index by user
    if (!this.dataIndex.interactions.has(`user_${interaction.userId}`)) {
      this.dataIndex.interactions.set(`user_${interaction.userId}`, []);
    }
    this.dataIndex.interactions.get(`user_${interaction.userId}`)!.push(interaction);

    // Index by outcome
    if (!this.dataIndex.interactions.has(`outcome_${interaction.outcome}`)) {
      this.dataIndex.interactions.set(`outcome_${interaction.outcome}`, []);
    }
    this.dataIndex.interactions.get(`outcome_${interaction.outcome}`)!.push(interaction);
  }

  /**
   * Update pattern index
   */
  private updatePatternIndex(pattern: DesignPattern): void {
    // Index by category
    if (!this.dataIndex.patterns.has(pattern.category)) {
      this.dataIndex.patterns.set(pattern.category, []);
    }
    this.dataIndex.patterns.get(pattern.category)!.push(pattern);

    // Index by tags
    pattern.tags.forEach(tag => {
      if (!this.dataIndex.tags.has(tag)) {
        this.dataIndex.tags.set(tag, []);
      }
      this.dataIndex.tags.get(tag)!.push(pattern.id);
    });
  }

  /**
   * Update insight index
   */
  private updateInsightIndex(insight: UXInsight): void {
    if (!this.dataIndex.insights.has(insight.type)) {
      this.dataIndex.insights.set(insight.type, []);
    }
    this.dataIndex.insights.get(insight.type)!.push(insight);
  }

  /**
   * Pattern relationship mapping
   */
  private analyzePatternRelationships(pattern: DesignPattern): void {
    const relationships: PatternRelationship[] = [];

    this.designPatterns.forEach(existingPattern => {
      if (existingPattern.id === pattern.id) return;

      const similarity = this.analysisEngine.calculatePatternSimilarity(pattern, existingPattern);
      
      if (similarity > 0.3) {
        const relationship: PatternRelationship = {
          sourceId: pattern.id,
          targetId: existingPattern.id,
          type: similarity > 0.7 ? 'similar' : 'complementary',
          strength: similarity,
          evidence: [`Similarity score: ${similarity.toFixed(3)}`],
          lastUpdated: Date.now()
        };

        relationships.push(relationship);
        this.knowledgeBase.relationships.push(relationship);
      }
    });

    if (relationships.length > 0) {
      this.patternRelationships.set(pattern.id, relationships);
      this.buildRelationshipIndex();
    }
  }

  /**
   * Build relationship index
   */
  private buildRelationshipIndex(): void {
    this.knowledgeBase.relationships.forEach(relationship => {
      // Index by source
      if (!this.dataIndex.relationships.has(relationship.sourceId)) {
        this.dataIndex.relationships.set(relationship.sourceId, []);
      }
      this.dataIndex.relationships.get(relationship.sourceId)!.push(relationship.targetId);

      // Index by type
      if (!this.dataIndex.relationships.has(`type_${relationship.type}`)) {
        this.dataIndex.relationships.set(`type_${relationship.type}`, []);
      }
      this.dataIndex.relationships.get(`type_${relationship.type}`)!.push(relationship.sourceId);
    });
  }

  /**
   * Analyze interaction for patterns
   */
  private analyzeInteractionForPatterns(interaction: UserInteraction): void {
    // Check if interaction matches existing patterns
    this.designPatterns.forEach(pattern => {
      const match = this.analysisEngine.checkPatternMatch(interaction, pattern);
      if (match.confidence > 0.5) {
        this.updateDesignPattern(pattern.id, {
          metrics: {
            ...pattern.metrics,
            frequency: pattern.metrics.frequency + 1
          }
        });
      }
    });
  }

  /**
   * Enhanced UX knowledge base management
   */
  addBestPractice(
    title: string,
    description: string,
    category: string,
    evidence: string[] = []
  ): BestPractice {
    const id = `best_practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const bestPractice: BestPractice = {
      id,
      title,
      description,
      category,
      evidence,
      confidence: 0.8,
      lastUpdated: Date.now()
    };

    this.knowledgeBase.bestPractices.push(bestPractice);

    // Emit best practice creation event
    eventBus.publishSimple(
      'ux_best_practice_created',
      'UXRepository',
      { bestPracticeId: id, title, category },
      { component: 'UXRepository' }
    );

    return bestPractice;
  }

  addAntiPattern(
    title: string,
    description: string,
    category: string,
    problems: string[] = [],
    solutions: string[] = []
  ): AntiPattern {
    const id = `anti_pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const antiPattern: AntiPattern = {
      id,
      title,
      description,
      category,
      problems,
      solutions,
      frequency: 0,
      lastObserved: Date.now()
    };

    this.knowledgeBase.antiPatterns.push(antiPattern);

    // Emit anti-pattern creation event
    eventBus.publishSimple(
      'ux_anti_pattern_created',
      'UXRepository',
      { antiPatternId: id, title, category },
      { component: 'UXRepository' }
    );

    return antiPattern;
  }

  addGuideline(
    title: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Guideline {
    const id = `guideline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const guideline: Guideline = {
      id,
      title,
      description,
      category,
      priority,
      compliance: 0,
      lastUpdated: Date.now()
    };

    this.knowledgeBase.guidelines.push(guideline);

    // Emit guideline creation event
    eventBus.publishSimple(
      'ux_guideline_created',
      'UXRepository',
      { guidelineId: id, title, category, priority },
      { component: 'UXRepository' }
    );

    return guideline;
  }

  // Event handlers for enhanced UX events
  private async handleDesignPatternCreation(event: any): Promise<void> {
    console.log('Design pattern created:', event.data);
    // Additional processing for design pattern creation
  }

  private async handlePatternRelationship(event: any): Promise<void> {
    console.log('Pattern relationship detected:', event.data);
    // Additional processing for pattern relationships
  }

  private async handleKnowledgeBaseUpdate(event: any): Promise<void> {
    console.log('Knowledge base updated:', event.data);
    // Additional processing for knowledge base updates
  }

  /**
   * Calculate engagement metrics
   */
  calculateEngagement(): number {
    if (this.store.interactions.length === 0) return 0;

    const recentInteractions = this.store.interactions.filter(
      interaction => Date.now() - interaction.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const totalTime = recentInteractions.reduce((sum, interaction) => {
      // Estimate time based on interaction type
      const timeMap: Record<string, number> = {
        'click': 0.1,
        'scroll': 0.5,
        'input': 2.0,
        'navigation': 1.0,
        'search': 3.0,
        'form_submit': 5.0
      };
      return sum + (timeMap[interaction.type] || 1.0);
    }, 0);

    return Math.min(1, totalTime / (24 * 60 * 60)); // Normalize to 24 hours
  }

  /**
   * Calculate satisfaction metrics
   */
  calculateSatisfaction(): number {
    if (this.store.interactions.length === 0) return 0;

    const successfulInteractions = this.store.interactions.filter(
      interaction => interaction.outcome === 'success'
    );

    return successfulInteractions.length / this.store.interactions.length;
  }

  /**
   * Calculate efficiency metrics
   */
  calculateEfficiency(): number {
    if (this.store.interactions.length === 0) return 0;

    const averageTime = this.store.interactions.reduce((sum, interaction) => {
      const timeMap: Record<string, number> = {
        'click': 0.1,
        'scroll': 0.5,
        'input': 2.0,
        'navigation': 1.0,
        'search': 3.0,
        'form_submit': 5.0
      };
      return sum + (timeMap[interaction.type] || 1.0);
    }, 0) / this.store.interactions.length;

    // Lower time = higher efficiency
    return Math.max(0, 1 - (averageTime / 10));
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate(): number {
    if (this.store.interactions.length === 0) return 0;

    const failedInteractions = this.store.interactions.filter(
      interaction => interaction.outcome === 'failure'
    );

    return failedInteractions.length / this.store.interactions.length;
  }

  /**
   * Get interactions by type
   */
  getInteractionsByType(type: string): UserInteraction[] {
    return this.store.interactions.filter(interaction => interaction.type === type);
  }

  /**
   * Get interactions by user
   */
  getInteractionsByUser(userId: string): UserInteraction[] {
    return this.store.interactions.filter(interaction => interaction.userId === userId);
  }

  /**
   * Get patterns by frequency
   */
  getPatternsByFrequency(minFrequency: number = 1): UXPattern[] {
    return this.store.patterns.filter(pattern => pattern.frequency >= minFrequency);
  }

  /**
   * Get insights by type
   */
  getInsightsByType(type: string): UXInsight[] {
    return this.store.insights.filter(insight => insight.type === type);
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    interactionCount: number;
    patternCount: number;
    insightCount: number;
    designPatternCount: number;
    knowledgeBaseStats: {
      bestPractices: number;
      antiPatterns: number;
      guidelines: number;
      relationships: number;
    };
    metrics: UXMetrics;
  } {
    return {
      interactionCount: this.store.interactions.length,
      patternCount: this.store.patterns.length,
      insightCount: this.store.insights.length,
      designPatternCount: this.designPatterns.size,
      knowledgeBaseStats: {
        bestPractices: this.knowledgeBase.bestPractices.length,
        antiPatterns: this.knowledgeBase.antiPatterns.length,
        guidelines: this.knowledgeBase.guidelines.length,
        relationships: this.knowledgeBase.relationships.length
      },
      metrics: this.store.metrics
    };
  }

  /**
   * Get design patterns by category
   */
  getDesignPatternsByCategory(category: DesignPattern['category']): DesignPattern[] {
    return Array.from(this.designPatterns.values()).filter(pattern => pattern.category === category);
  }

  /**
   * Get knowledge base data
   */
  getKnowledgeBase(): UXKnowledgeBase {
    return this.knowledgeBase;
  }

  /**
   * Get data index for search and filtering
   */
  getDataIndex(): UXDataIndex {
    return this.dataIndex;
  }

  /**
   * Search patterns by tags
   */
  searchPatternsByTags(tags: string[]): DesignPattern[] {
    return Array.from(this.designPatterns.values()).filter(pattern =>
      tags.some(tag => pattern.tags.includes(tag))
    );
  }

  /**
   * Get pattern relationships
   */
  getPatternRelationships(patternId: string): PatternRelationship[] {
    return this.patternRelationships.get(patternId) || [];
  }

  // Event handlers
  private async handleInteraction(event: any): Promise<void> {
    console.log('UX interaction event received:', event.data);
    // Process interaction event
  }

  private async handlePatternDetection(event: any): Promise<void> {
    console.log('UX pattern detection event received:', event.data);
    // Process pattern detection event
  }

  private async handleInsightGeneration(event: any): Promise<void> {
    console.log('UX insight generation event received:', event.data);
    // Process insight generation event
  }

  private async handleMetricsUpdate(event: any): Promise<void> {
    console.log('UX metrics update event received:', event.data);
    // Process metrics update event
  }

  /**
   * Get current state
   */
  getState(): UXRepositoryType {
    return this.store;
  }

  /**
   * Cleanup and destroy
   */
  async destroy(): Promise<void> {
    this.eventSubscriptions.forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    this.eventSubscriptions = [];
    this.isInitialized = false;
    console.log('UX Repository destroyed');
  }
}

// Export singleton instance
export const uxRepository = new UXRepository(); 