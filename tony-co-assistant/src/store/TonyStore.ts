import { TonyState, UserState, MemoryStore, LearningSystem, DesignSystem, UXRepository, SchoolBench, AssetLibrary } from '../types/tony';
import { componentManager } from '../components/core/ComponentManager';
import { eventBus } from '../events/EventBus';

/**
 * State synchronization configuration
 */
interface StateSyncConfig {
  enableRealTimeUpdates: boolean;
  consistencyCheckInterval: number;
  recoveryEnabled: boolean;
  validationEnabled: boolean;
  optimizationEnabled: boolean;
  maxStateSize: number;
  syncTimeout: number;
}

/**
 * State validation result
 */
interface StateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  inconsistencies: string[];
  recommendations: string[];
}

/**
 * State recovery result
 */
interface StateRecoveryResult {
  success: boolean;
  recoveredComponents: string[];
  failedComponents: string[];
  dataLoss: boolean;
  backupUsed: boolean;
}

/**
 * Tony Store - Central State Management
 * Manages the global state of the Tony Co-Assistant system
 */
export class TonyStore {
  private state: TonyState;
  private listeners: Set<(state: TonyState) => void> = new Set();
  private isInitialized: boolean = false;
  
  // State synchronization properties
  private syncConfig: StateSyncConfig = {
    enableRealTimeUpdates: true,
    consistencyCheckInterval: 5000, // 5 seconds
    recoveryEnabled: true,
    validationEnabled: true,
    optimizationEnabled: true,
    maxStateSize: 50 * 1024 * 1024, // 50MB
    syncTimeout: 30000 // 30 seconds
  };
  
  private stateBackup: TonyState | null = null;
  private lastBackupTime: number = 0;
  private backupInterval: number = 60000; // 1 minute
  private consistencyTimer: NodeJS.Timeout | null = null;
  private optimizationTimer: NodeJS.Timeout | null = null;
  private syncInProgress: boolean = false;
  private pendingUpdates: Map<string, any> = new Map();
  private stateVersion: number = 1;
  private lastValidationTime: number = 0;
  private validationInterval: number = 10000; // 10 seconds

