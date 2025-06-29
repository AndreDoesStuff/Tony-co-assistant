import { MemorySystem } from './MemorySystem';
import { LearningSystem } from './LearningSystem';
import { DesignSystem } from './DesignSystem';
import { UXRepository } from './UXRepository';
import { SchoolBench } from './SchoolBench';
import { AssetLibrary } from './AssetLibrary';
import { AIDesignSuggestions } from './AIDesignSuggestions';
import { AdvancedLearning } from '../advanced/AdvancedLearning';
import { KnowledgeGraph } from '../advanced/KnowledgeGraph';
import { UserExperienceEnhancement } from '../advanced/UserExperienceEnhancement';
import { SystemOptimizer } from '../advanced/SystemOptimizer';
import { eventBus } from '../../events/EventBus';

/**
 * Component Manager
 * Handles initialization, lifecycle, and coordination of all core components
 */
export class ComponentManager {
  private components: Map<string, any> = new Map();
  private isInitialized: boolean = false;
  private initializationOrder: string[] = [
    'MemorySystem',
    'LearningSystem', 
    'DesignSystem',
    'UXRepository',
    'SchoolBench',
    'AssetLibrary',
    'AIDesignSuggestions',
    'AdvancedLearning',
    'KnowledgeGraph',
    'UserExperienceEnhancement',
    'SystemOptimizer'
  ];

  constructor() {
    // Create instances of all components
    this.components.set('MemorySystem', new MemorySystem());
    this.components.set('LearningSystem', new LearningSystem());
    this.components.set('DesignSystem', new DesignSystem());
    this.components.set('UXRepository', new UXRepository());
    this.components.set('SchoolBench', new SchoolBench());
    this.components.set('AssetLibrary', new AssetLibrary());
    this.components.set('AIDesignSuggestions', new AIDesignSuggestions());
    this.components.set('AdvancedLearning', new AdvancedLearning());
    this.components.set('KnowledgeGraph', new KnowledgeGraph());
    this.components.set('UserExperienceEnhancement', new UserExperienceEnhancement());
    this.components.set('SystemOptimizer', new SystemOptimizer());
  }

  /**
   * Initialize all components in the correct order
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Starting component initialization...');

    const failedComponents: string[] = [];
    const successfulComponents: string[] = [];

    try {
      // Initialize components in dependency order
      for (const componentName of this.initializationOrder) {
        const component = this.components.get(componentName);
        if (component && typeof component.initialize === 'function') {
          console.log(`Initializing ${componentName}...`);
          try {
            await component.initialize();
            console.log(`${componentName} initialized successfully`);
            successfulComponents.push(componentName);
          } catch (error) {
            console.error(`Failed to initialize ${componentName}:`, error);
            failedComponents.push(componentName);
            // Continue with other components instead of failing completely
          }
        }
      }

      // Mark as initialized if at least some components succeeded
      if (successfulComponents.length > 0) {
        this.isInitialized = true;
        console.log(`Component initialization completed. ${successfulComponents.length} successful, ${failedComponents.length} failed`);
        
        if (failedComponents.length > 0) {
          console.warn('Failed components:', failedComponents);
        }

        // Emit system ready event
        await eventBus.publishSimple(
          'system_ready',
          'ComponentManager',
          { 
            timestamp: Date.now(),
            componentCount: this.components.size,
            initializedComponents: successfulComponents,
            failedComponents: failedComponents
          },
          { component: 'ComponentManager' }
        );
      } else {
        throw new Error('No components could be initialized');
      }

    } catch (error) {
      console.error('Critical failure during component initialization:', error);
      throw error;
    }
  }

  /**
   * Get a specific component by name
   */
  getComponent<T>(name: string): T | undefined {
    return this.components.get(name) as T;
  }

  /**
   * Get all components
   */
  getAllComponents(): Map<string, any> {
    return new Map(this.components);
  }

  /**
   * Get component status
   */
  getComponentStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    for (const [name, component] of Array.from(this.components.entries())) {
      status[name] = component.isInitialized || false;
    }
    
