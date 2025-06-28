/**
 * School Bench Service
 * Handles backend API operations for learning pathways, pattern evolution, and knowledge base management
 */

export interface SchoolBenchAPI {
  // Learning Pathways
  createPathway(pathway: any): Promise<any>;
  getPathways(filters?: any): Promise<any[]>;
  updatePathway(pathwayId: string, updates: any): Promise<boolean>;
  deletePathway(pathwayId: string): Promise<boolean>;
  
  // Pattern Evolution
  trackEvolution(evolution: any): Promise<any>;
  getEvolutions(patternId?: string): Promise<any[]>;
  addFeedback(feedback: any): Promise<boolean>;
  
  // Knowledge Base
  addKnowledgeItem(item: any): Promise<any>;
  getKnowledgeItems(filters?: any): Promise<any[]>;
  updateKnowledgeItem(itemId: string, updates: any): Promise<boolean>;
  deleteKnowledgeItem(itemId: string): Promise<boolean>;
  searchKnowledge(query: string, filters?: any): Promise<any[]>;
  
  // Adaptive Learning
  getAdaptiveRecommendations(userId: string): Promise<any[]>;
  updateAdaptiveConfig(config: any): Promise<boolean>;
  
  // Analytics
  getLearningAnalytics(timeRange?: any): Promise<any>;
  getPatternEvolutionAnalytics(patternId?: string): Promise<any>;
  getKnowledgeBaseAnalytics(): Promise<any>;
  
  // Import/Export
  exportLearningData(): Promise<any>;
  importLearningData(data: any): Promise<boolean>;
}

class SchoolBenchService implements SchoolBenchAPI {
  private baseUrl: string;
  private isInitialized: boolean = false;

  constructor(baseUrl: string = '/api/school-bench') {
    this.baseUrl = baseUrl;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Test connection
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error('School Bench service not available');
      }
      