  constructor() {
    this.state = {
      system: {
        status: 'initializing',
        version: '1.0.0',
        lastUpdated: Date.now(),
        components: {
          MemoryStore: { status: 'inactive', lastActivity: 0 },
          LearningSystem: { status: 'inactive', lastActivity: 0 },
          DesignSystem: { status: 'inactive', lastActivity: 0 },
          UXRepository: { status: 'inactive', lastActivity: 0 },
          SchoolBench: { status: 'inactive', lastActivity: 0 },
          AssetLibrary: { status: 'inactive', lastActivity: 0 },
          AIDesignSuggestions: { status: 'inactive', lastActivity: 0 }
        }
      },
      user: {
        id: 'default',
        preferences: {},
        session: {
          startTime: Date.now(),
          lastActivity: Date.now()
        }
      },
      memory: {
        nodes: new Map(),
        connections: new Map(),
        shortTerm: [],
        longTerm: [],
        lastIndexed: Date.now()
      },
      learning: {
        patterns: [],
        feedbackLoops: [],
        knowledgeBase: [],
        learningAlgorithms: [],
        performance: {
          accuracy: 0,
          responseTime: 0,
          learningRate: 0,
          patternRecognitionRate: 0,
          overall: {
            accuracy: 0,
            precision: 0,
            recall: 0,
            f1Score: 0,
            responseTime: 0,
            throughput: 0,
            errorRate: 0
          },
          byAlgorithm: {},
          byPatternType: {},
          trends: []
        },
        patternRecognition: {
          active: true,
          methods: [],
          thresholds: {
            confidence: 0.7,
            similarity: 0.8,
            frequency: 3,
            support: 0.1
          },
          statistics: {
            patternsDetected: 0,
            falsePositives: 0,
            falseNegatives: 0,
            averageConfidence: 0,
            processingTime: 0
          }
        },
        feedbackProcessor: {
          active: true,
          queue: {
            pending: [],
            processing: [],
            completed: [],
            failed: []
          },
          processing: {
            isProcessing: false,
            currentBatch: 0,
            totalProcessed: 0,
            averageProcessingTime: 0
          },
          rules: []
        },
        knowledgeSharing: {
          active: true,
          protocols: [],
          permissions: {
            readAccess: [],
            writeAccess: [],
            adminAccess: [],
            restrictions: []
          },
          statistics: {
            sharedItems: 0,
            receivedItems: 0,
            successRate: 0,
            averageLatency: 0
          }
        },
        learningMetrics: {
          overall: {
            totalPatterns: 0,
            totalKnowledge: 0,
            totalFeedback: 0,
            learningEfficiency: 0,
            adaptationRate: 0
          },
          patterns: {
            recognitionRate: 0,
            accuracy: 0,
            falsePositiveRate: 0,
            processingTime: 0,
            byType: {}
          },
          algorithms: {
            activeAlgorithms: 0,
            averagePerformance: 0,
            trainingTime: 0,
            convergenceRate: 0,
            byType: {}
          },
          knowledge: {
            totalNodes: 0,
            averageConfidence: 0,
            sharingRate: 0,
            validationRate: 0,
            byType: {}
          },
          feedback: {
            totalFeedback: 0,
            processingRate: 0,
            averageImpact: 0,
            responseTime: 0,
            byType: {}
          }
        }
      },
      design: {
        patterns: [],
        components: [],
        styles: {
          colors: {
            primary: [],
            secondary: [],
            neutral: [],
            semantic: {}
          },
          typography: {
            fonts: [],
            sizes: {},
            weights: {}
          },
          spacing: {
            scale: [],
            units: 'px'
          },
          breakpoints: []
        },
        assets: []
      },
      ux: {
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
      },
      school: {
        lessons: [],
        progress: {
          completedLessons: [],
          overallScore: 0,
          strengths: [],
          weaknesses: [],
          lastActivity: Date.now()
        },
        recommendations: [],
        assessments: []
      },
      assets: {
        assets: [],
        categories: [],
        tags: [],
        collections: []
      },
      aiSuggestions: {
        suggestions: [],
        contextAnalysis: [],
        suggestionEngine: {
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
        },
        recommendationHistory: [],
        performance: {
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
        },
        configuration: {
          enabled: true,
          autoSuggest: true,
          suggestionLimit: 5,
          confidenceThreshold: 0.7,
          relevanceThreshold: 0.6,
          learningRate: 0.1,
          contextSensitivity: 0.8,
          personalizationLevel: 'medium'
        }
      }
    };
  }

  /**
   * Initialize the store and all components
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Tony Store...');
      
      // Update system status
      this.updateSystemStatus('initializing');

      // Initialize component manager
      await componentManager.initialize();

      // Update component statuses
      this.updateComponentStatuses();

      // Subscribe to system events
      eventBus.subscribe('system_ready', this.handleSystemReady.bind(this));
      eventBus.subscribe('component_status_update', this.handleComponentStatusUpdate.bind(this));

      // Initialize state synchronization
      await this.initializeStateSynchronization();

      this.isInitialized = true;
      this.updateSystemStatus('ready');
      
      console.log('Tony Store initialized successfully');
      
      // Notify listeners
      this.notifyListeners();

    } catch (error) {
      console.error('Failed to initialize Tony Store:', error);
      this.updateSystemStatus('error');
      throw error;
    }
  }

  /**
   * Initialize state synchronization features
   */
  private async initializeStateSynchronization(): Promise<void> {
    try {
      console.log('Initializing state synchronization...');

      // Create initial backup
      await this.createStateBackup();

      // Start consistency checking
      if (this.syncConfig.consistencyCheckInterval > 0) {
        this.consistencyTimer = setInterval(() => {
          this.checkStateConsistency().catch(console.error);
        }, this.syncConfig.consistencyCheckInterval);
      }

      // Start optimization timer
      if (this.syncConfig.optimizationEnabled) {
        this.optimizationTimer = setInterval(() => {
          this.optimizeState().catch(console.error);
        }, 30000); // Every 30 seconds
      }

      // Start backup timer
      setInterval(() => {
        this.createStateBackup().catch(console.error);
      }, this.backupInterval);

      // Subscribe to state change events
      eventBus.subscribe('state_change', this.handleStateChange.bind(this));
      eventBus.subscribe('component_error', this.handleComponentError.bind(this));

      console.log('State synchronization initialized successfully');
    } catch (error) {
      console.error('Failed to initialize state synchronization:', error);
      throw error;
    }
  }

