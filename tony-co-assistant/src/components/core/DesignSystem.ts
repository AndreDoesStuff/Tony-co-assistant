import { DesignSystem as DesignSystemType, DesignPattern, DesignComponent, StyleGuide, DesignAsset } from '../../types/tony';
import { eventBus } from '../../events/EventBus';

/**
 * Design System Component
 * Handles design patterns, components, and style management
 */
export class DesignSystem {
  private store: DesignSystemType;
  private isInitialized: boolean = false;
  private eventSubscriptions: any[] = [];

  constructor() {
    this.store = {
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
    };
  }

  /**
   * Initialize the design system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Subscribe to design-related events
      this.eventSubscriptions.push(
        eventBus.subscribe('design_pattern_update', this.handlePatternUpdate.bind(this)),
        eventBus.subscribe('design_component_update', this.handleComponentUpdate.bind(this)),
        eventBus.subscribe('design_style_update', this.handleStyleUpdate.bind(this)),
        eventBus.subscribe('design_asset_update', this.handleAssetUpdate.bind(this))
      );
      
      this.isInitialized = true;
      console.log('Design System initialized');
      
      // Emit initialization event
      await eventBus.publishSimple(
        'design_initialized',
        'DesignSystem',
        { timestamp: Date.now() },
        { component: 'DesignSystem' }
      );
    } catch (error) {
      console.error('Failed to initialize Design System:', error);
      throw error;
    }
  }

  /**
   * Add design pattern
   */
  addPattern(
    name: string,
    category: string,
    description: string,
    usage: string[] = [],
    examples: any[] = [],
    confidence: number = 0.5
  ): DesignPattern {
    const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const pattern: DesignPattern = {
      id,
      name,
      category,
      description,
      usage,
      examples,
      confidence,
      lastUsed: Date.now()
    };

    this.store.patterns.push(pattern);

    // Emit pattern creation event
    eventBus.publishSimple(
      'design_pattern_created',
      'DesignSystem',
      { patternId: id, name, category },
      { component: 'DesignSystem' }
    );

    return pattern;
  }

  /**
   * Update design pattern
   */
  updatePattern(patternId: string, updates: Partial<DesignPattern>): boolean {
    const pattern = this.store.patterns.find(p => p.id === patternId);
    if (!pattern) {
      return false;
    }

    Object.assign(pattern, updates);
    pattern.lastUsed = Date.now();

    // Emit pattern update event
    eventBus.publishSimple(
      'design_pattern_updated',
      'DesignSystem',
      { patternId, updates },
      { component: 'DesignSystem' }
    );

    return true;
  }

  /**
   * Add design component
   */
  addComponent(
    name: string,
    type: string,
    props: any = {},
    variants: any[] = []
  ): DesignComponent {
    const id = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const component: DesignComponent = {
      id,
      name,
      type,
      props,
      variants,
      usage: 0,
      lastUpdated: Date.now()
    };

    this.store.components.push(component);

    // Emit component creation event
    eventBus.publishSimple(
      'design_component_created',
      'DesignSystem',
      { componentId: id, name, type },
      { component: 'DesignSystem' }
    );

    return component;
  }

  /**
   * Update component usage
   */
  incrementComponentUsage(componentId: string): boolean {
    const component = this.store.components.find(c => c.id === componentId);
    if (!component) {
      return false;
    }

    component.usage++;
    component.lastUpdated = Date.now();

    return true;
  }

  /**
   * Update style guide
   */
  updateStyleGuide(updates: Partial<StyleGuide>): void {
    Object.assign(this.store.styles, updates);

    // Emit style update event
    eventBus.publishSimple(
      'design_style_updated',
      'DesignSystem',
      { updates },
      { component: 'DesignSystem' }
    );
  }

  /**
   * Add color to palette
   */
  addColor(category: 'primary' | 'secondary' | 'neutral', color: string): void {
    if (!this.store.styles.colors[category]) {
      this.store.styles.colors[category] = [];
    }
    
    if (!this.store.styles.colors[category].includes(color)) {
      this.store.styles.colors[category].push(color);
    }
  }

  /**
   * Add semantic color
   */
  addSemanticColor(name: string, color: string): void {
    this.store.styles.colors.semantic[name] = color;
  }

  /**
   * Add font family
   */
  addFont(font: string): void {
    if (!this.store.styles.typography.fonts.includes(font)) {
      this.store.styles.typography.fonts.push(font);
    }
  }

  /**
   * Add font size
   */
  addFontSize(name: string, size: string): void {
    this.store.styles.typography.sizes[name] = size;
  }

