import { MemoryStore, MemoryNode, MemoryMetadata } from '../../types/tony';
import { eventBus } from '../../events/EventBus';
import { mongoDBService } from '../../services/MongoDBService';

/**
 * Memory Index for fast retrieval
 */
interface MemoryIndex {
  byType: Map<string, Set<string>>;
  byTag: Map<string, Set<string>>;
  bySource: Map<string, Set<string>>;
  byImportance: Map<number, Set<string>>;
  byConfidence: Map<number, Set<string>>;
  byAccessCount: Map<number, Set<string>>;
  byTimestamp: Map<number, Set<string>>;
  fullText: Map<string, Set<string>>; // For text-based search
}

/**
 * Memory Connection Analysis
 */
interface ConnectionAnalysis {
  strength: number; // 0-1 scale
  type: string;
  bidirectional: boolean;
  lastAccessed: number;
  accessCount: number;
}

/**
 * Memory Persistence Configuration
 */
interface PersistenceConfig {
  enabled: boolean;
  autoSave: boolean;
  saveInterval: number; // milliseconds
  storageKey: string;
  useLocalStorage: boolean;
  enableMongoDB: boolean;
  userId?: string;
  sessionId?: string;
}

/**
 * Memory Optimization Settings
 */
interface OptimizationConfig {
  maxShortTermNodes: number;
  maxLongTermNodes: number;
  cleanupInterval: number; // milliseconds
  importanceThreshold: number;
  confidenceThreshold: number;
  accessThreshold: number;
}

/**
 * Enhanced Memory System Component
 * Handles short-term and long-term memory management with advanced features
 */
export class MemorySystem {
  private store: MemoryStore;
  private index: MemoryIndex;
  private connections: Map<string, ConnectionAnalysis>;
  private persistenceConfig: PersistenceConfig;
  private optimizationConfig: OptimizationConfig;
  private isInitialized: boolean = false;
  private eventSubscription: any;
  private saveTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private mongoSyncTimer?: NodeJS.Timeout;

  constructor() {
    this.store = {
      nodes: new Map(),
      connections: new Map(),
      shortTerm: [],
      longTerm: [],
      lastIndexed: Date.now()
    };

    this.index = {
      byType: new Map(),
      byTag: new Map(),
      bySource: new Map(),
      byImportance: new Map(),
      byConfidence: new Map(),
      byAccessCount: new Map(),
      byTimestamp: new Map(),
      fullText: new Map()
    };

    this.connections = new Map();

    this.persistenceConfig = {
      enabled: true,
      autoSave: true,
      saveInterval: 30000, // 30 seconds
      storageKey: 'tony_memory_system',
      useLocalStorage: true,
      enableMongoDB: true
    };

    this.optimizationConfig = {
      maxShortTermNodes: 1000,
      maxLongTermNodes: 10000,
      cleanupInterval: 60000, // 1 minute
      importanceThreshold: 0.3,
      confidenceThreshold: 0.5,
      accessThreshold: 5
    };
  }

  /**
   * Set user and session information for MongoDB sync
   */
  setUserContext(userId: string, sessionId: string): void {
    this.persistenceConfig.userId = userId;
    this.persistenceConfig.sessionId = sessionId;
  }

