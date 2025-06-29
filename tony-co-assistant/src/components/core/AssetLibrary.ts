import { AssetLibrary as AssetLibraryType, Asset, Category, Tag, Collection, AssetType } from '../../types/tony';
import { eventBus } from '../../events/EventBus';

/**
 * Enhanced Quality Metrics Interface
 */
interface QualityMetrics {
  overall: number; // 0-100
  technical: number; // File quality, format, size
  metadata: number; // Tags, descriptions, categorization
  usage: number; // Usage patterns and popularity
  feedback: number; // User ratings and reviews
  accessibility: number; // Accessibility compliance
  performance: number; // Loading speed, optimization
  compliance: number; // License, copyright, standards
}

/**
 * Quality Analysis Result
 */
interface QualityAnalysis {
  metrics: QualityMetrics;
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  recommendations: string[];
  issues: string[];
  strengths: string[];
}

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
        eventBus.subscribe('collection_created', this.handleCollectionCreation.bind(this)),
        eventBus.subscribe('asset_quality_analyzed', this.handleQualityAnalysis.bind(this))
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
   * Enhanced quality scoring system
   */
  calculateQualityScore(asset: Asset): QualityAnalysis {
    const metrics = this.calculateQualityMetrics(asset);
    const score = this.calculateOverallScore(metrics);
    const grade = this.calculateGrade(score);
    const { recommendations, issues, strengths } = this.generateQualityInsights(asset, metrics);

    return {
      metrics,
      score,
      grade,
      recommendations,
      issues,
      strengths
    };
  }

  /**
   * Calculate detailed quality metrics
   */
  private calculateQualityMetrics(asset: Asset): QualityMetrics {
    // Technical Quality (30% weight)
    const technical = this.calculateTechnicalQuality(asset);
    
    // Metadata Quality (20% weight)
    const metadata = this.calculateMetadataQuality(asset);
    
    // Usage Quality (20% weight)
    const usage = this.calculateUsageQuality(asset);
    
    // Feedback Quality (15% weight)
    const feedback = this.calculateFeedbackQuality(asset);
    
    // Accessibility Quality (10% weight)
    const accessibility = this.calculateAccessibilityQuality(asset);
    
    // Performance Quality (3% weight)
    const performance = this.calculatePerformanceQuality(asset);
    
    // Compliance Quality (2% weight)
    const compliance = this.calculateComplianceQuality(asset);

    return {
      overall: 0, // Will be calculated separately
      technical,
      metadata,
      usage,
      feedback,
      accessibility,
      performance,
      compliance
    };
  }

  /**
   * Calculate technical quality based on file properties
   */
  private calculateTechnicalQuality(asset: Asset): number {
    let score = 0;
    
    // File format quality (40% of technical score)
    const formatScores: Record<string, number> = {
      'svg': 100, // Vector, scalable
      'webp': 95, // Modern, efficient
      'png': 90, // Lossless, good quality
      'jpg': 80, // Compressed, widely supported
      'gif': 70, // Limited color, animation support
      'bmp': 60, // Uncompressed, large size
      'tiff': 85, // High quality, large size
      'ico': 75, // Icon format
      'pdf': 90, // Document format
      'mp4': 85, // Video format
      'mp3': 80, // Audio format
      'json': 95, // Data format
      'css': 90, // Style format
      'js': 90, // Script format
      'html': 85, // Markup format
    };
    
    const format = asset.metadata?.format?.toLowerCase() || 'unknown';
    score += (formatScores[format] || 50) * 0.4;
    
    // File size optimization (30% of technical score)
    const sizeInMB = (asset.metadata?.size || 0) / (1024 * 1024);
    let sizeScore = 100;
    if (sizeInMB > 10) sizeScore = 20; // Very large
    else if (sizeInMB > 5) sizeScore = 40; // Large
    else if (sizeInMB > 2) sizeScore = 60; // Medium
    else if (sizeInMB > 1) sizeScore = 80; // Small
    else if (sizeInMB > 0.1) sizeScore = 100; // Very small
    score += sizeScore * 0.3;
    
    // Resolution quality (30% of technical score)
    if (asset.metadata?.dimensions) {
      const { width, height } = asset.metadata.dimensions;
      const resolution = width * height;
      let resolutionScore = 50;
      if (resolution > 10000000) resolutionScore = 100; // Very high
      else if (resolution > 5000000) resolutionScore = 90; // High
      else if (resolution > 1000000) resolutionScore = 80; // Medium-high
      else if (resolution > 500000) resolutionScore = 70; // Medium
      else if (resolution > 100000) resolutionScore = 60; // Low-medium
      else resolutionScore = 50; // Low
      score += resolutionScore * 0.3;
    } else {
      score += 50 * 0.3; // Default score for non-image assets
    }
    
    return Math.round(score);
  }

  /**
   * Calculate metadata quality
   */
  private calculateMetadataQuality(asset: Asset): number {
    let score = 0;
    
    // Tags quality (40% of metadata score)
    const tagScore = Math.min(100, asset.tags.length * 15);
    score += tagScore * 0.4;
    
    // Category quality (20% of metadata score)
    const categoryScore = asset.category && asset.category !== 'uncategorized' ? 100 : 30;
    score += categoryScore * 0.2;
    
    // Description quality (20% of metadata score)
    const description = asset.metadata?.description || '';
    const descriptionScore = description.length > 50 ? 100 : 
                           description.length > 20 ? 70 : 
                           description.length > 0 ? 40 : 10;
    score += descriptionScore * 0.2;
    
    // Author information (10% of metadata score)
    const authorScore = asset.metadata?.author ? 100 : 30;
    score += authorScore * 0.1;
    
    // License information (10% of metadata score)
    const licenseScore = asset.metadata?.license ? 100 : 30;
    score += licenseScore * 0.1;
    
    return Math.round(score);
  }

  /**
   * Calculate usage quality
   */
  private calculateUsageQuality(asset: Asset): number {
    let score = 0;
    
    // Usage frequency (50% of usage score)
    const usageScore = Math.min(100, asset.usage * 10);
    score += usageScore * 0.5;
    
    // Recent usage (30% of usage score)
    const daysSinceLastUpdate = (Date.now() - asset.lastUpdated) / (1000 * 60 * 60 * 24);
    const recencyScore = daysSinceLastUpdate < 7 ? 100 :
                        daysSinceLastUpdate < 30 ? 80 :
                        daysSinceLastUpdate < 90 ? 60 :
                        daysSinceLastUpdate < 365 ? 40 : 20;
    score += recencyScore * 0.3;
    
    // Asset age (20% of usage score)
    const daysSinceCreation = (Date.now() - asset.createdAt) / (1000 * 60 * 60 * 24);
    const ageScore = daysSinceCreation < 30 ? 100 :
                    daysSinceCreation < 90 ? 90 :
                    daysSinceCreation < 365 ? 80 :
                    daysSinceCreation < 730 ? 70 : 60;
    score += ageScore * 0.2;
    
    return Math.round(score);
  }

  /**
   * Calculate feedback quality
   */
  private calculateFeedbackQuality(asset: Asset): number {
    let score = 0;
    
    // Rating quality (70% of feedback score)
    const ratingScore = asset.rating * 20; // Convert 0-5 to 0-100
    score += ratingScore * 0.7;
    
    // Rating count (30% of feedback score)
    const ratingCount = asset.metadata?.ratingCount || 0;
    const countScore = ratingCount > 10 ? 100 :
                      ratingCount > 5 ? 80 :
                      ratingCount > 2 ? 60 :
                      ratingCount > 0 ? 40 : 20;
    score += countScore * 0.3;
    
    return Math.round(score);
  }

  /**
   * Calculate accessibility quality
   */
  private calculateAccessibilityQuality(asset: Asset): number {
    let score = 50; // Default score
    
    // Alt text for images (40% of accessibility score)
    if (asset.type === 'image') {
      const altText = asset.metadata?.altText || '';
      const altScore = altText.length > 10 ? 100 :
                      altText.length > 0 ? 60 : 20;
      score = score * 0.6 + altScore * 0.4;
    }
    
    // Color contrast (30% of accessibility score)
    const hasColorInfo = asset.metadata?.colorPalette || asset.metadata?.contrastRatio;
    const colorScore = hasColorInfo ? 100 : 50;
    score = score * 0.7 + colorScore * 0.3;
    
    // Semantic markup (30% of accessibility score)
    const hasSemanticInfo = asset.metadata?.semanticTags || asset.metadata?.ariaLabels;
    const semanticScore = hasSemanticInfo ? 100 : 50;
    score = score * 0.7 + semanticScore * 0.3;
    
    return Math.round(score);
  }

  /**
   * Calculate performance quality
   */
  private calculatePerformanceQuality(asset: Asset): number {
    let score = 70; // Default score
    
    // File size optimization (60% of performance score)
    const sizeInMB = (asset.metadata?.size || 0) / (1024 * 1024);
    let sizeScore = 100;
    if (sizeInMB > 5) sizeScore = 20;
    else if (sizeInMB > 2) sizeScore = 40;
    else if (sizeInMB > 1) sizeScore = 60;
    else if (sizeInMB > 0.5) sizeScore = 80;
    else sizeScore = 100;
    score = score * 0.4 + sizeScore * 0.6;
    
    // Compression status (40% of performance score)
    const isCompressed = asset.metadata?.compressed || false;
    const compressionScore = isCompressed ? 100 : 60;
    score = score * 0.6 + compressionScore * 0.4;
    
    return Math.round(score);
  }

  /**
   * Calculate compliance quality
   */
  private calculateComplianceQuality(asset: Asset): number {
    let score = 70; // Default score
    
    // License compliance (50% of compliance score)
    const license = asset.metadata?.license || '';
    const validLicenses = ['MIT', 'Apache', 'GPL', 'CC-BY', 'CC-BY-SA', 'CC0', 'Public Domain'];
    const licenseScore = validLicenses.some(l => license.includes(l)) ? 100 : 50;
    score = score * 0.5 + licenseScore * 0.5;
    
    // Copyright information (30% of compliance score)
    const hasCopyright = asset.metadata?.copyright || asset.metadata?.author;
    const copyrightScore = hasCopyright ? 100 : 50;
    score = score * 0.7 + copyrightScore * 0.3;
    
    // Usage rights (20% of compliance score)
    const hasUsageRights = asset.metadata?.usageRights || asset.metadata?.permissions;
    const rightsScore = hasUsageRights ? 100 : 50;
    score = score * 0.8 + rightsScore * 0.2;
    
    return Math.round(score);
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(metrics: QualityMetrics): number {
    const weights = {
      technical: 0.30,
      metadata: 0.20,
      usage: 0.20,
      feedback: 0.15,
      accessibility: 0.10,
      performance: 0.03,
      compliance: 0.02
    };
    
    const overall = 
      metrics.technical * weights.technical +
      metrics.metadata * weights.metadata +
      metrics.usage * weights.usage +
      metrics.feedback * weights.feedback +
      metrics.accessibility * weights.accessibility +
      metrics.performance * weights.performance +
      metrics.compliance * weights.compliance;
    
    return Math.round(overall);
  }

  /**
   * Calculate letter grade
   */
  private calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate quality insights and recommendations
   */
  private generateQualityInsights(asset: Asset, metrics: QualityMetrics): {
    recommendations: string[];
    issues: string[];
    strengths: string[];
  } {
    const recommendations: string[] = [];
    const issues: string[] = [];
    const strengths: string[] = [];

    // Technical insights
    if (metrics.technical < 70) {
      issues.push('Technical quality needs improvement');
      if (asset.metadata?.size && asset.metadata.size > 5 * 1024 * 1024) {
        recommendations.push('Consider compressing the file to reduce size');
      }
      if (!['svg', 'webp', 'png'].includes(asset.metadata?.format?.toLowerCase() || '')) {
        recommendations.push('Consider converting to a more efficient format (SVG, WebP, PNG)');
      }
    } else {
      strengths.push('Good technical quality');
    }

    // Metadata insights
    if (metrics.metadata < 60) {
      issues.push('Insufficient metadata');
      if (asset.tags.length < 3) {
        recommendations.push('Add more descriptive tags');
      }
      if (!asset.metadata?.description) {
        recommendations.push('Add a detailed description');
      }
      if (asset.category === 'uncategorized') {
        recommendations.push('Assign to a specific category');
      }
    } else {
      strengths.push('Well-documented asset');
    }

    // Usage insights
    if (metrics.usage < 50) {
      issues.push('Low usage indicates potential discoverability issues');
      recommendations.push('Consider improving asset visibility and searchability');
    } else {
      strengths.push('Popular and well-used asset');
    }

    // Feedback insights
    if (metrics.feedback < 60) {
      issues.push('Limited user feedback');
      recommendations.push('Encourage users to rate and review this asset');
    } else {
      strengths.push('Highly rated by users');
    }

    // Accessibility insights
    if (metrics.accessibility < 70) {
      issues.push('Accessibility could be improved');
      if (asset.type === 'image' && !asset.metadata?.altText) {
        recommendations.push('Add alt text for screen readers');
      }
      recommendations.push('Consider adding accessibility metadata');
    } else {
      strengths.push('Good accessibility features');
    }

    return { recommendations, issues, strengths };
  }

  /**
   * Get assets by quality score
   */
  getAssetsByQuality(minScore: number = 0, maxScore: number = 100): Asset[] {
    return this.store.assets
      .filter(asset => {
        const analysis = this.calculateQualityScore(asset);
        return analysis.score >= minScore && analysis.score <= maxScore;
      })
      .sort((a, b) => {
        const analysisA = this.calculateQualityScore(a);
        const analysisB = this.calculateQualityScore(b);
        return analysisB.score - analysisA.score;
      });
  }

  /**
   * Get high-quality assets (score >= 80)
   */
  getHighQualityAssets(limit: number = 10): Asset[] {
    return this.getAssetsByQuality(80, 100).slice(0, limit);
  }

  /**
   * Get assets needing improvement (score < 60)
   */
  getAssetsNeedingImprovement(limit: number = 10): Asset[] {
    return this.getAssetsByQuality(0, 59).slice(0, limit);
  }

  /**
   * Analyze all assets and generate quality report
   */
  generateQualityReport(): {
    totalAssets: number;
    averageScore: number;
    gradeDistribution: Record<string, number>;
    topIssues: string[];
    recommendations: string[];
  } {
    const analyses = this.store.assets.map(asset => this.calculateQualityScore(asset));
    const totalAssets = this.store.assets.length;
    const averageScore = totalAssets > 0 ? 
      Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / totalAssets) : 0;
    
    // Grade distribution
    const gradeDistribution: Record<string, number> = {};
    analyses.forEach(analysis => {
      gradeDistribution[analysis.grade] = (gradeDistribution[analysis.grade] || 0) + 1;
    });
    
    // Top issues
    const allIssues = analyses.flatMap(a => a.issues);
    const issueCounts: Record<string, number> = {};
    allIssues.forEach(issue => {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });
    const topIssues = Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
    
    // Top recommendations
    const allRecommendations = analyses.flatMap(a => a.recommendations);
    const recCounts: Record<string, number> = {};
    allRecommendations.forEach(rec => {
      recCounts[rec] = (recCounts[rec] || 0) + 1;
    });
    const recommendations = Object.entries(recCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([rec]) => rec);
    
    return {
      totalAssets,
      averageScore,
      gradeDistribution,
      topIssues,
      recommendations
    };
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
   * Handle quality analysis events
   */
  private async handleQualityAnalysis(event: any): Promise<void> {
    try {
      const { assetId, analysis } = event.data;
      const asset = this.store.assets.find(a => a.id === assetId);
      if (asset) {
        Object.assign(asset, analysis);
        asset.lastUpdated = Date.now();
      }
    } catch (error) {
      console.error('Error handling quality analysis:', error);
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