  /**
   * Add font weight
   */
  addFontWeight(name: string, weight: number): void {
    this.store.styles.typography.weights[name] = weight;
  }

  /**
   * Add spacing scale value
   */
  addSpacingValue(value: number): void {
    if (!this.store.styles.spacing.scale.includes(value)) {
      this.store.styles.spacing.scale.push(value);
      this.store.styles.spacing.scale.sort((a, b) => a - b);
    }
  }

  /**
   * Add breakpoint
   */
  addBreakpoint(name: string, value: number): void {
    this.store.styles.breakpoints.push({ name, value });
    this.store.styles.breakpoints.sort((a, b) => a.value - b.value);
  }

  /**
   * Add design asset
   */
  addAsset(
    type: 'image' | 'icon' | 'animation' | 'sound',
    url: string,
    metadata: any = {},
    tags: string[] = []
  ): DesignAsset {
    const id = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const asset: DesignAsset = {
      id,
      type,
      url,
      metadata,
      tags,
      usage: 0
    };

    this.store.assets.push(asset);

    // Emit asset creation event
    eventBus.publishSimple(
      'design_asset_created',
      'DesignSystem',
      { assetId: id, type, url },
      { component: 'DesignSystem' }
    );

    return asset;
  }

  /**
   * Get patterns by category
   */
  getPatternsByCategory(category: string): DesignPattern[] {
    return this.store.patterns
      .filter(p => p.category === category)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get components by type
   */
  getComponentsByType(type: string): DesignComponent[] {
    return this.store.components
      .filter(c => c.type === type)
      .sort((a, b) => b.usage - a.usage);
  }

  /**
   * Get assets by type
   */
  getAssetsByType(type: string): DesignAsset[] {
    return this.store.assets
      .filter(a => a.type === type)
      .sort((a, b) => b.usage - a.usage);
  }

  /**
   * Get design system statistics
   */
  getStats(): {
    patternCount: number;
    componentCount: number;
    assetCount: number;
    colorCount: number;
    fontCount: number;
  } {
    const colorCount = 
      this.store.styles.colors.primary.length +
      this.store.styles.colors.secondary.length +
      this.store.styles.colors.neutral.length +
      Object.keys(this.store.styles.colors.semantic).length;

    return {
      patternCount: this.store.patterns.length,
      componentCount: this.store.components.length,
      assetCount: this.store.assets.length,
      colorCount,
      fontCount: this.store.styles.typography.fonts.length
    };
  }

  /**
   * Handle pattern update events
   */
  private async handlePatternUpdate(event: any): Promise<void> {
    try {
      const { action, data } = event.data;
      
      if (action === 'create') {
        this.addPattern(data.name, data.category, data.description, data.usage, data.examples, data.confidence);
      } else if (action === 'update') {
        this.updatePattern(data.patternId, data.updates);
      }
    } catch (error) {
      console.error('Error handling pattern update:', error);
    }
  }

  /**
   * Handle component update events
   */
  private async handleComponentUpdate(event: any): Promise<void> {
    try {
      const { action, data } = event.data;
      
      if (action === 'create') {
        this.addComponent(data.name, data.type, data.props, data.variants);
      } else if (action === 'usage') {
        this.incrementComponentUsage(data.componentId);
      }
    } catch (error) {
      console.error('Error handling component update:', error);
    }
  }

  /**
   * Handle style update events
   */
  private async handleStyleUpdate(event: any): Promise<void> {
    try {
      const { updates } = event.data;
      this.updateStyleGuide(updates);
    } catch (error) {
      console.error('Error handling style update:', error);
    }
  }

  /**
   * Handle asset update events
   */
  private async handleAssetUpdate(event: any): Promise<void> {
    try {
      const { action, data } = event.data;
      
      if (action === 'create') {
        this.addAsset(data.type, data.url, data.metadata, data.tags);
      }
    } catch (error) {
      console.error('Error handling asset update:', error);
    }
  }

  /**
   * Get current design system state
   */
  getState(): DesignSystemType {
    return this.store;
  }

  /**
   * Cleanup and destroy the component
   */
  async destroy(): Promise<void> {
    // Unsubscribe from all events
    for (const subscription of this.eventSubscriptions) {
      eventBus.unsubscribe(subscription.id);
    }
    
    this.eventSubscriptions = [];
    this.isInitialized = false;
    console.log('Design System destroyed');
  }
}

// Export singleton instance
export const designSystem = new DesignSystem(); 