import { AssetLibrary as AssetLibraryType, Asset, Category, Tag, Collection, AssetType } from '../../types/tony';
import { eventBus } from '../../events/EventBus';

/**
 * Asset Library Component
 * Handles asset management, categorization, and collections
 */
export class AssetLibrary {
  private store: AssetLibraryType;
  private isInitialized: boolean = false;
  private eventSubscriptions: any[] = [];

  constructor() {
    this.store = {
      assets: [],
      categories: [],
      tags: [],
      collections: []
    };
  }

  /**
   * Initialize the asset library
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Subscribe to asset-related events
      this.eventSubscriptions.push(
        eventBus.subscribe('asset_created', this.handleAssetCreation.bind(this)),
        eventBus.subscribe('asset_updated', this.handleAssetUpdate.bind(this)),
        eventBus.subscribe('category_created', this.handleCategoryCreation.bind(this)),
        eventBus.subscribe('collection_created', this.handleCollectionCreation.bind(this))
      );
      
      this.isInitialized = true;
      console.log('Asset Library initialized');
      
      // Emit initialization event
      await eventBus.publishSimple(
        'asset_library_initialized',
        'AssetLibrary',
        { timestamp: Date.now() },
        { component: 'AssetLibrary' }
      );
    } catch (error) {
      console.error('Failed to initialize Asset Library:', error);
      throw error;
    }
  }

  /**
   * Add asset
   */
  addAsset(
    name: string,
    type: AssetType,
    url: string,
    metadata: any = {},
    tags: string[] = [],
    category: string = 'uncategorized'
  ): Asset {
    const id = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const asset: Asset = {
      id,
      name,
      type,
      url,
      metadata,
      tags,
      category,
      usage: 0,
      rating: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };

    this.store.assets.push(asset);

    // Update category asset count
    this.updateCategoryAssetCount(category);

    // Update tag usage
    for (const tag of tags) {
      this.updateTagUsage(tag);
    }

    // Emit asset creation event
    eventBus.publishSimple(
      'asset_created',
      'AssetLibrary',
      { assetId: id, name, type, category },
      { component: 'AssetLibrary' }
    );

    return asset;
  }

  /**
   * Update asset
   */
  updateAsset(assetId: string, updates: Partial<Asset>): boolean {
    const asset = this.store.assets.find(a => a.id === assetId);
    if (!asset) {
      return false;
    }

    Object.assign(asset, updates);
    asset.lastUpdated = Date.now();

    // Emit asset update event
    eventBus.publishSimple(
      'asset_updated',
      'AssetLibrary',
      { assetId, updates },
      { component: 'AssetLibrary' }
    );

    return true;
  }

  /**
   * Increment asset usage
   */
  incrementAssetUsage(assetId: string): boolean {
    const asset = this.store.assets.find(a => a.id === assetId);
    if (!asset) {
      return false;
    }

    asset.usage++;
    asset.lastUpdated = Date.now();

    return true;
  }

  /**
   * Rate asset
   */
  rateAsset(assetId: string, rating: number): boolean {
    const asset = this.store.assets.find(a => a.id === assetId);
    if (!asset) {
      return false;
    }

    asset.rating = Math.max(0, Math.min(5, rating)); // Clamp between 0-5
    asset.lastUpdated = Date.now();

    return true;
  }