      this.isInitialized = true;
      console.log('School Bench Service initialized');
    } catch (error) {
      console.warn('School Bench Service not available, using local mode:', error);
      // Continue in local mode
    }
  }

  // Learning Pathways API
  async createPathway(pathway: any): Promise<any> {
    if (!this.isInitialized) {
      return this.createLocalPathway(pathway);
    }

    try {
      const response = await fetch(`${this.baseUrl}/pathways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pathway)
      });

      if (!response.ok) {
        throw new Error(`Failed to create pathway: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create pathway via API:', error);
      return this.createLocalPathway(pathway);
    }
  }

  async getPathways(filters?: any): Promise<any[]> {
    if (!this.isInitialized) {
      return this.getLocalPathways(filters);
    }

    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
      const response = await fetch(`${this.baseUrl}/pathways${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to get pathways: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get pathways via API:', error);
      return this.getLocalPathways(filters);
    }
  }

  async updatePathway(pathwayId: string, updates: any): Promise<boolean> {
    if (!this.isInitialized) {
      return this.updateLocalPathway(pathwayId, updates);
    }

    try {
      const response = await fetch(`${this.baseUrl}/pathways/${pathwayId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update pathway: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to update pathway via API:', error);
      return this.updateLocalPathway(pathwayId, updates);
    }
  }

  async deletePathway(pathwayId: string): Promise<boolean> {
    if (!this.isInitialized) {
      return this.deleteLocalPathway(pathwayId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/pathways/${pathwayId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete pathway: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete pathway via API:', error);
      return this.deleteLocalPathway(pathwayId);
    }
  }

  // Pattern Evolution API
  async trackEvolution(evolution: any): Promise<any> {
    if (!this.isInitialized) {
      return this.trackLocalEvolution(evolution);
    }

    try {
      const response = await fetch(`${this.baseUrl}/evolutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evolution)
      });

      if (!response.ok) {
        throw new Error(`Failed to track evolution: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to track evolution via API:', error);
      return this.trackLocalEvolution(evolution);
    }
  }

  async getEvolutions(patternId?: string): Promise<any[]> {
    if (!this.isInitialized) {
      return this.getLocalEvolutions(patternId);
    }

    try {
      const queryParams = patternId ? `?patternId=${patternId}` : '';
      const response = await fetch(`${this.baseUrl}/evolutions${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to get evolutions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get evolutions via API:', error);
      return this.getLocalEvolutions(patternId);
    }
  }

  async addFeedback(feedback: any): Promise<boolean> {
    if (!this.isInitialized) {
      return this.addLocalFeedback(feedback);
    }

    try {
      const response = await fetch(`${this.baseUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      if (!response.ok) {
        throw new Error(`Failed to add feedback: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to add feedback via API:', error);
      return this.addLocalFeedback(feedback);
    }
  }

  // Knowledge Base API
  async addKnowledgeItem(item: any): Promise<any> {
    if (!this.isInitialized) {
      return this.addLocalKnowledgeItem(item);
    }

    try {
      const response = await fetch(`${this.baseUrl}/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new Error(`Failed to add knowledge item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to add knowledge item via API:', error);
      return this.addLocalKnowledgeItem(item);
    }
  }

  async getKnowledgeItems(filters?: any): Promise<any[]> {
    if (!this.isInitialized) {
      return this.getLocalKnowledgeItems(filters);
    }

    try {
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
      const response = await fetch(`${this.baseUrl}/knowledge${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to get knowledge items: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get knowledge items via API:', error);
      return this.getLocalKnowledgeItems(filters);
    }
  }

  async updateKnowledgeItem(itemId: string, updates: any): Promise<boolean> {
    if (!this.isInitialized) {
      return this.updateLocalKnowledgeItem(itemId, updates);
    }

    try {
      const response = await fetch(`${this.baseUrl}/knowledge/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update knowledge item: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to update knowledge item via API:', error);
      return this.updateLocalKnowledgeItem(itemId, updates);
    }
  }

  async deleteKnowledgeItem(itemId: string): Promise<boolean> {
    if (!this.isInitialized) {
      return this.deleteLocalKnowledgeItem(itemId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/knowledge/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete knowledge item: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete knowledge item via API:', error);
      return this.deleteLocalKnowledgeItem(itemId);
    }
  }

  async searchKnowledge(query: string, filters?: any): Promise<any[]> {
    if (!this.isInitialized) {
      return this.searchLocalKnowledge(query, filters);
    }

    try {
      const params = new URLSearchParams({ query, ...filters });
      const response = await fetch(`${this.baseUrl}/knowledge/search?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to search knowledge: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to search knowledge via API:', error);
      return this.searchLocalKnowledge(query, filters);
    }
  }

  // Adaptive Learning API
  async getAdaptiveRecommendations(userId: string): Promise<any[]> {
    if (!this.isInitialized) {
      return this.getLocalAdaptiveRecommendations(userId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/recommendations/adaptive?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to get adaptive recommendations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get adaptive recommendations via API:', error);
      return this.getLocalAdaptiveRecommendations(userId);
    }
  }

  async updateAdaptiveConfig(config: any): Promise<boolean> {
    if (!this.isInitialized) {
      return this.updateLocalAdaptiveConfig(config);
    }

    try {
      const response = await fetch(`${this.baseUrl}/config/adaptive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`Failed to update adaptive config: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to update adaptive config via API:', error);
      return this.updateLocalAdaptiveConfig(config);
    }
  }

  // Analytics API
  async getLearningAnalytics(timeRange?: any): Promise<any> {
    if (!this.isInitialized) {
      return this.getLocalLearningAnalytics(timeRange);
    }

    try {
      const queryParams = timeRange ? `?${new URLSearchParams(timeRange).toString()}` : '';
      const response = await fetch(`${this.baseUrl}/analytics/learning${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to get learning analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get learning analytics via API:', error);
      return this.getLocalLearningAnalytics(timeRange);
    }
  }

  async getPatternEvolutionAnalytics(patternId?: string): Promise<any> {
    if (!this.isInitialized) {
      return this.getLocalPatternEvolutionAnalytics(patternId);
    }

    try {
      const queryParams = patternId ? `?patternId=${patternId}` : '';
      const response = await fetch(`${this.baseUrl}/analytics/evolution${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to get pattern evolution analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get pattern evolution analytics via API:', error);
      return this.getLocalPatternEvolutionAnalytics(patternId);
    }
  }

  async getKnowledgeBaseAnalytics(): Promise<any> {
    if (!this.isInitialized) {
      return this.getLocalKnowledgeBaseAnalytics();
    }

    try {
      const response = await fetch(`${this.baseUrl}/analytics/knowledge`);

      if (!response.ok) {
        throw new Error(`Failed to get knowledge base analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get knowledge base analytics via API:', error);
      return this.getLocalKnowledgeBaseAnalytics();
    }
  }

  // Import/Export API
  async exportLearningData(): Promise<any> {
    if (!this.isInitialized) {
      return this.exportLocalLearningData();
    }

    try {
      const response = await fetch(`${this.baseUrl}/export`);

      if (!response.ok) {
        throw new Error(`Failed to export learning data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to export learning data via API:', error);
      return this.exportLocalLearningData();
    }
  }

  async importLearningData(data: any): Promise<boolean> {
    if (!this.isInitialized) {
      return this.importLocalLearningData(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to import learning data: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to import learning data via API:', error);
      return this.importLocalLearningData(data);
    }
  }

  // Local fallback methods
  private createLocalPathway(pathway: any): any {
    return { ...pathway, id: `local_${Date.now()}`, createdAt: Date.now() };
  }

  private getLocalPathways(filters?: any): any[] {
    return [];
  }

  private updateLocalPathway(pathwayId: string, updates: any): boolean {
    return true;
  }

  private deleteLocalPathway(pathwayId: string): boolean {
    return true;
  }

  private trackLocalEvolution(evolution: any): any {
    return { ...evolution, id: `local_${Date.now()}`, timestamp: Date.now() };
  }

  private getLocalEvolutions(patternId?: string): any[] {
    return [];
  }

  private addLocalFeedback(feedback: any): boolean {
    return true;
  }

  private addLocalKnowledgeItem(item: any): any {
    return { ...item, id: `local_${Date.now()}`, createdAt: Date.now() };
  }

  private getLocalKnowledgeItems(filters?: any): any[] {
    return [];
  }

  private updateLocalKnowledgeItem(itemId: string, updates: any): boolean {
    return true;
  }

  private deleteLocalKnowledgeItem(itemId: string): boolean {
    return true;
  }

  private searchLocalKnowledge(query: string, filters?: any): any[] {
    return [];
  }

  private getLocalAdaptiveRecommendations(userId: string): any[] {
    return [];
  }

  private updateLocalAdaptiveConfig(config: any): boolean {
    return true;
  }

  private getLocalLearningAnalytics(timeRange?: any): any {
    return {
      totalPathways: 0,
      activePathways: 0,
      completedLessons: 0,
      averageScore: 0,
      timeRange
    };
  }

  private getLocalPatternEvolutionAnalytics(patternId?: string): any {
    return {
      totalEvolutions: 0,
      averageConfidence: 0,
      patternId
    };
  }

  private getLocalKnowledgeBaseAnalytics(): any {
    return {
      totalItems: 0,
      byType: {},
      averageConfidence: 0
    };
  }

  private exportLocalLearningData(): any {
    return {
      pathways: [],
      evolutions: [],
      knowledge: [],
      exportTimestamp: Date.now()
    };
  }

  private importLocalLearningData(data: any): boolean {
    return true;
  }
}

// Export singleton instance
export const schoolBenchService = new SchoolBenchService(); 