  /**
   * Real-time state update with validation
   */
  async updateState(updates: Partial<TonyState>, source: string = 'unknown'): Promise<boolean> {
    if (this.syncInProgress) {
      // Queue update if sync is in progress
      this.pendingUpdates.set(`${source}_${Date.now()}`, updates);
      return true;
    }

    try {
      this.syncInProgress = true;

      // Validate updates before applying
      if (this.syncConfig.validationEnabled) {
        const validation = await this.validateStateUpdate(updates);
        if (!validation.isValid) {
          console.error('State update validation failed:', validation.errors);
          return false;
        }
      }

      // Apply updates
      this.applyStateUpdates(updates);

      // Increment state version
      this.stateVersion++;

      // Notify listeners
      this.notifyListeners();

      // Emit state change event
      await eventBus.publishSimple(
        'state_updated',
        'TonyStore',
        { 
          source, 
          version: this.stateVersion, 
          timestamp: Date.now(),
          changes: Object.keys(updates)
        },
        { component: 'TonyStore' }
      );

      return true;
    } catch (error) {
      console.error('State update failed:', error);
      return false;
    } finally {
      this.syncInProgress = false;
      
      // Process pending updates
      this.processPendingUpdates();
    }
  }

  /**
   * Check state consistency across components
   */
  async checkStateConsistency(): Promise<StateValidationResult> {
    const result: StateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      inconsistencies: [],
      recommendations: []
    };