    return status;
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    isInitialized: boolean;
    componentCount: number;
    initializedCount: number;
    failedCount: number;
    status: { [key: string]: { initialized: boolean; error?: string } };
  } {
    const status: { [key: string]: { initialized: boolean; error?: string } } = {};
    let initializedCount = 0;
    let failedCount = 0;
    
    for (const [name, component] of Array.from(this.components.entries())) {
      const isInitialized = component.isInitialized || false;
      status[name] = { initialized: isInitialized };
      
      if (isInitialized) {
        initializedCount++;
      } else {
        failedCount++;
      }
    }

    return {
      isInitialized: this.isInitialized,
      componentCount: this.components.size,
      initializedCount,
      failedCount,
      status
    };
  }

  /**
   * Get component statistics
   */
  async getComponentStats(): Promise<{ [key: string]: any }> {
    const stats: { [key: string]: any } = {};

    for (const [name, component] of Array.from(this.components.entries())) {
      if (component.getStats && typeof component.getStats === 'function') {
        try {
          stats[name] = component.getStats();
        } catch (error) {
          console.error(`Error getting stats for ${name}:`, error);
          stats[name] = { error: 'Failed to get stats' };
        }
      }
    }

    return stats;
  }

  /**
   * Perform system cleanup
   */
  async cleanup(): Promise<void> {
    console.log('Starting system cleanup...');

    try {
      // Cleanup components in reverse order
      for (let i = this.initializationOrder.length - 1; i >= 0; i--) {
        const componentName = this.initializationOrder[i];
        const component = this.components.get(componentName);
        
        if (component && typeof component.destroy === 'function') {
          console.log(`Cleaning up ${componentName}...`);
          await component.destroy();
          console.log(`${componentName} cleaned up successfully`);
        }
      }

      this.isInitialized = false;
      console.log('System cleanup completed');

    } catch (error) {
      console.error('Error during system cleanup:', error);
      throw error;
    }
  }

  /**
   * Destroy the component manager and all components
   */
  async destroy(): Promise<void> {
    await this.cleanup();
  }

  /**
   * Restart a specific component
   */
  async restartComponent(componentName: string): Promise<boolean> {
    const component = this.components.get(componentName);
    if (!component) {
      console.error(`Component ${componentName} not found`);
      return false;
    }

    try {
      console.log(`Restarting ${componentName}...`);

      // Destroy component if it has a destroy method
      if (typeof component.destroy === 'function') {
        await component.destroy();
      }

      // Re-initialize component
      if (typeof component.initialize === 'function') {
        await component.initialize();
      }

      console.log(`${componentName} restarted successfully`);
      return true;

    } catch (error) {
      console.error(`Failed to restart ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Get component dependencies
   */
  getComponentDependencies(): { [key: string]: string[] } {
    return {
      'MemorySystem': [],
      'LearningSystem': ['MemorySystem'],
      'DesignSystem': [],
      'UXRepository': ['MemorySystem', 'LearningSystem'],
      'SchoolBench': ['LearningSystem'],
      'AssetLibrary': ['DesignSystem'],
      'AIDesignSuggestions': ['DesignSystem'],
      'AdvancedLearning': ['LearningSystem']
    };
  }

  /**
   * Validate component dependencies
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
    const dependencies = this.getComponentDependencies();
    const errors: string[] = [];

    for (const [componentName, deps] of Object.entries(dependencies)) {
      for (const dep of deps) {
        if (!this.components.has(dep)) {
          errors.push(`${componentName} depends on ${dep} which is not registered`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get initialization order
   */
  getInitializationOrder(): string[] {
    return [...this.initializationOrder];
  }

  /**
   * Check if system is ready
   */
  isSystemReady(): boolean {
    return this.isInitialized && this.getSystemHealth().initializedCount === this.components.size;
  }
}

// Export singleton instance
export const componentManager = new ComponentManager(); 