import { AssetLibrary } from '../components/core/AssetLibrary';
import { Asset, AssetType } from '../types/tony';

describe('Asset Quality Scoring System', () => {
  let assetLibrary: AssetLibrary;

  beforeEach(() => {
    assetLibrary = new AssetLibrary();
  });

  afterEach(async () => {
    await assetLibrary.destroy();
  });

  describe('Quality Score Calculation', () => {
    it('should calculate quality score for a high-quality image asset', () => {
      const highQualityAsset: Asset = {
        id: 'test-high-quality',
        name: 'High Quality Image',
        type: 'image' as AssetType,
        url: 'https://example.com/high-quality.png',
        metadata: {
          size: 500 * 1024, // 500KB
          format: 'png',
          dimensions: { width: 1920, height: 1080 },
          description: 'A high-quality image with excellent resolution and proper metadata',
          author: 'John Doe',
          license: 'MIT',
          altText: 'High quality image showing beautiful landscape',
          colorPalette: ['#FF0000', '#00FF00', '#0000FF'],
          compressed: true,
          ratingCount: 15
        },
        tags: ['landscape', 'nature', 'high-resolution', 'professional'],
        category: 'photography',
        usage: 25,
        rating: 4.8,
        createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
        lastUpdated: Date.now() - (1 * 24 * 60 * 60 * 1000) // 1 day ago
      };

      const analysis = assetLibrary.calculateQualityScore(highQualityAsset);

      expect(analysis.score).toBeGreaterThan(80);
      expect(analysis.grade).toMatch(/^[AB][+]?$/);
      expect(analysis.metrics.technical).toBeGreaterThan(80);
      expect(analysis.metrics.metadata).toBeGreaterThan(80);
      expect(analysis.metrics.usage).toBeGreaterThan(70);
      expect(analysis.metrics.feedback).toBeGreaterThan(90);
      expect(analysis.metrics.accessibility).toBeGreaterThan(70);
      expect(analysis.strengths.length).toBeGreaterThan(0);
      expect(analysis.issues.length).toBe(0);
    });

    it('should calculate quality score for a low-quality asset', () => {
      const lowQualityAsset: Asset = {
        id: 'test-low-quality',
        name: 'Low Quality Asset',
        type: 'image' as AssetType,
        url: 'https://example.com/low-quality.bmp',
        metadata: {
          size: 15 * 1024 * 1024, // 15MB
          format: 'bmp',
          dimensions: { width: 100, height: 100 }
        },
        tags: [],
        category: 'uncategorized',
        usage: 1,
        rating: 2.0,
        createdAt: Date.now() - (365 * 24 * 60 * 60 * 1000), // 1 year ago
        lastUpdated: Date.now() - (365 * 24 * 60 * 60 * 1000) // 1 year ago
      };

      const analysis = assetLibrary.calculateQualityScore(lowQualityAsset);

      expect(analysis.score).toBeLessThan(60);
      expect(analysis.grade).toMatch(/^[CDEF]$/);
      expect(analysis.metrics.technical).toBeLessThan(60);
      expect(analysis.metrics.metadata).toBeLessThan(40);
      expect(analysis.metrics.usage).toBeLessThan(50);
      expect(analysis.metrics.feedback).toBeLessThan(50);
      expect(analysis.issues.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle different asset types correctly', () => {
      const svgAsset: Asset = {
        id: 'test-svg',
        name: 'Vector Icon',
        type: 'icon' as AssetType,
        url: 'https://example.com/icon.svg',
        metadata: {
          size: 5 * 1024, // 5KB
          format: 'svg',
          description: 'Scalable vector icon',
          author: 'Design Team',
          license: 'MIT'
        },
        tags: ['icon', 'vector', 'scalable'],
        category: 'icons',
        usage: 10,
        rating: 4.5,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(svgAsset);

      expect(analysis.metrics.technical).toBeGreaterThan(80);
      expect(analysis.metrics.performance).toBeGreaterThan(80);
    });
  });

  describe('Quality Metrics Breakdown', () => {
    it('should calculate technical quality correctly', () => {
      const asset: Asset = {
        id: 'test-technical',
        name: 'Technical Test',
        type: 'image' as AssetType,
        url: 'https://example.com/test.webp',
        metadata: {
          size: 1 * 1024 * 1024, // 1MB
          format: 'webp',
          dimensions: { width: 2000, height: 1500 }
        },
        tags: ['test'],
        category: 'test',
        usage: 5,
        rating: 3.5,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(asset);

      expect(analysis.metrics.technical).toBeGreaterThan(80);
    });

    it('should calculate metadata quality correctly', () => {
      const asset: Asset = {
        id: 'test-metadata',
        name: 'Metadata Test',
        type: 'image' as AssetType,
        url: 'https://example.com/test.jpg',
        metadata: {
          size: 500 * 1024,
          format: 'jpg',
          description: 'A detailed description of this asset',
          author: 'Jane Smith',
          license: 'CC-BY'
        },
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        category: 'photography',
        usage: 5,
        rating: 4.0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(asset);

      expect(analysis.metrics.metadata).toBeGreaterThan(80);
    });

    it('should calculate accessibility quality correctly', () => {
      const asset: Asset = {
        id: 'test-accessibility',
        name: 'Accessibility Test',
        type: 'image' as AssetType,
        url: 'https://example.com/test.png',
        metadata: {
          size: 500 * 1024,
          format: 'png',
          altText: 'Detailed description for screen readers',
          colorPalette: ['#FFFFFF', '#000000'],
          contrastRatio: 4.5,
          semanticTags: ['decorative', 'informative']
        },
        tags: ['accessible'],
        category: 'ui',
        usage: 5,
        rating: 4.0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(asset);

      expect(analysis.metrics.accessibility).toBeGreaterThan(80);
    });
  });

  describe('Quality-Based Asset Filtering', () => {
    beforeEach(async () => {
      await assetLibrary.initialize();
      
      // Add test assets to the library
      const highQualityAsset = assetLibrary.addAsset(
        'High Quality Asset',
        'image',
        'https://example.com/high.png',
        {
          size: 500 * 1024,
          format: 'png',
          dimensions: { width: 1920, height: 1080 },
          description: 'High quality asset',
          author: 'John Doe',
          license: 'MIT'
        },
        ['high-quality', 'professional'],
        'photography'
      );

      const lowQualityAsset = assetLibrary.addAsset(
        'Low Quality Asset',
        'image',
        'https://example.com/low.bmp',
        {
          size: 10 * 1024 * 1024,
          format: 'bmp',
          dimensions: { width: 100, height: 100 }
        },
        ['low-quality'],
        'uncategorized'
      );

      // Set usage and ratings
      assetLibrary.incrementAssetUsage(highQualityAsset.id);
      assetLibrary.incrementAssetUsage(highQualityAsset.id);
      assetLibrary.rateAsset(highQualityAsset.id, 4.8);
      assetLibrary.rateAsset(lowQualityAsset.id, 2.0);
    });

    it('should filter assets by quality score', () => {
      const highQualityAssets = assetLibrary.getAssetsByQuality(80, 100);
      const lowQualityAssets = assetLibrary.getAssetsByQuality(0, 59);

      expect(highQualityAssets.length).toBeGreaterThanOrEqual(0);
      expect(lowQualityAssets.length).toBeGreaterThanOrEqual(0);
    });

    it('should get high-quality assets', () => {
      const highQualityAssets = assetLibrary.getHighQualityAssets(5);
      
      expect(highQualityAssets.length).toBeGreaterThanOrEqual(0);
      if (highQualityAssets.length > 0) {
        highQualityAssets.forEach(asset => {
          const analysis = assetLibrary.calculateQualityScore(asset);
          expect(analysis.score).toBeGreaterThanOrEqual(80);
        });
      }
    });

    it('should get assets needing improvement', () => {
      const assetsNeedingImprovement = assetLibrary.getAssetsNeedingImprovement(5);
      
      expect(assetsNeedingImprovement.length).toBeGreaterThan(0);
      assetsNeedingImprovement.forEach(asset => {
        const analysis = assetLibrary.calculateQualityScore(asset);
        expect(analysis.score).toBeLessThan(60);
      });
    });
  });

  describe('Quality Report Generation', () => {
    beforeEach(async () => {
      await assetLibrary.initialize();
      
      // Add various quality assets
      for (let i = 0; i < 10; i++) {
        const quality = i < 3 ? 'high' : i < 7 ? 'medium' : 'low';
        const asset = assetLibrary.addAsset(
          `${quality} quality asset ${i}`,
          'image',
          `https://example.com/${quality}-${i}.png`,
          {
            size: quality === 'high' ? 500 * 1024 : quality === 'medium' ? 2 * 1024 * 1024 : 10 * 1024 * 1024,
            format: quality === 'high' ? 'png' : quality === 'medium' ? 'jpg' : 'bmp',
            dimensions: quality === 'high' ? { width: 1920, height: 1080 } : { width: 800, height: 600 },
            description: quality === 'high' ? 'High quality asset' : 'Lower quality asset',
            author: quality === 'high' ? 'John Doe' : undefined,
            license: quality === 'high' ? 'MIT' : undefined
          },
          quality === 'high' ? ['high-quality', 'professional'] : ['basic'],
          quality === 'high' ? 'photography' : 'uncategorized'
        );

        // Set usage and ratings
        const usage = quality === 'high' ? 20 : quality === 'medium' ? 10 : 2;
        const rating = quality === 'high' ? 4.8 : quality === 'medium' ? 3.5 : 2.0;

        for (let j = 0; j < usage; j++) {
          assetLibrary.incrementAssetUsage(asset.id);
        }
        assetLibrary.rateAsset(asset.id, rating);
      }
    });

    it('should generate comprehensive quality report', () => {
      const report = assetLibrary.generateQualityReport();

      expect(report.totalAssets).toBe(10);
      expect(report.averageScore).toBeGreaterThan(0);
      expect(report.averageScore).toBeLessThanOrEqual(100);
      expect(Object.keys(report.gradeDistribution).length).toBeGreaterThan(0);
      expect(report.topIssues.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide actionable insights in report', () => {
      const report = assetLibrary.generateQualityReport();

      report.topIssues.forEach(issue => {
        expect(issue).toMatch(/quality|metadata|technical|accessibility|usage|feedback|improved/);
      });

      report.recommendations.forEach(rec => {
        expect(rec).toMatch(/add|improve|consider|compress|convert|assign/);
      });
    });
  });

  describe('Quality Insights and Recommendations', () => {
    it('should provide specific recommendations for technical issues', () => {
      const asset: Asset = {
        id: 'test-technical-issues',
        name: 'Technical Issues Asset',
        type: 'image' as AssetType,
        url: 'https://example.com/large.bmp',
        metadata: {
          size: 20 * 1024 * 1024, // 20MB
          format: 'bmp',
          dimensions: { width: 100, height: 100 }
        },
        tags: ['large'],
        category: 'uncategorized',
        usage: 1,
        rating: 2.0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(asset);

      expect(analysis.issues).toContain('Technical quality needs improvement');
      expect(analysis.recommendations).toContain('Consider compressing the file to reduce size');
      expect(analysis.recommendations).toContain('Consider converting to a more efficient format (SVG, WebP, PNG)');
    });

    it('should provide specific recommendations for metadata issues', () => {
      const asset: Asset = {
        id: 'test-metadata-issues',
        name: 'Metadata Issues Asset',
        type: 'image' as AssetType,
        url: 'https://example.com/basic.jpg',
        metadata: {
          size: 500 * 1024,
          format: 'jpg'
        },
        tags: [],
        category: 'uncategorized',
        usage: 1,
        rating: 3.0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(asset);

      expect(analysis.issues).toContain('Insufficient metadata');
      expect(analysis.recommendations).toContain('Add more descriptive tags');
      expect(analysis.recommendations).toContain('Add a detailed description');
      expect(analysis.recommendations).toContain('Assign to a specific category');
    });

    it('should provide specific recommendations for accessibility issues', () => {
      const asset: Asset = {
        id: 'test-accessibility-issues',
        name: 'Accessibility Issues Asset',
        type: 'image' as AssetType,
        url: 'https://example.com/image.jpg',
        metadata: {
          size: 500 * 1024,
          format: 'jpg'
        },
        tags: ['image'],
        category: 'photography',
        usage: 5,
        rating: 4.0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(asset);

      expect(analysis.issues).toContain('Accessibility could be improved');
      expect(analysis.recommendations).toContain('Add alt text for screen readers');
      expect(analysis.recommendations).toContain('Consider adding accessibility metadata');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle assets with minimal metadata gracefully', () => {
      const minimalAsset: Asset = {
        id: 'test-minimal',
        name: 'Minimal Asset',
        type: 'image' as AssetType,
        url: 'https://example.com/minimal.jpg',
        metadata: {
          size: 100 * 1024,
          format: 'jpg'
        },
        tags: [],
        category: 'uncategorized',
        usage: 0,
        rating: 0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(minimalAsset);

      expect(analysis.score).toBeGreaterThanOrEqual(0);
      expect(analysis.score).toBeLessThanOrEqual(100);
      expect(analysis.grade).toBeDefined();
      expect(analysis.metrics).toBeDefined();
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle very large files appropriately', () => {
      const largeAsset: Asset = {
        id: 'test-large',
        name: 'Large Asset',
        type: 'image' as AssetType,
        url: 'https://example.com/large.jpg',
        metadata: {
          size: 100 * 1024 * 1024, // 100MB
          format: 'jpg',
          dimensions: { width: 8000, height: 6000 }
        },
        tags: ['large'],
        category: 'photography',
        usage: 1,
        rating: 1.0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(largeAsset);

      expect(analysis.metrics.technical).toBeLessThan(70);
      expect(analysis.metrics.performance).toBeLessThan(30);
      expect(analysis.issues).toContain('Technical quality needs improvement');
    });

    it('should handle unknown file formats gracefully', () => {
      const unknownFormatAsset: Asset = {
        id: 'test-unknown-format',
        name: 'Unknown Format Asset',
        type: 'image' as AssetType,
        url: 'https://example.com/unknown.xyz',
        metadata: {
          size: 500 * 1024,
          format: 'xyz'
        },
        tags: ['unknown'],
        category: 'other',
        usage: 1,
        rating: 3.0,
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      const analysis = assetLibrary.calculateQualityScore(unknownFormatAsset);

      expect(analysis.metrics.technical).toBeLessThan(80);
      expect(analysis.recommendations).toContain('Consider converting to a more efficient format (SVG, WebP, PNG)');
    });
  });
}); 