  /**
   * Initialize the memory system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set up event subscriptions
      this.eventSubscription = eventBus.subscribe('memory_update', this.handleMemoryUpdate.bind(this));
      eventBus.subscribe('system_cleanup', this.handleSystemCleanup.bind(this));

      // Initialize MongoDB service if enabled
      if (this.persistenceConfig.enableMongoDB) {
        await mongoDBService.initialize();
      }

      // Load existing memory
      await this.loadMemory();

      // Set up auto-save timer
      if (this.persistenceConfig.autoSave) {
        this.saveTimer = setInterval(() => {
          this.saveMemory().catch(console.error);
        }, this.persistenceConfig.saveInterval);
      }

      // Set up cleanup timer
      this.cleanupTimer = setInterval(() => {
        this.optimizeMemory().catch(console.error);
      }, this.optimizationConfig.cleanupInterval);

      // Set up MongoDB sync timer
      if (this.persistenceConfig.enableMongoDB) {
        this.mongoSyncTimer = setInterval(() => {
          this.syncToMongoDB().catch(console.error);
        }, 300000); // 5 minutes
      }

      this.isInitialized = true;

      // Only log in development or when explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.TEST_MODE) {
        console.log('Enhanced Memory System initialized with MongoDB integration');
      }

      // Emit initialization event
      await eventBus.publishSimple(
        'memory_system_initialized',
        'MemorySystem',
        {
          nodeCount: this.store.nodes.size,
          connectionCount: this.store.connections.size,
          shortTermCount: this.store.shortTerm.length,
          longTermCount: this.store.longTerm.length
        },
        { component: 'MemorySystem' }
      );
    } catch (error) {
      console.error('Failed to initialize Memory System:', error);
      throw error;
    }
  }

  /**
   * Create a new memory node with enhanced indexing
   */
  createNode(
    type: MemoryNode['type'],
    data: any,
    source: string,
    tags: string[] = [],
    importance: number = 0.5
  ): MemoryNode {
    const id = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const node: MemoryNode = {
      id,
      type,
      data,
      connections: [],
      metadata: {
        source,
        confidence: this.calculateInitialConfidence(data, source, tags),
        lastUpdated: now,
        tags,
        importance,
        accessCount: 0
      },
      createdAt: now,
      lastUpdated: now
    };

    this.store.nodes.set(id, node);
    this.store.shortTerm.push(node);

    // Update all indexes
    this.updateIndexes(node, 'add');

    // Emit memory creation event
    eventBus.publishSimple(
      'memory_node_created',
      'MemorySystem',
      { nodeId: id, type, source },
      { component: 'MemorySystem' }
    );

    // Enforce short-term memory limit immediately
    this.cleanupShortTermMemory();

    return node;
  }

  /**
   * Retrieve a memory node by ID with enhanced access tracking
   */
  getNode(id: string): MemoryNode | undefined {
    const node = this.store.nodes.get(id);
    if (node) {
      // Update access count and confidence
      node.metadata.accessCount++;
      node.lastUpdated = Date.now();
      node.metadata.confidence = this.updateConfidence(node);
      
      // Update indexes
      this.updateIndexes(node, 'update');

      // Emit memory update event
      eventBus.publishSimple(
        'memory_update',
        'MemorySystem',
        { action: 'update', nodeId: id, accessCount: node.metadata.accessCount },
        { component: 'MemorySystem' }
      );
    }
    return node;
  }

  /**
   * Advanced search with multiple criteria and ranking
   */
  searchNodes(
    criteria: {
      type?: string;
      tags?: string[];
      source?: string;
      minImportance?: number;
      minConfidence?: number;
      text?: string;
      timeRange?: { start: number; end: number };
    } = {},
    limit: number = 50
  ): MemoryNode[] {
    const results: MemoryNode[] = [];
    const scores = new Map<string, number>();

    // Get candidate nodes from indexes
    const candidates = this.getSearchCandidates(criteria);
    
    for (const nodeId of Array.from(candidates)) {
      const node = this.store.nodes.get(nodeId);
      if (!node) continue;

      // Calculate relevance score
      const score = this.calculateRelevanceScore(node, criteria);
      if (score > 0) {
        results.push(node);
        scores.set(nodeId, score);
      }
    }

    // Sort by relevance score and importance
    return results
      .sort((a, b) => {
        const scoreA = scores.get(a.id) || 0;
        const scoreB = scores.get(b.id) || 0;
        const importanceDiff = b.metadata.importance - a.metadata.importance;
        return scoreB - scoreA || importanceDiff;
      })
      .slice(0, limit);
  }

