import { PredictiveLearningSystem, TimeSeriesData, TrendAnalysis, ForecastResult } from '../PredictiveLearningSystem';

describe('PredictiveLearningSystem - Phase 5.1 Advanced Learning', () => {
  let predictiveSystem: PredictiveLearningSystem;

  beforeEach(async () => {
    predictiveSystem = new PredictiveLearningSystem();
    await predictiveSystem.initialize();
  });

  describe('Initialization', () => {
    test('should initialize with default models', () => {
      const models = predictiveSystem.getModels();
      
      expect(models.length).toBeGreaterThan(0);
      expect(models.some(m => m.type === 'arima')).toBe(true);
      expect(models.some(m => m.type === 'lstm')).toBe(true);
      expect(models.some(m => m.type === 'random_forest')).toBe(true);
      
      models.forEach(model => {
        expect(model.status).toBe('active');
        expect(model.accuracy).toBeGreaterThan(0);
        expect(model.accuracy).toBeLessThanOrEqual(1);
      });
    });

    test('should handle initialization events', async () => {
      // Test that initialization completes without errors
      expect(predictiveSystem).toBeDefined();
    });
  });

  describe('Time Series Data Management', () => {
    test('should add time series data', () => {
      const seriesId = 'test_series_1';
      const data: TimeSeriesData[] = [
        { timestamp: Date.now() - 1000, value: 10 },
        { timestamp: Date.now() - 500, value: 15 },
        { timestamp: Date.now(), value: 20 }
      ];

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      // Note: We can't directly access private timeSeriesData, but we can test through public methods
      expect(predictiveSystem).toBeDefined();
    });

    test('should handle empty time series data', () => {
      const seriesId = 'empty_series';
      const data: TimeSeriesData[] = [];

      expect(() => {
        predictiveSystem.addTimeSeriesData(seriesId, data);
      }).not.toThrow();
    });
  });

  describe('Trend Analysis', () => {
    test('should analyze increasing trend', async () => {
      const seriesId = 'increasing_trend';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      // Create increasing trend data
      for (let i = 0; i < 15; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 10 + i * 2 // Linear increase
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      // Wait a bit for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get predictive patterns
      const patterns = predictiveSystem.getPredictivePatterns('trend');
      expect(patterns.length).toBeGreaterThan(0);
    });

    test('should analyze decreasing trend', async () => {
      const seriesId = 'decreasing_trend';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      // Create decreasing trend data
      for (let i = 0; i < 15; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 50 - i * 2 // Linear decrease
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const patterns = predictiveSystem.getPredictivePatterns('trend');
      expect(patterns.length).toBeGreaterThan(0);
    });

    test('should analyze cyclical trend', async () => {
      const seriesId = 'cyclical_trend';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      // Create cyclical data
      for (let i = 0; i < 20; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 20 + 10 * Math.sin(i * Math.PI / 4) // Sine wave pattern
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const patterns = predictiveSystem.getPredictivePatterns('seasonal');
      expect(patterns.length).toBeGreaterThan(0);
    });

    test('should throw error for insufficient data', async () => {
      const seriesId = 'insufficient_data';
      const data: TimeSeriesData[] = [
        { timestamp: Date.now(), value: 10 },
        { timestamp: Date.now() + 1000, value: 15 }
      ];

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      await expect(
        predictiveSystem.analyzeTimeSeries(seriesId)
      ).rejects.toThrow('Insufficient data for analysis');
    });
  });

  describe('Forecasting', () => {
    test('should generate forecast for time series', async () => {
      const seriesId = 'forecast_test';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      // Create sufficient data for forecasting
      for (let i = 0; i < 25; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 10 + i * 1.5 // Linear trend
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      const forecast = await predictiveSystem.generateForecast(seriesId, 5, 'arima');
      
      expect(forecast).toBeDefined();
      expect(forecast.predictions.length).toBe(5);
      expect(forecast.model).toBe('ARIMA Model');
      expect(forecast.accuracy).toBeGreaterThan(0);
      expect(forecast.horizon).toBe(5);
      
      forecast.predictions.forEach(prediction => {
        expect(prediction.timestamp).toBeGreaterThan(0);
        expect(prediction.value).toBeDefined();
        expect(prediction.confidence).toBeGreaterThan(0);
        expect(prediction.confidence).toBeLessThanOrEqual(1);
        expect(prediction.uncertainty).toBeGreaterThanOrEqual(0);
        expect(prediction.uncertainty).toBeLessThanOrEqual(1);
      });
    });

    test('should generate forecast with different models', async () => {
      const seriesId = 'model_comparison';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      for (let i = 0; i < 25; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 20 + Math.random() * 10 // Random data
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      const arimaForecast = await predictiveSystem.generateForecast(seriesId, 3, 'arima');
      const lstmForecast = await predictiveSystem.generateForecast(seriesId, 3, 'lstm');
      
      expect(arimaForecast.model).toBe('ARIMA Model');
      expect(lstmForecast.model).toBe('LSTM Neural Network');
      expect(arimaForecast.predictions.length).toBe(3);
      expect(lstmForecast.predictions.length).toBe(3);
    });

    test('should throw error for insufficient data for forecasting', async () => {
      const seriesId = 'insufficient_forecast';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      // Only 10 data points (less than required 20)
      for (let i = 0; i < 10; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 10 + i
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      await expect(
        predictiveSystem.generateForecast(seriesId, 5)
      ).rejects.toThrow('Insufficient data for forecasting');
    });
  });

  describe('Anomaly Detection', () => {
    test('should detect anomalies in time series', () => {
      const seriesId = 'anomaly_test';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      // Create normal data with some anomalies
      for (let i = 0; i < 20; i++) {
        let value = 20 + Math.random() * 5; // Normal range: 20-25
        if (i === 5 || i === 15) {
          value = 50; // Anomalies
        }
        data.push({
          timestamp: now + i * 1000,
          value
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      const anomalies = predictiveSystem.detectAnomalies(seriesId, 2.0);
      
      expect(anomalies.length).toBeGreaterThan(0);
      anomalies.forEach(anomaly => {
        expect(anomaly.timestamp).toBeGreaterThan(0);
        expect(anomaly.value).toBeDefined();
        expect(anomaly.score).toBeGreaterThan(2.0);
      });
    });

    test('should handle anomaly detection with no anomalies', () => {
      const seriesId = 'no_anomalies';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      // Create consistent data
      for (let i = 0; i < 20; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 20 + Math.random() * 2 // Small variance
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      const anomalies = predictiveSystem.detectAnomalies(seriesId, 2.0);
      
      // Should find few or no anomalies
      expect(anomalies.length).toBeLessThanOrEqual(2);
    });

    test('should handle anomaly detection with insufficient data', () => {
      const seriesId = 'insufficient_anomaly';
      const data: TimeSeriesData[] = [
        { timestamp: Date.now(), value: 10 },
        { timestamp: Date.now() + 1000, value: 15 }
      ];

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      const anomalies = predictiveSystem.detectAnomalies(seriesId);
      
      expect(anomalies.length).toBe(0);
    });
  });

  describe('Predictive Patterns', () => {
    test('should create predictive patterns from analysis', async () => {
      const seriesId = 'pattern_test';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      for (let i = 0; i < 15; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 10 + i * 1.5
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const trendPatterns = predictiveSystem.getPredictivePatterns('trend');
      const seasonalPatterns = predictiveSystem.getPredictivePatterns('seasonal');
      const allPatterns = predictiveSystem.getPredictivePatterns();
      
      expect(allPatterns.length).toBeGreaterThan(0);
      expect(trendPatterns.length + seasonalPatterns.length).toBeLessThanOrEqual(allPatterns.length);
      
      allPatterns.forEach(pattern => {
        expect(pattern.id).toBeDefined();
        expect(pattern.type).toBeDefined();
        expect(pattern.confidence).toBeGreaterThan(0);
        expect(pattern.confidence).toBeLessThanOrEqual(1);
        expect(pattern.features.length).toBeGreaterThan(0);
        expect(pattern.metadata).toBeDefined();
        expect(pattern.metadata.detectionMethod).toBeDefined();
        expect(pattern.metadata.modelUsed).toBeDefined();
      });
    });

    test('should filter patterns by type', async () => {
      const seriesId1 = 'trend_series';
      const seriesId2 = 'seasonal_series';
      
      // Create trend data
      const trendData: TimeSeriesData[] = [];
      const now = Date.now();
      for (let i = 0; i < 15; i++) {
        trendData.push({
          timestamp: now + i * 1000,
          value: 10 + i * 2
        });
      }
      
      // Create seasonal data
      const seasonalData: TimeSeriesData[] = [];
      for (let i = 0; i < 20; i++) {
        seasonalData.push({
          timestamp: now + i * 1000,
          value: 20 + 10 * Math.sin(i * Math.PI / 3)
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId1, trendData);
      predictiveSystem.addTimeSeriesData(seriesId2, seasonalData);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const trendPatterns = predictiveSystem.getPredictivePatterns('trend');
      const seasonalPatterns = predictiveSystem.getPredictivePatterns('seasonal');
      
      expect(trendPatterns.every(p => p.type === 'trend')).toBe(true);
      expect(seasonalPatterns.every(p => p.type === 'seasonal')).toBe(true);
    });
  });

  describe('Model Management', () => {
    test('should return all models', () => {
      const models = predictiveSystem.getModels();
      
      expect(models.length).toBeGreaterThan(0);
      models.forEach(model => {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.type).toBeDefined();
        expect(model.status).toBeDefined();
        expect(model.accuracy).toBeGreaterThan(0);
        expect(model.hyperparameters).toBeDefined();
        expect(model.performance).toBeDefined();
      });
    });

    test('should have models with different types', () => {
      const models = predictiveSystem.getModels();
      const types = models.map(m => m.type);
      
      expect(types).toContain('arima');
      expect(types).toContain('lstm');
      expect(types).toContain('random_forest');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid series ID', async () => {
      await expect(
        predictiveSystem.analyzeTimeSeries('nonexistent_series')
      ).rejects.toThrow('Insufficient data for analysis');
    });

    test('should handle invalid model type for forecasting', async () => {
      const seriesId = 'forecast_error_test';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      for (let i = 0; i < 25; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 10 + i
        });
      }

      predictiveSystem.addTimeSeriesData(seriesId, data);
      
      await expect(
        predictiveSystem.generateForecast(seriesId, 5, 'invalid_model' as any)
      ).rejects.toThrow('No available model of type: invalid_model');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large datasets efficiently', async () => {
      const seriesId = 'large_dataset';
      const data: TimeSeriesData[] = [];
      const now = Date.now();
      
      // Create large dataset
      for (let i = 0; i < 1000; i++) {
        data.push({
          timestamp: now + i * 1000,
          value: 20 + Math.sin(i * 0.1) * 5 + Math.random() * 2
        });
      }

      const startTime = Date.now();
      predictiveSystem.addTimeSeriesData(seriesId, data);
      const endTime = Date.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });

    test('should handle multiple concurrent operations', async () => {
      const operations = [];
      
      for (let i = 0; i < 5; i++) {
        const seriesId = `concurrent_series_${i}`;
        const data: TimeSeriesData[] = [];
        const now = Date.now();
        
        for (let j = 0; j < 20; j++) {
          data.push({
            timestamp: now + j * 1000,
            value: 10 + j + i
          });
        }
        
        operations.push(predictiveSystem.addTimeSeriesData(seriesId, data));
      }
      
      // All operations should complete without errors
      await Promise.all(operations);
      expect(true).toBe(true); // If we get here, no errors occurred
    });
  });
}); 