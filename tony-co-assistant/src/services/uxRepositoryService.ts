import axios from 'axios';
import { 
  DesignPattern, 
  UXKnowledgeBase, 
  BestPractice, 
  AntiPattern, 
  Guideline, 
  PatternRelationship 
} from '../components/core/UXRepository';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Enhanced UX Repository Service
export class UXRepositoryService {
  private static instance: UXRepositoryService;

  private constructor() {}

  static getInstance(): UXRepositoryService {
    if (!UXRepositoryService.instance) {
      UXRepositoryService.instance = new UXRepositoryService();
    }
    return UXRepositoryService.instance;
  }

  /**
   * Save design pattern to backend
   */
  async saveDesignPattern(pattern: DesignPattern): Promise<DesignPattern> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/patterns`, pattern);
      return response.data;
    } catch (error) {
      console.error('Error saving design pattern:', error);
      throw new Error('Failed to save design pattern');
    }
  }

  /**
   * Update design pattern
   */
  async updateDesignPattern(patternId: string, updates: Partial<DesignPattern>): Promise<DesignPattern> {
    try {
      const response = await axios.put(`${API_BASE_URL}/ux/patterns/${patternId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating design pattern:', error);
      throw new Error('Failed to update design pattern');
    }
  }

  /**
   * Get design patterns by category
   */
  async getDesignPatternsByCategory(category: string): Promise<DesignPattern[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ux/patterns/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching design patterns by category:', error);
      throw new Error('Failed to fetch design patterns');
    }
  }

  /**
   * Search design patterns by tags
   */
  async searchDesignPatternsByTags(tags: string[]): Promise<DesignPattern[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/patterns/search/tags`, { tags });
      return response.data;
    } catch (error) {
      console.error('Error searching design patterns by tags:', error);
      throw new Error('Failed to search design patterns');
    }
  }

  /**
   * Save best practice
   */
  async saveBestPractice(bestPractice: BestPractice): Promise<BestPractice> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/best-practices`, bestPractice);
      return response.data;
    } catch (error) {
      console.error('Error saving best practice:', error);
      throw new Error('Failed to save best practice');
    }
  }

  /**
   * Get best practices by category
   */
  async getBestPracticesByCategory(category: string): Promise<BestPractice[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ux/best-practices/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching best practices by category:', error);
      throw new Error('Failed to fetch best practices');
    }
  }

  /**
   * Save anti-pattern
   */
  async saveAntiPattern(antiPattern: AntiPattern): Promise<AntiPattern> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/anti-patterns`, antiPattern);
      return response.data;
    } catch (error) {
      console.error('Error saving anti-pattern:', error);
      throw new Error('Failed to save anti-pattern');
    }
  }

  /**
   * Get anti-patterns by category
   */
  async getAntiPatternsByCategory(category: string): Promise<AntiPattern[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ux/anti-patterns/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anti-patterns by category:', error);
      throw new Error('Failed to fetch anti-patterns');
    }
  }

  /**
   * Save guideline
   */
  async saveGuideline(guideline: Guideline): Promise<Guideline> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/guidelines`, guideline);
      return response.data;
    } catch (error) {
      console.error('Error saving guideline:', error);
      throw new Error('Failed to save guideline');
    }
  }

  /**
   * Get guidelines by priority
   */
  async getGuidelinesByPriority(priority: 'low' | 'medium' | 'high' | 'critical'): Promise<Guideline[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ux/guidelines/priority/${priority}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching guidelines by priority:', error);
      throw new Error('Failed to fetch guidelines');
    }
  }

  /**
   * Save pattern relationship
   */
  async savePatternRelationship(relationship: PatternRelationship): Promise<PatternRelationship> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/relationships`, relationship);
      return response.data;
    } catch (error) {
      console.error('Error saving pattern relationship:', error);
      throw new Error('Failed to save pattern relationship');
    }
  }

  /**
   * Get pattern relationships
   */
  async getPatternRelationships(patternId: string): Promise<PatternRelationship[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ux/relationships/pattern/${patternId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pattern relationships:', error);
      throw new Error('Failed to fetch pattern relationships');
    }
  }

  /**
   * Save knowledge base
   */
  async saveKnowledgeBase(knowledgeBase: UXKnowledgeBase): Promise<UXKnowledgeBase> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/knowledge-base`, knowledgeBase);
      return response.data;
    } catch (error) {
      console.error('Error saving knowledge base:', error);
      throw new Error('Failed to save knowledge base');
    }
  }

  /**
   * Load knowledge base
   */
  async loadKnowledgeBase(): Promise<UXKnowledgeBase> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ux/knowledge-base`);
      return response.data;
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      throw new Error('Failed to load knowledge base');
    }
  }

  /**
   * Export UX data
   */
  async exportUXData(): Promise<{
    patterns: DesignPattern[];
    bestPractices: BestPractice[];
    antiPatterns: AntiPattern[];
    guidelines: Guideline[];
    relationships: PatternRelationship[];
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ux/export`);
      return response.data;
    } catch (error) {
      console.error('Error exporting UX data:', error);
      throw new Error('Failed to export UX data');
    }
  }

  /**
   * Import UX data
   */
  async importUXData(data: {
    patterns: DesignPattern[];
    bestPractices: BestPractice[];
    antiPatterns: AntiPattern[];
    guidelines: Guideline[];
    relationships: PatternRelationship[];
  }): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/ux/import`, data);
    } catch (error) {
      console.error('Error importing UX data:', error);
      throw new Error('Failed to import UX data');
    }
  }

  /**
   * Get UX analytics
   */
  async getUXAnalytics(): Promise<{
    patternUsage: Record<string, number>;
    userSatisfaction: number;
    errorRate: number;
    engagement: number;
    topPatterns: DesignPattern[];
    recentInsights: any[];
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ux/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching UX analytics:', error);
      throw new Error('Failed to fetch UX analytics');
    }
  }

  /**
   * Search UX knowledge base
   */
  async searchKnowledgeBase(query: string): Promise<{
    patterns: DesignPattern[];
    bestPractices: BestPractice[];
    antiPatterns: AntiPattern[];
    guidelines: Guideline[];
  }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/search`, { query });
      return response.data;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw new Error('Failed to search knowledge base');
    }
  }

  /**
   * Get UX recommendations
   */
  async getUXRecommendations(context: any): Promise<{
    patterns: DesignPattern[];
    bestPractices: BestPractice[];
    guidelines: Guideline[];
    reasoning: string;
  }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ux/recommendations`, { context });
      return response.data;
    } catch (error) {
      console.error('Error fetching UX recommendations:', error);
      throw new Error('Failed to fetch UX recommendations');
    }
  }
}

// Export singleton instance
export const uxRepositoryService = UXRepositoryService.getInstance(); 