    try {
      // Check component status consistency
      const health = componentManager.getSystemHealth();
      for (const [componentName, isInitialized] of Object.entries(health.status)) {
        const storeStatus = this.state.system.components[componentName as keyof typeof this.state.system.components];
        if (storeStatus && isInitialized !== (storeStatus.status === 'active')) {
          result.inconsistencies.push(`Component status mismatch: ${componentName}`);
          result.isValid = false;
        }
      }

      // Check memory consistency
      if (this.state.memory.nodes.size !== this.state.memory.shortTerm.length + this.state.memory.longTerm.length) {
        result.inconsistencies.push('Memory node count mismatch');
        result.isValid = false;
      }

      // Check learning system consistency
      if (this.state.learning.patterns.length !== this.state.learning.learningAlgorithms.length) {
        result.warnings.push('Learning patterns and algorithms count mismatch');
      }

      // Check for orphaned data
      const orphanedData = this.findOrphanedData();
      if (orphanedData.length > 0) {
        result.warnings.push(`Found ${orphanedData.length} orphaned data items`);
        result.recommendations.push('Consider running state optimization');
      }

      // Emit consistency check event
      await eventBus.publishSimple(
        'state_consistency_check',
        'TonyStore',
        { 
          isValid: result.isValid,
          errors: result.errors.length,
          warnings: result.warnings.length,
          inconsistencies: result.inconsistencies.length
        },
        { component: 'TonyStore' }
      );

      return result;
    } catch (error) {
      console.error('State consistency check failed:', error);
      result.isValid = false;
      result.errors.push(`Consistency check error: ${error}`);
      return result;
    }
  }

  /**
   * Recover state from backup or component data
   */
  async recoverState(): Promise<StateRecoveryResult> {
    const result: StateRecoveryResult = {
      success: false,
      recoveredComponents: [],
      failedComponents: [],
      dataLoss: false,
      backupUsed: false
    };

    try {
      console.log('Starting state recovery...');

      // Try to recover from backup first
      if (this.stateBackup) {
        console.log('Attempting recovery from backup...');
        this.state = JSON.parse(JSON.stringify(this.stateBackup));
        result.backupUsed = true;
        result.success = true;
      } else {
        // Try to recover from components
        console.log('No backup available, attempting component recovery...');
        await this.recoverFromComponents(result);
      }

      // Validate recovered state
      const validation = await this.validateState();
      if (!validation.isValid) {
        console.warn('Recovered state has validation issues:', validation.errors);
        result.dataLoss = true;
      }

      // Notify listeners of recovery
      this.notifyListeners();

      // Emit recovery event
      await eventBus.publishSimple(
        'state_recovered',
        'TonyStore',
        { 
          success: result.success,
          backupUsed: result.backupUsed,
          dataLoss: result.dataLoss,
          recoveredComponents: result.recoveredComponents.length
        },
        { component: 'TonyStore' }
      );

      return result;
    } catch (error) {
      console.error('State recovery failed:', error);
      result.success = false;
      result.failedComponents.push('TonyStore');
      return result;
    }
  }

  /**
   * Validate current state
   */
  async validateState(): Promise<StateValidationResult> {
    const result: StateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      inconsistencies: [],
      recommendations: []
    };

    try {
      // Check state structure
      if (!this.state || typeof this.state !== 'object') {
        result.errors.push('Invalid state structure');
        result.isValid = false;
      }

      // Check required properties
      const requiredProps = ['system', 'user', 'memory', 'learning', 'design', 'ux', 'school', 'assets'];
      for (const prop of requiredProps) {
        if (!(prop in this.state)) {
          result.errors.push(`Missing required property: ${prop}`);
          result.isValid = false;
        }
      }

      // Check system status
      if (!this.state.system.status || !['initializing', 'ready', 'error', 'maintenance', 'inactive'].includes(this.state.system.status)) {
        result.errors.push('Invalid system status');
        result.isValid = false;
      }

      // Check component statuses
      for (const [componentName, status] of Object.entries(this.state.system.components)) {
        if (!status || typeof status !== 'object') {
          result.errors.push(`Invalid component status for: ${componentName}`);
          result.isValid = false;
        }
      }

      // Check memory structure
      if (!this.state.memory.nodes || !(this.state.memory.nodes instanceof Map)) {
        result.errors.push('Invalid memory nodes structure');
        result.isValid = false;
      }

      // Check learning structure
      if (!Array.isArray(this.state.learning.patterns)) {
        result.errors.push('Invalid learning patterns structure');
        result.isValid = false;
      }

      // Check for circular references
      try {
        JSON.stringify(this.state);
      } catch (error) {
        result.errors.push('Circular reference detected in state');
        result.isValid = false;
      }

      // Check state size
      const stateSize = JSON.stringify(this.state).length;
      if (stateSize > this.syncConfig.maxStateSize) {
        result.warnings.push(`State size (${stateSize} bytes) exceeds recommended limit`);
        result.recommendations.push('Consider state optimization');
      }

      this.lastValidationTime = Date.now();
      return result;
    } catch (error) {
      console.error('State validation failed:', error);
      result.isValid = false;
      result.errors.push(`Validation error: ${error}`);
      return result;
    }
  }

  /**
   * Optimize state for performance and memory usage
   */
  async optimizeState(): Promise<void> {
    try {
      console.log('Starting state optimization...');

      // Remove expired short-term memory
      const now = Date.now();
      const shortTermExpiry = 24 * 60 * 60 * 1000; // 24 hours
      this.state.memory.shortTerm = this.state.memory.shortTerm.filter(
        node => (now - node.createdAt) < shortTermExpiry
      );

      // Optimize learning patterns
      this.state.learning.patterns = this.state.learning.patterns.filter(
        pattern => pattern.confidence > 0.1 // Remove low-confidence patterns
      );

      // Clean up old feedback loops
      const feedbackExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
      this.state.learning.feedbackLoops = this.state.learning.feedbackLoops.filter(
        loop => (now - loop.timestamp) < feedbackExpiry
      );

      // Optimize UX interactions (keep only recent ones)
      const uxExpiry = 30 * 24 * 60 * 60 * 1000; // 30 days
      this.state.ux.interactions = this.state.ux.interactions.filter(
        interaction => (now - interaction.timestamp) < uxExpiry
      );

      // Clean up old school lessons
      const lessonExpiry = 90 * 24 * 60 * 60 * 1000; // 90 days
      this.state.school.lessons = this.state.school.lessons.filter(
        lesson => lesson.completed // Keep only completed lessons
      );

      // Rebuild indexes
      this.rebuildStateIndexes();

      // Notify listeners
      this.notifyListeners();

      // Emit optimization event
      await eventBus.publishSimple(
        'state_optimized',
        'TonyStore',
        { 
          timestamp: Date.now(),
          shortTermCount: this.state.memory.shortTerm.length,
          patternsCount: this.state.learning.patterns.length,
          interactionsCount: this.state.ux.interactions.length
        },
        { component: 'TonyStore' }
      );

      console.log('State optimization completed');
    } catch (error) {
      console.error('State optimization failed:', error);
    }
  }

  /**
   * Create state backup
   */
  private async createStateBackup(): Promise<void> {
    try {
      this.stateBackup = JSON.parse(JSON.stringify(this.state));
      this.lastBackupTime = Date.now();
      
      // Emit backup event
      await eventBus.publishSimple(
        'state_backup_created',
        'TonyStore',
        { timestamp: this.lastBackupTime },
        { component: 'TonyStore' }
      );
    } catch (error) {
      console.error('Failed to create state backup:', error);
    }
  }

  /**
   * Handle state change events
   */
  private async handleStateChange(event: any): Promise<void> {
    try {
      const { component, changes } = event.data;
      
      // Apply changes if they're valid
      if (changes && typeof changes === 'object') {
        await this.updateState(changes, component);
      }
    } catch (error) {
      console.error('Error handling state change:', error);
    }
  }

  /**
   * Handle component error events
   */
  private async handleComponentError(event: any): Promise<void> {
    try {
      const { component, error } = event.data;
      console.error(`Component error in ${component}:`, error);
      
      // Update component status
      if (this.state.system.components[component as keyof typeof this.state.system.components]) {
        this.state.system.components[component as keyof typeof this.state.system.components] = {
          status: 'error',
          lastActivity: Date.now()
        };
        this.notifyListeners();
      }
      
      // Attempt recovery if enabled
      if (this.syncConfig.recoveryEnabled) {
        await this.recoverState();
      }
    } catch (error) {
      console.error('Error handling component error:', error);
    }
  }

  /**
   * Apply state updates
   */
  private applyStateUpdates(updates: Partial<TonyState>): void {
    for (const [key, value] of Object.entries(updates)) {
      if (key in this.state) {
        (this.state as any)[key] = { ...(this.state as any)[key], ...value };
      }
    }
  }

  /**
   * Validate state update
   */
  private async validateStateUpdate(updates: Partial<TonyState>): Promise<StateValidationResult> {
    const result: StateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      inconsistencies: [],
      recommendations: []
    };

    try {
      // Check for invalid update structure
      for (const [key, value] of Object.entries(updates)) {
        if (!(key in this.state)) {
          result.errors.push(`Invalid state key: ${key}`);
          result.isValid = false;
        }
      }

      // Check for circular references in updates
      try {
        JSON.stringify(updates);
      } catch (error) {
        result.errors.push('Circular reference in update data');
        result.isValid = false;
      }

      return result;
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Update validation error: ${error}`);
      return result;
    }
  }

  /**
   * Recover state from components
   */
  private async recoverFromComponents(result: StateRecoveryResult): Promise<void> {
    const components = componentManager.getAllComponents();
    
    for (const [name, component] of Array.from(components.entries())) {
      try {
        // Try to get component state
        if (typeof (component as any).getState === 'function') {
          const componentState = (component as any).getState();
          if (componentState) {
            // Merge component state into main state
            this.mergeComponentState(name, componentState);
            result.recoveredComponents.push(name);
          }
        }
      } catch (error) {
        console.error(`Failed to recover component ${name}:`, error);
        result.failedComponents.push(name);
      }
    }
  }

  /**
   * Merge component state into main state
   */
  private mergeComponentState(componentName: string, componentState: any): void {
    switch (componentName) {
      case 'MemorySystem':
        this.state.memory = { ...this.state.memory, ...componentState };
        break;
      case 'LearningSystem':
        this.state.learning = { ...this.state.learning, ...componentState };
        break;
      case 'DesignSystem':
        this.state.design = { ...this.state.design, ...componentState };
        break;
      case 'UXRepository':
        this.state.ux = { ...this.state.ux, ...componentState };
        break;
      case 'SchoolBench':
        this.state.school = { ...this.state.school, ...componentState };
        break;
      case 'AssetLibrary':
        this.state.assets = { ...this.state.assets, ...componentState };
        break;
    }
  }

  /**
   * Find orphaned data in state
   */
  private findOrphanedData(): string[] {
    const orphaned: string[] = [];
    
    // Check for orphaned memory nodes
    for (const [id, node] of Array.from(this.state.memory.nodes.entries())) {
      if (!this.state.memory.shortTerm.find(n => n.id === id) && 
          !this.state.memory.longTerm.find(n => n.id === id)) {
        orphaned.push(`Memory node: ${id}`);
      }
    }
    
    return orphaned;
  }

  /**
   * Rebuild state indexes
   */
  private rebuildStateIndexes(): void {
    // Rebuild memory indexes
    this.state.memory.lastIndexed = Date.now();
    
    // Rebuild learning indexes
    this.state.learning.patterns.forEach(pattern => {
      if (!pattern.lastSeen) {
        pattern.lastSeen = Date.now();
      }
    });
  }

  /**
   * Process pending updates
   */
  private async processPendingUpdates(): Promise<void> {
    if (this.pendingUpdates.size === 0) return;
    
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();
    
    for (const [key, update] of updates) {
      try {
        await this.updateState(update, key);
      } catch (error) {
        console.error(`Failed to process pending update ${key}:`, error);
      }
    }
  }

  /**
   * Get state synchronization statistics
   */
  getStateSyncStats() {
    return {
      version: this.stateVersion,
      lastBackup: this.lastBackupTime,
      lastValidation: this.lastValidationTime,
      pendingUpdates: this.pendingUpdates.size,
      syncInProgress: this.syncInProgress,
      config: this.syncConfig
    };
  }

  /**
   * Update synchronization configuration
   */
  updateSyncConfig(config: Partial<StateSyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...config };
    
    // Restart timers if intervals changed
    if (this.consistencyTimer && config.consistencyCheckInterval) {
      clearInterval(this.consistencyTimer);
      this.consistencyTimer = setInterval(() => {
        this.checkStateConsistency().catch(console.error);
      }, this.syncConfig.consistencyCheckInterval);
    }
  }

  /**
   * Get current state
   */
  getState(): TonyState {
    return this.state;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: TonyState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update system status
   */
  updateSystemStatus(status: 'initializing' | 'ready' | 'error' | 'maintenance' | 'inactive'): void {
    this.state.system.status = status;
    this.state.system.lastUpdated = Date.now();
    this.notifyListeners();
  }

  /**
   * Update component statuses
   */
  updateComponentStatuses(): void {
    const health = componentManager.getSystemHealth();
    const now = Date.now();

    for (const [componentName, isInitialized] of Object.entries(health.status)) {
      if (this.state.system.components[componentName as keyof typeof this.state.system.components]) {
        this.state.system.components[componentName as keyof typeof this.state.system.components] = {
          status: isInitialized ? 'active' : 'inactive',
          lastActivity: isInitialized ? now : 0
        };
      }
    }

    this.notifyListeners();
  }

  /**
   * Update user session
   */
  updateUserSession(): void {
    this.state.user.session.lastActivity = Date.now();
    this.notifyListeners();
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: any): void {
    this.state.user.preferences = { ...this.state.user.preferences, ...preferences };
    this.notifyListeners();
  }

  /**
   * Get component by name
   */
  getComponent<T>(name: string): T | undefined {
    return componentManager.getComponent<T>(name);
  }

  /**
   * Get system health
   */
  getSystemHealth() {
    return componentManager.getSystemHealth();
  }

  /**
   * Get component statistics
   */
  async getComponentStats() {
    return await componentManager.getComponentStats();
  }

  /**
   * Handle system ready event
   */
  private async handleSystemReady(event: any): Promise<void> {
    console.log('System ready event received:', event.data);
    
    // Update component statuses
    this.updateComponentStatuses();
    
    // Update system status
    this.updateSystemStatus('ready');
  }

  /**
   * Handle component status update event
   */
  private async handleComponentStatusUpdate(event: any): Promise<void> {
    const { componentName, status } = event.data;
    
    if (this.state.system.components[componentName as keyof typeof this.state.system.components]) {
      this.state.system.components[componentName as keyof typeof this.state.system.components] = {
        status,
        lastActivity: Date.now()
      };
      
      this.notifyListeners();
    }
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    for (const listener of Array.from(this.listeners)) {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    }
  }

  /**
   * Cleanup store
   */
  async cleanup(): Promise<void> {
    try {
      console.log('Cleaning up Tony Store...');
      
      // Clear timers
      if (this.consistencyTimer) {
        clearInterval(this.consistencyTimer);
        this.consistencyTimer = null;
      }
      
      if (this.optimizationTimer) {
        clearInterval(this.optimizationTimer);
        this.optimizationTimer = null;
      }
      
      // Create final backup
      await this.createStateBackup();
      
      // Cleanup component manager
      await componentManager.cleanup();
      
      this.isInitialized = false;
      this.updateSystemStatus('inactive');
      
      console.log('Tony Store cleanup completed');
      
    } catch (error) {
      console.error('Error during Tony Store cleanup:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const tonyStore = new TonyStore(); 