  /**
   * Enhanced node connection with strength analysis
   */
  connectNodes(
    nodeId1: string, 
    nodeId2: string, 
    connectionType: string = 'related',
    strength: number = 0.5
  ): boolean {
    const node1 = this.store.nodes.get(nodeId1);
    const node2 = this.store.nodes.get(nodeId2);

    if (!node1 || !node2) {
      return false;
    }

    // Add connections
    if (!node1.connections.includes(nodeId2)) {
      node1.connections.push(nodeId2);
    }
    if (!node2.connections.includes(nodeId1)) {
      node2.connections.push(nodeId1);
    }

    // Update connection map
    const connectionKey = `${nodeId1}-${nodeId2}`;
    this.store.connections.set(connectionKey, [nodeId1, nodeId2]);

    // Store connection analysis
    this.connections.set(connectionKey, {
      strength,
      type: connectionType,
      bidirectional: true,
      lastAccessed: Date.now(),
      accessCount: 0
    });

    // Emit connection event
    eventBus.publishSimple(
      'memory_nodes_connected',
      'MemorySystem',
      { nodeId1, nodeId2, connectionType, strength },
      { component: 'MemorySystem' }
    );

    return true;
  }

  /**
   * Get related nodes with connection strength analysis
   */
  getRelatedNodes(nodeId: string, limit: number = 10): Array<{ node: MemoryNode; strength: number }> {
    const node = this.store.nodes.get(nodeId);
    if (!node) return [];

    const related: Array<{ node: MemoryNode; strength: number }> = [];

    for (const connectedId of node.connections) {
      const connectedNode = this.store.nodes.get(connectedId);
      if (!connectedNode) continue;

      const connectionKey = `${nodeId}-${connectedId}`;
      const reverseKey = `${connectedId}-${nodeId}`;
      const analysis = this.connections.get(connectionKey) || this.connections.get(reverseKey);

      if (analysis) {
        related.push({
          node: connectedNode,
          strength: analysis.strength
        });
      }
    }

    return related
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  /**
   * Move node from short-term to long-term memory with optimization
   */
  moveToLongTerm(nodeId: string): boolean {
    const nodeIndex = this.store.shortTerm.findIndex(node => node.id === nodeId);
    if (nodeIndex === -1) {
      return false;
    }

    const node = this.store.shortTerm.splice(nodeIndex, 1)[0];
    
    // Recalculate importance and confidence for long-term storage
    node.metadata.importance = this.calculateLongTermImportance(node);
    node.metadata.confidence = this.updateConfidence(node);
    
    this.store.longTerm.push(node);

    // Update indexes
    this.updateIndexes(node, 'update');

    // Emit memory transfer event
    eventBus.publishSimple(
      'memory_transferred_to_long_term',
      'MemorySystem',
      { nodeId, timestamp: Date.now() },
      { component: 'MemorySystem' }
    );

    return true;
  }

  /**
   * Save memory to persistent storage (local + MongoDB)
   */
  async saveMemory(): Promise<void> {
    if (!this.persistenceConfig.enabled) return;

    try {
      // Save to local storage
      await this.saveToLocalStorage();
      
      // Save to MongoDB if enabled and user context is set
      if (this.persistenceConfig.enableMongoDB && 
          this.persistenceConfig.userId && 
          this.persistenceConfig.sessionId) {
        await this.saveToMongoDB();
      }
      
    } catch (error) {
      console.error('Failed to save memory:', error);
      throw error;
    }
  }

  /**
   * Save to local storage
   */
  private async saveToLocalStorage(): Promise<void> {
    // Prepare data for serialization
    const data = {
      nodes: Array.from(this.store.nodes.entries()),
      connections: Array.from(this.store.connections.entries()),
      shortTerm: this.store.shortTerm.map(node => node.id),
      longTerm: this.store.longTerm.map(node => node.id),
      lastIndexed: this.store.lastIndexed,
      connectionsAnalysis: Array.from(this.connections.entries()),
      timestamp: Date.now()
    };

    // Convert to JSON
    const jsonData = JSON.stringify(data, null, 2);
    
    // Save to localStorage or sessionStorage
    if (this.persistenceConfig.useLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem(this.persistenceConfig.storageKey, jsonData);
    } else if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.persistenceConfig.storageKey, jsonData);
    }
    