  /**
   * Add category
   */
  addCategory(
    name: string,
    description: string = '',
    parentCategory?: string
  ): Category {
    const id = `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const category: Category = {
      id,
      name,
      description,
      parentCategory,
      assetCount: 0
    };

    this.store.categories.push(category);

    // Emit category creation event
    eventBus.publishSimple(
      'category_created',
      'AssetLibrary',
      { categoryId: id, name, parentCategory },
      { component: 'AssetLibrary' }
    );

    return category;
  }

  /**
   * Add tag
   */
  addTag(name: string): Tag {
    const existingTag = this.store.tags.find(t => t.name === name);
    if (existingTag) {
      return existingTag;
    }

    const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const tag: Tag = {
      id,
      name,
      usage: 0,
      relatedTags: []
    };

    this.store.tags.push(tag);

    return tag;
  }

  /**
   * Add collection
   */
  addCollection(
    name: string,
    description: string = '',
    isPublic: boolean = true
  ): Collection {
    const id = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const collection: Collection = {
      id,
      name,
      description,
      assets: [],
      isPublic,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };

    this.store.collections.push(collection);

    // Emit collection creation event
    eventBus.publishSimple(
      'collection_created',
      'AssetLibrary',
      { collectionId: id, name, isPublic },
      { component: 'AssetLibrary' }
    );

    return collection;
  }

  /**
   * Add asset to collection
   */
  addAssetToCollection(collectionId: string, assetId: string): boolean {
    const collection = this.store.collections.find(c => c.id === collectionId);
    const asset = this.store.assets.find(a => a.id === assetId);

    if (!collection || !asset) {
      return false;
    }

    if (!collection.assets.includes(assetId)) {
      collection.assets.push(assetId);
      collection.lastUpdated = Date.now();
    }

    return true;
  }

  /**
   * Remove asset from collection
   */
  removeAssetFromCollection(collectionId: string, assetId: string): boolean {
    const collection = this.store.collections.find(c => c.id === collectionId);
    if (!collection) {
      return false;
    }

    const index = collection.assets.indexOf(assetId);
    if (index !== -1) {
      collection.assets.splice(index, 1);
      collection.lastUpdated = Date.now();
      return true;
    }

    return false;
  }

  /**
   * Search assets
   */
  searchAssets(
    query?: string,
    type?: AssetType,
    category?: string,
    tags?: string[]
  ): Asset[] {
    let results = this.store.assets;

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(asset => 
        asset.name.toLowerCase().includes(lowerQuery) ||
        asset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by type
    if (type) {
      results = results.filter(asset => asset.type === type);
    }

    // Filter by category
    if (category) {
      results = results.filter(asset => asset.category === category);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter(asset => 
        tags.some(tag => asset.tags.includes(tag))
      );
    }

    return results.sort((a, b) => b.usage - a.usage);
  }

  /**
   * Get assets by type
   */
  getAssetsByType(type: AssetType): Asset[] {
    return this.store.assets
      .filter(asset => asset.type === type)
      .sort((a, b) => b.usage - a.usage);
  }

  /**
   * Get assets by category
   */
  getAssetsByCategory(category: string): Asset[] {
    return this.store.assets
      .filter(asset => asset.category === category)
      .sort((a, b) => b.usage - a.usage);
  }

  /**
   * Get assets by tag
   */
  getAssetsByTag(tag: string): Asset[] {
    return this.store.assets
      .filter(asset => asset.tags.includes(tag))
      .sort((a, b) => b.usage - a.usage);
  }

  /**
   * Get popular assets
   */
  getPopularAssets(limit: number = 10): Asset[] {
    return this.store.assets
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  /**
   * Get highly rated assets
   */
  getHighlyRatedAssets(limit: number = 10): Asset[] {
    return this.store.assets
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Get collection assets
   */
  getCollectionAssets(collectionId: string): Asset[] {
    const collection = this.store.collections.find(c => c.id === collectionId);
    if (!collection) {
      return [];
    }

    return this.store.assets
      .filter(asset => collection.assets.includes(asset.id))
      .sort((a, b) => b.usage - a.usage);
  }

  /**
   * Update category asset count
   */
  private updateCategoryAssetCount(categoryName: string): void {
    const category = this.store.categories.find(c => c.name === categoryName);
    if (category) {
      category.assetCount = this.store.assets.filter(a => a.category === categoryName).length;
    }
  }

  /**
   * Update tag usage
   */
  private updateTagUsage(tagName: string): void {
    const tag = this.store.tags.find(t => t.name === tagName);
    if (tag) {
      tag.usage = this.store.assets.filter(a => a.tags.includes(tagName)).length;
    }
  }

  /**
   * Get asset library statistics
   */
  getStats(): {
    assetCount: number;
    categoryCount: number;
    tagCount: number;
    collectionCount: number;
    totalUsage: number;
    averageRating: number;
  } {
    const totalUsage = this.store.assets.reduce((sum, asset) => sum + asset.usage, 0);
    const totalRating = this.store.assets.reduce((sum, asset) => sum + asset.rating, 0);
    const averageRating = this.store.assets.length > 0 ? totalRating / this.store.assets.length : 0;

    return {
      assetCount: this.store.assets.length,
      categoryCount: this.store.categories.length,
      tagCount: this.store.tags.length,
      collectionCount: this.store.collections.length,
      totalUsage,
      averageRating
    };
  }

  /**
   * Handle asset creation events
   */
  private async handleAssetCreation(event: any): Promise<void> {
    try {
      const { name, type, url, metadata, tags, category } = event.data;
      this.addAsset(name, type, url, metadata, tags, category);
    } catch (error) {
      console.error('Error handling asset creation:', error);
    }
  }

  /**
   * Handle asset update events
   */
  private async handleAssetUpdate(event: any): Promise<void> {
    try {
      const { assetId, updates } = event.data;
      this.updateAsset(assetId, updates);
    } catch (error) {
      console.error('Error handling asset update:', error);
    }
  }

  /**
   * Handle category creation events
   */
  private async handleCategoryCreation(event: any): Promise<void> {
    try {
      const { name, description, parentCategory } = event.data;
      this.addCategory(name, description, parentCategory);
    } catch (error) {
      console.error('Error handling category creation:', error);
    }
  }

  /**
   * Handle collection creation events
   */
  private async handleCollectionCreation(event: any): Promise<void> {
    try {
      const { name, description, isPublic } = event.data;
      this.addCollection(name, description, isPublic);
    } catch (error) {
      console.error('Error handling collection creation:', error);
    }
  }

  /**
   * Get current asset library state
   */
  getState(): AssetLibraryType {
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
    console.log('Asset Library destroyed');
  }
}

// Export singleton instance
export const assetLibrary = new AssetLibrary(); 