    console.log(`Memory saved to ${this.persistenceConfig.useLocalStorage ? 'localStorage' : 'sessionStorage'}`);
  }

  /**
   * Save to MongoDB
   */
  private async saveToMongoDB(): Promise<void> {
    if (!this.persistenceConfig.userId || !this.persistenceConfig.sessionId) {
      return;
    }

    await mongoDBService.saveMemory(
      this.persistenceConfig.userId,
      this.persistenceConfig.sessionId,
      this.store
    );
  }

  /**
   * Sync to MongoDB (for periodic sync)
   */
  private async syncToMongoDB(): Promise<void> {
    if (!this.persistenceConfig.enableMongoDB || 
        !this.persistenceConfig.userId || 
        !this.persistenceConfig.sessionId) {
      return;
    }

    try {
      await this.saveToMongoDB();
      console.log('Memory synced to MongoDB');
    } catch (error) {
      console.error('Failed to sync memory to MongoDB:', error);
    }
  }

  /**
   * Load memory from persistent storage
   */
  async loadMemory(): Promise<void> {
    if (!this.persistenceConfig.enabled) return;

    try {
      // Load from local storage first
      await this.loadFromLocalStorage();
      
    } catch (error) {
      console.error('Failed to load memory from local storage:', error);
      // Start fresh if loading fails
      console.log('Starting with fresh memory due to load error');
    }
  }

  /**
   * Load from local storage
   */
  private async loadFromLocalStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.persistenceConfig.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Convert arrays back to Maps
        this.store.nodes = new Map(parsed.nodes);
        this.store.connections = new Map(parsed.connections);
        this.store.shortTerm = parsed.shortTerm || [];
        this.store.longTerm = parsed.longTerm || [];
        this.store.lastIndexed = parsed.lastIndexed || Date.now();

        // Rebuild indexes
        this.rebuildIndexes();

        // Only log in development or when explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.TEST_MODE) {
          console.log('Memory loaded from localStorage');
        }
      } else {
        // Only log in development or when explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.TEST_MODE) {
          console.log('No existing local memory found, starting fresh');
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Only log in development or when explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.TEST_MODE) {
        console.log('Starting with fresh memory due to load error');
      }
    }
  }

  /**
   * Load from MongoDB
   */
  private async loadFromMongoDB(): Promise<void> {
    if (!this.persistenceConfig.userId || !this.persistenceConfig.sessionId) {
      return;
    }

    try {
      const mongoData = await mongoDBService.loadMemory(
        this.persistenceConfig.userId,
        this.persistenceConfig.sessionId
      );

      if (mongoData) {
        // Merge MongoDB data with local data
        this.mergeMongoData(mongoData);
        console.log('Memory loaded from MongoDB');
      }
    } catch (error) {
      console.error('Failed to load memory from MongoDB:', error);
    }
  }

  /**
   * Merge MongoDB data with local data
   */
  private mergeMongoData(mongoData: MemoryStore): void {
    // Merge nodes (MongoDB data takes precedence for conflicts)
    for (const [id, node] of Array.from(mongoData.nodes.entries())) {
      this.store.nodes.set(id, node);
    }

    // Merge connections
    for (const [key, connection] of Array.from(mongoData.connections.entries())) {
      this.store.connections.set(key, connection);
    }

    // Update short-term and long-term arrays (these are already MemoryNode arrays)
    this.store.shortTerm = mongoData.shortTerm;
    this.store.longTerm = mongoData.longTerm;

    // Rebuild indexes
    this.rebuildIndexes();
  }

  /**
   * Delete user data (both local and MongoDB)
   */
  async deleteUserData(): Promise<void> {
    try {
      // Clear local storage
      if (typeof window !== 'undefined') {
        if (this.persistenceConfig.useLocalStorage) {
          localStorage.removeItem(this.persistenceConfig.storageKey);
        } else {
          sessionStorage.removeItem(this.persistenceConfig.storageKey);
        }
      }

      // Clear MongoDB data
      if (this.persistenceConfig.enableMongoDB && this.persistenceConfig.userId) {
        await mongoDBService.deleteUserData(
          this.persistenceConfig.userId,
          this.persistenceConfig.sessionId
        );
      }

      // Reset memory store
      this.store = {
        nodes: new Map(),
        connections: new Map(),
        shortTerm: [],
        longTerm: [],
        lastIndexed: Date.now()
      };

      this.connections.clear();
      this.rebuildIndexes();

      console.log('User data deleted successfully');

    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw error;
    }
  }

  /**
   * Get MongoDB connection status
   */
  getMongoDBStatus(): { connected: boolean; pendingOperations: number } {
    return mongoDBService.getConnectionStatus();
  }

  /**
   * Optimize memory by cleaning up and reorganizing
   */
  async optimizeMemory(): Promise<void> {
    try {
      // Clean up short-term memory
      this.cleanupShortTermMemory();
      
      // Optimize long-term memory
      this.optimizeLongTermMemory();
      
      // Rebuild indexes
      this.rebuildIndexes();
      
      // Update last indexed timestamp
      this.store.lastIndexed = Date.now();

      // Only log in development or when explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.TEST_MODE) {
        console.log('Memory optimization completed');
      }
    } catch (error) {
      console.error('Memory optimization failed:', error);
    }
  }

  /**
   * Get enhanced memory statistics
   */
  getStats(): {
    totalNodes: number;
    shortTermCount: number;
    longTermCount: number;
    connectionCount: number;
    lastIndexed: number;
    indexStats: {
      byType: number;
      byTag: number;
      bySource: number;
      byImportance: number;
      byConfidence: number;
      byAccessCount: number;
      byTimestamp: number;
      fullText: number;
    };
    averageConfidence: number;
    averageImportance: number;
    averageAccessCount: number;
  } {
    const nodes = Array.from(this.store.nodes.values());
    const totalConfidence = nodes.reduce((sum, node) => sum + node.metadata.confidence, 0);
    const totalImportance = nodes.reduce((sum, node) => sum + node.metadata.importance, 0);
    const totalAccessCount = nodes.reduce((sum, node) => sum + node.metadata.accessCount, 0);

    return {
      totalNodes: this.store.nodes.size,
      shortTermCount: this.store.shortTerm.length,
      longTermCount: this.store.longTerm.length,
      connectionCount: this.store.connections.size,
      lastIndexed: this.store.lastIndexed,
      indexStats: {
        byType: this.index.byType.size,
        byTag: this.index.byTag.size,
        bySource: this.index.bySource.size,
        byImportance: this.index.byImportance.size,
        byConfidence: this.index.byConfidence.size,
        byAccessCount: this.index.byAccessCount.size,
        byTimestamp: this.index.byTimestamp.size,
        fullText: this.index.fullText.size
      },
      averageConfidence: nodes.length > 0 ? totalConfidence / nodes.length : 0,
      averageImportance: nodes.length > 0 ? totalImportance / nodes.length : 0,
      averageAccessCount: nodes.length > 0 ? totalAccessCount / nodes.length : 0
    };
  }

  /**
   * Handle memory update events
   */
  private async handleMemoryUpdate(event: any): Promise<void> {
    try {
      const { action, data } = event.data;
      
      switch (action) {
        case 'create':
          this.createNode(data.type, data.content, data.source, data.tags, data.importance);
          break;
        case 'connect':
          this.connectNodes(data.nodeId1, data.nodeId2, data.connectionType, data.strength);
          break;
        case 'transfer':
          this.moveToLongTerm(data.nodeId);
          break;
        case 'update':
          // Update event is already handled in getNode method
          // This is just for logging/acknowledgment
          break;
        default:
          console.warn('Unknown memory action:', action);
      }
    } catch (error) {
      console.error('Error handling memory update:', error);
    }
  }

  /**
   * Handle system cleanup events
   */
  private async handleSystemCleanup(event: any): Promise<void> {
    try {
      // Clean up old short-term memories
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      this.store.shortTerm = this.store.shortTerm.filter(node => 
        node.lastUpdated > cutoffTime
      );

      // Update last indexed time
      this.store.lastIndexed = Date.now();

      // Only log in development or when explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.TEST_MODE) {
        console.log('Memory System cleanup completed');
      }
    } catch (error) {
      console.error('Error during memory cleanup:', error);
    }
  }

  /**
   * Get current memory store state
   */
  getState(): MemoryStore {
    return this.store;
  }

  /**
   * Cleanup and destroy the component
   */
  async destroy(): Promise<void> {
    // Clear all timers
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = undefined;
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    
    if (this.mongoSyncTimer) {
      clearInterval(this.mongoSyncTimer);
      this.mongoSyncTimer = undefined;
    }

    // Unsubscribe from events
    if (this.eventSubscription) {
      eventBus.unsubscribe(this.eventSubscription.id);
      this.eventSubscription = undefined;
    }
    
    this.isInitialized = false;
    
    // Only log in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.TEST_MODE) {
      console.log('Memory System destroyed');
    }
  }

  /**
   * Calculate initial confidence based on data quality and source reliability
   */
  private calculateInitialConfidence(data: any, source: string, tags: string[]): number {
    let confidence = 0.5; // Base confidence

    // Source reliability factor
    const reliableSources = ['user_input', 'system_generated', 'validated_feedback'];
    if (reliableSources.includes(source)) {
      confidence += 0.2;
    }

    // Data quality factor
    if (data && typeof data === 'object') {
      if (data.text && data.text.length > 10) confidence += 0.1;
      if (data.metadata && data.metadata.validated) confidence += 0.1;
      if (data.timestamp) confidence += 0.05;
    }

    // Tag relevance factor
    if (tags && tags.length > 0) {
      confidence += Math.min(tags.length * 0.02, 0.1);
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Update confidence based on usage patterns and time
   */
  private updateConfidence(node: MemoryNode): number {
    let confidence = node.metadata.confidence;
    const now = Date.now();
    const ageInDays = (now - node.createdAt) / (1000 * 60 * 60 * 24);

    // Access-based confidence boost
    if (node.metadata.accessCount > 10) {
      confidence += 0.1;
    } else if (node.metadata.accessCount > 5) {
      confidence += 0.05;
    }

    // Time-based confidence decay (very slow)
    if (ageInDays > 30) {
      confidence -= 0.01;
    }

    // Importance-based confidence boost
    if (node.metadata.importance > 0.8) {
      confidence += 0.05;
    }

    return Math.max(0.1, Math.min(confidence, 1.0));
  }

  /**
   * Update all indexes for a node
   */
  private updateIndexes(node: MemoryNode, action: 'add' | 'update' | 'remove'): void {
    const { id, type, metadata } = node;

    // Type index
    this.updateIndex(this.index.byType, type, id, action);

    // Tag indexes
    for (const tag of metadata.tags) {
      this.updateIndex(this.index.byTag, tag, id, action);
    }

    // Source index
    this.updateIndex(this.index.bySource, metadata.source, id, action);

    // Importance index (rounded to 1 decimal place)
    const importanceKey = Math.round(metadata.importance * 10) / 10;
    this.updateIndex(this.index.byImportance, importanceKey, id, action);

    // Confidence index (rounded to 1 decimal place)
    const confidenceKey = Math.round(metadata.confidence * 10) / 10;
    this.updateIndex(this.index.byConfidence, confidenceKey, id, action);

    // Access count index (grouped by ranges)
    const accessKey = Math.floor(metadata.accessCount / 10) * 10;
    this.updateIndex(this.index.byAccessCount, accessKey, id, action);

    // Timestamp index (grouped by hour)
    const timestampKey = Math.floor(node.lastUpdated / (1000 * 60 * 60)) * (1000 * 60 * 60);
    this.updateIndex(this.index.byTimestamp, timestampKey, id, action);

    // Full text index
    if (node.data && typeof node.data === 'object') {
      const text = this.extractTextFromData(node.data);
      if (text) {
        const words = text.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (word.length > 2) {
            this.updateIndex(this.index.fullText, word, id, action);
          }
        }
      }
    }
  }

  /**
   * Update a specific index
   */
  private updateIndex(indexMap: Map<any, Set<string>>, key: any, id: string, action: 'add' | 'update' | 'remove'): void {
    if (!indexMap.has(key)) {
      indexMap.set(key, new Set());
    }

    const set = indexMap.get(key)!;

    if (action === 'add' || action === 'update') {
      set.add(id);
    } else if (action === 'remove') {
      set.delete(id);
      if (set.size === 0) {
        indexMap.delete(key);
      }
    }
  }

  /**
   * Extract text from data for full-text indexing
   */
  private extractTextFromData(data: any): string {
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object' && data !== null) {
      if (data.text) return data.text;
      if (data.content) return data.content;
      if (data.description) return data.description;
      if (data.title) return data.title;
      
      // Recursively extract text from nested objects
      const texts: string[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          texts.push(value);
        } else if (typeof value === 'object' && value !== null) {
          texts.push(this.extractTextFromData(value));
        }
      }
      return texts.join(' ');
    }
    return '';
  }

  /**
   * Get search candidates from indexes
   */
  private getSearchCandidates(criteria: any): Set<string> {
    const candidates = new Set<string>();

    // Add candidates from type index
    if (criteria.type && this.index.byType.has(criteria.type)) {
      const typeSet = this.index.byType.get(criteria.type)!;
      for (const id of Array.from(typeSet)) {
        candidates.add(id);
      }
    }

    // Add candidates from tag indexes
    if (criteria.tags && criteria.tags.length > 0) {
      for (const tag of criteria.tags) {
        if (this.index.byTag.has(tag)) {
          const tagSet = this.index.byTag.get(tag)!;
          for (const id of Array.from(tagSet)) {
            candidates.add(id);
          }
        }
      }
    }

    // Add candidates from source index
    if (criteria.source && this.index.bySource.has(criteria.source)) {
      const sourceSet = this.index.bySource.get(criteria.source)!;
      for (const id of Array.from(sourceSet)) {
        candidates.add(id);
      }
    }

    // Add candidates from importance index
    if (criteria.minImportance !== undefined) {
      for (const [key, ids] of Array.from(this.index.byImportance.entries())) {
        if (key >= criteria.minImportance) {
          for (const id of Array.from(ids)) {
            candidates.add(id);
          }
        }
      }
    }

    // Add candidates from confidence index
    if (criteria.minConfidence !== undefined) {
      for (const [key, ids] of Array.from(this.index.byConfidence.entries())) {
        if (key >= criteria.minConfidence) {
          for (const id of Array.from(ids)) {
            candidates.add(id);
          }
        }
      }
    }

    // Add candidates from full-text index
    if (criteria.text) {
      const words = criteria.text.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 2 && this.index.fullText.has(word)) {
          const wordSet = this.index.fullText.get(word)!;
          for (const id of Array.from(wordSet)) {
            candidates.add(id);
          }
        }
      }
    }

    // If no specific criteria, return all nodes
    if (candidates.size === 0 && Object.keys(criteria).length === 0) {
      for (const node of Array.from(this.store.nodes.values())) {
        candidates.add(node.id);
      }
    }

    return candidates;
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(node: MemoryNode, criteria: any): number {
    let score = 0;

    // Type match
    if (criteria.type && node.type === criteria.type) {
      score += 10;
    }

    // Tag matches
    if (criteria.tags && criteria.tags.length > 0) {
      const matchingTags = criteria.tags.filter((tag: string) => 
        node.metadata.tags.includes(tag)
      );
      score += matchingTags.length * 5;
    }

    // Source match
    if (criteria.source && node.metadata.source === criteria.source) {
      score += 3;
    }

    // Importance factor
    score += node.metadata.importance * 5;

    // Confidence factor
    score += node.metadata.confidence * 3;

    // Access count factor (recently accessed nodes are more relevant)
    score += Math.min(node.metadata.accessCount * 0.5, 5);

    // Text relevance
    if (criteria.text && node.data) {
      const text = this.extractTextFromData(node.data).toLowerCase();
      const searchWords = criteria.text.toLowerCase().split(/\s+/);
      const matchingWords = searchWords.filter((word: string) => 
        word.length > 2 && text.includes(word)
      );
      score += matchingWords.length * 2;
    }

    // Time range filter
    if (criteria.timeRange) {
      const { start, end } = criteria.timeRange;
      if (node.createdAt < start || node.createdAt > end) {
        return 0; // Exclude from results
      }
    }

    return score;
  }

  /**
   * Calculate long-term importance based on usage patterns
   */
  private calculateLongTermImportance(node: MemoryNode): number {
    let importance = node.metadata.importance;

    // Boost importance based on access count
    if (node.metadata.accessCount > 20) {
      importance += 0.2;
    } else if (node.metadata.accessCount > 10) {
      importance += 0.1;
    }

    // Boost importance based on connections
    if (node.connections.length > 5) {
      importance += 0.1;
    } else if (node.connections.length > 2) {
      importance += 0.05;
    }

    // Boost importance based on confidence
    if (node.metadata.confidence > 0.8) {
      importance += 0.1;
    }

    // Reduce importance for very old nodes
    const ageInDays = (Date.now() - node.createdAt) / (1000 * 60 * 60 * 24);
    if (ageInDays > 365) {
      importance -= 0.1;
    }

    return Math.max(0.1, Math.min(importance, 1.0));
  }

  /**
   * Rebuild all indexes from scratch
   */
  private rebuildIndexes(): void {
    // Clear all indexes
    this.index.byType.clear();
    this.index.byTag.clear();
    this.index.bySource.clear();
    this.index.byImportance.clear();
    this.index.byConfidence.clear();
    this.index.byAccessCount.clear();
    this.index.byTimestamp.clear();
    this.index.fullText.clear();

    // Rebuild indexes for all nodes
    for (const node of Array.from(this.store.nodes.values())) {
      this.updateIndexes(node, 'add');
    }
  }

  /**
   * Clean up short-term memory
   */
  private cleanupShortTermMemory(): void {
    if (this.store.shortTerm.length <= this.optimizationConfig.maxShortTermNodes) {
      return;
    }

    // Sort by importance and access count
    this.store.shortTerm.sort((a, b) => {
      const scoreA = a.metadata.importance * 0.7 + (a.metadata.accessCount / 100) * 0.3;
      const scoreB = b.metadata.importance * 0.7 + (b.metadata.accessCount / 100) * 0.3;
      return scoreB - scoreA;
    });

    // Remove low-priority nodes
    const toRemove = this.store.shortTerm.splice(this.optimizationConfig.maxShortTermNodes);
    
    for (const node of toRemove) {
      this.store.nodes.delete(node.id);
      this.updateIndexes(node, 'remove');
    }

    console.log(`Cleaned up ${toRemove.length} short-term memory nodes`);
  }

  /**
   * Optimize long-term memory
   */
  private optimizeLongTermMemory(): void {
    if (this.store.longTerm.length <= this.optimizationConfig.maxLongTermNodes) {
      return;
    }

    // Remove nodes below thresholds
    const toRemove: MemoryNode[] = [];
    const toKeep: MemoryNode[] = [];

    for (const node of this.store.longTerm) {
      if (node.metadata.importance < this.optimizationConfig.importanceThreshold &&
          node.metadata.confidence < this.optimizationConfig.confidenceThreshold &&
          node.metadata.accessCount < this.optimizationConfig.accessThreshold) {
        toRemove.push(node);
      } else {
        toKeep.push(node);
      }
    }

    // If we still have too many, remove the lowest priority ones
    if (toKeep.length > this.optimizationConfig.maxLongTermNodes) {
      toKeep.sort((a, b) => {
        const scoreA = a.metadata.importance * 0.5 + a.metadata.confidence * 0.3 + (a.metadata.accessCount / 100) * 0.2;
        const scoreB = b.metadata.importance * 0.5 + b.metadata.confidence * 0.3 + (b.metadata.accessCount / 100) * 0.2;
        return scoreB - scoreA;
      });

      const excess = toKeep.splice(this.optimizationConfig.maxLongTermNodes);
      toRemove.push(...excess);
    }

    // Remove nodes and update indexes
    for (const node of toRemove) {
      this.store.nodes.delete(node.id);
      this.updateIndexes(node, 'remove');
    }

    this.store.longTerm = toKeep;

    console.log(`Optimized long-term memory: removed ${toRemove.length} nodes`);
  }
}

// Export singleton instance
export const memorySystem = new MemorySystem(); 