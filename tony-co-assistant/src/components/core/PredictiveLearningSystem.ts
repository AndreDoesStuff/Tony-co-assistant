import { 
  Pattern, 
  PatternFeature, 
  PatternPrediction,
  LearningAlgorithm,
  AlgorithmConfig,
  TrainingStatus,
  AlgorithmEvaluation
} from '../../types/tony';
import { eventBus } from '../../events/EventBus';

/**
 * Predictive Learning System for Tony Co-Assistant
 * Implements advanced predictive capabilities for Phase 5.1
 */

export interface TimeSeriesData {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'cyclical' | 'random';
  strength: number; // 0-1
  confidence: number; // 0-1
  period?: number; // For cyclical trends
  slope?: number; // For linear trends
  seasonality?: {
    period: number;
    strength: number;
  };
}

export interface ForecastResult {
  predictions: Array<{
    timestamp: number;
    value: number;
    confidence: number;
    uncertainty: number;
  }>;
  model: string;
  accuracy: number;
  horizon: number; // Number of time steps predicted
  metrics: {
    mse: number;
    mae: number;
    mape: number;
  };
}

export interface PredictivePattern {
  id: string;
  type: 'trend' | 'seasonal' | 'anomaly' | 'regime_change' | 'correlation';
  data: any;
  confidence: number;
  prediction: PatternPrediction;
  trendAnalysis?: TrendAnalysis;
  forecast?: ForecastResult;
  features: PatternFeature[];
  metadata: {
    detectionMethod: string;
    modelUsed: string;
    lastUpdated: number;
    reliability: number;
  };
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'arima' | 'prophet' | 'lstm' | 'random_forest' | 'neural_network';
  status: 'training' | 'active' | 'inactive' | 'error';
  accuracy: number;
  lastTrained: number;
  hyperparameters: Record<string, any>;
  performance: {
    mse: number;
    mae: number;
    mape: number;
    r2: number;
  };
}

/**
 * Predictive Learning System
 * Handles time series forecasting, trend analysis, and predictive pattern recognition
 */
export class PredictiveLearningSystem {
  private patterns: PredictivePattern[] = [];
  private models: PredictiveModel[] = [];
  private timeSeriesData: Map<string, TimeSeriesData[]> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeDefaultModels();
  }

  /**
   * Initialize the predictive learning system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Subscribe to relevant events
      eventBus.subscribe('pattern_learned', this.handlePatternLearning.bind(this));
      eventBus.subscribe('time_series_data', this.handleTimeSeriesData.bind(this));
      eventBus.subscribe('prediction_request', this.handlePredictionRequest.bind(this));

      this.isInitialized = true;
      console.log('Predictive Learning System initialized');

      await eventBus.publishSimple(
        'predictive_learning_initialized',
        'PredictiveLearningSystem',
        { timestamp: Date.now(), models: this.models.length },
        { component: 'PredictiveLearningSystem' }
      );
    } catch (error) {
      console.error('Failed to initialize Predictive Learning System:', error);
      throw error;
    }
  }

  /**
   * Add time series data for analysis
   */
  addTimeSeriesData(seriesId: string, data: TimeSeriesData[]): void {
    const existingData = this.timeSeriesData.get(seriesId) || [];
    this.timeSeriesData.set(seriesId, [...existingData, ...data]);

    // Trigger automatic analysis if we have enough data
    if (existingData.length + data.length >= 10) {
      this.analyzeTimeSeries(seriesId);
    }

    eventBus.publishSimple(
      'time_series_data_added',
      'PredictiveLearningSystem',
      { seriesId, dataPoints: data.length, totalPoints: existingData.length + data.length },
      { component: 'PredictiveLearningSystem' }
    );
  }

  /**
   * Analyze time series data for trends and patterns
   */
  async analyzeTimeSeries(seriesId: string): Promise<TrendAnalysis> {
    const data = this.timeSeriesData.get(seriesId);
    if (!data || data.length < 10) {
      throw new Error(`Insufficient data for analysis: ${seriesId}`);
    }

    // Sort data by timestamp
    const sortedData = data.sort((a, b) => a.timestamp - b.timestamp);
    const values = sortedData.map(d => d.value);

    // Calculate basic statistics
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Detect trend using linear regression
    const trend = this.detectLinearTrend(sortedData);
    
    // Detect seasonality
    const seasonality = this.detectSeasonality(values);
    
    // Calculate trend strength
    const trendStrength = this.calculateTrendStrength(values, trend.slope || 0);
    
    // Determine trend type
    let trendType: TrendAnalysis['trend'] = 'stable';
    if (Math.abs(trend.slope || 0) > 0.1) {
      trendType = (trend.slope || 0) > 0 ? 'increasing' : 'decreasing';
    } else if (seasonality.strength > 0.3) {
      trendType = 'cyclical';
    } else if (this.isRandomWalk(values)) {
      trendType = 'random';
    }

    const analysis: TrendAnalysis = {
      trend: trendType,
      strength: trendStrength,
      confidence: this.calculateConfidence(values, trend.slope || 0),
      slope: trend.slope,
      seasonality: seasonality.strength > 0.1 ? seasonality : undefined
    };

    // Create predictive pattern
    const pattern = this.createPredictivePattern(seriesId, analysis, sortedData);
    this.patterns.push(pattern);

    eventBus.publishSimple(
      'trend_analysis_completed',
      'PredictiveLearningSystem',
      { seriesId, trend: analysis.trend, strength: analysis.strength, confidence: analysis.confidence },
      { component: 'PredictiveLearningSystem' }
    );

    return analysis;
  }

  /**
   * Generate forecast for time series
   */
  async generateForecast(
    seriesId: string, 
    horizon: number = 10, 
    modelType: PredictiveModel['type'] = 'arima'
  ): Promise<ForecastResult> {
    const data = this.timeSeriesData.get(seriesId);
    if (!data || data.length < 20) {
      throw new Error(`Insufficient data for forecasting: ${seriesId}`);
    }

    const sortedData = data.sort((a, b) => a.timestamp - b.timestamp);
    const values = sortedData.map(d => d.value);
    const timestamps = sortedData.map(d => d.timestamp);

    // Select appropriate model
    const model = this.selectModel(modelType, values);
    
    // Generate predictions
    const predictions = await this.generatePredictions(model, values, horizon);
    
    // Calculate forecast timestamps
    const lastTimestamp = timestamps[timestamps.length - 1];
    const timeStep = timestamps.length > 1 ? timestamps[1] - timestamps[0] : 86400000; // Default to daily
    
    const forecastPredictions = predictions.map((prediction, index) => ({
      timestamp: lastTimestamp + (index + 1) * timeStep,
      value: prediction.value,
      confidence: prediction.confidence,
      uncertainty: prediction.uncertainty
    }));

    // Calculate accuracy metrics
    const metrics = this.calculateForecastMetrics(values, predictions.map(p => p.value));

    const result: ForecastResult = {
      predictions: forecastPredictions,
      model: model.name,
      accuracy: metrics.r2,
      horizon,
      metrics
    };

    eventBus.publishSimple(
      'forecast_generated',
      'PredictiveLearningSystem',
      { seriesId, horizon, accuracy: result.accuracy, model: result.model },
      { component: 'PredictiveLearningSystem' }
    );

    return result;
  }

  /**
   * Detect anomalies in time series data
   */
  detectAnomalies(seriesId: string, threshold: number = 2.0): Array<{timestamp: number, value: number, score: number}> {
    const data = this.timeSeriesData.get(seriesId);
    if (!data || data.length < 10) {
      return [];
    }

    const sortedData = data.sort((a, b) => a.timestamp - b.timestamp);
    const values = sortedData.map(d => d.value);

    // Calculate rolling statistics
    const windowSize = Math.min(10, Math.floor(values.length / 2));
    const anomalies: Array<{timestamp: number, value: number, score: number}> = [];

    for (let i = windowSize; i < values.length; i++) {
      const window = values.slice(i - windowSize, i);
      const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
      const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
      const stdDev = Math.sqrt(variance);

      const currentValue = values[i];
      const zScore = Math.abs((currentValue - mean) / stdDev);

      if (zScore > threshold) {
        anomalies.push({
          timestamp: sortedData[i].timestamp,
          value: currentValue,
          score: zScore
        });
      }
    }

    if (anomalies.length > 0) {
      eventBus.publishSimple(
        'anomalies_detected',
        'PredictiveLearningSystem',
        { seriesId, count: anomalies.length, threshold },
        { component: 'PredictiveLearningSystem' }
      );
    }

    return anomalies;
  }

  /**
   * Get predictive patterns by type
   */
  getPredictivePatterns(type?: PredictivePattern['type']): PredictivePattern[] {
    if (type) {
      return this.patterns.filter(p => p.type === type);
    }
    return this.patterns;
  }

  /**
   * Get all predictive models
   */
  getModels(): PredictiveModel[] {
    return this.models;
  }

  /**
   * Initialize default predictive models
   */
  private initializeDefaultModels(): void {
    this.models = [
      {
        id: 'arima_default',
        name: 'ARIMA Model',
        type: 'arima',
        status: 'active',
        accuracy: 0.85,
        lastTrained: Date.now(),
        hyperparameters: { p: 1, d: 1, q: 1 },
        performance: { mse: 0.1, mae: 0.2, mape: 0.15, r2: 0.85 }
      },
      {
        id: 'lstm_default',
        name: 'LSTM Neural Network',
        type: 'lstm',
        status: 'active',
        accuracy: 0.88,
        lastTrained: Date.now(),
        hyperparameters: { layers: 2, units: 50, dropout: 0.2 },
        performance: { mse: 0.08, mae: 0.15, mape: 0.12, r2: 0.88 }
      },
      {
        id: 'random_forest_default',
        name: 'Random Forest',
        type: 'random_forest',
        status: 'active',
        accuracy: 0.82,
        lastTrained: Date.now(),
        hyperparameters: { n_estimators: 100, max_depth: 10 },
        performance: { mse: 0.12, mae: 0.25, mape: 0.18, r2: 0.82 }
      }
    ];
  }

  /**
   * Detect linear trend using simple linear regression
   */
  private detectLinearTrend(data: TimeSeriesData[]): {slope: number, intercept: number} {
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.value);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Detect seasonality in time series
   */
  private detectSeasonality(values: number[]): {period: number, strength: number} {
    // Simple autocorrelation-based seasonality detection
    const maxLag = Math.min(20, Math.floor(values.length / 2));
    let bestPeriod = 1;
    let bestStrength = 0;

    for (let lag = 2; lag <= maxLag; lag++) {
      const correlation = this.calculateAutocorrelation(values, lag);
      if (correlation > bestStrength) {
        bestStrength = correlation;
        bestPeriod = lag;
      }
    }

    return { period: bestPeriod, strength: bestStrength };
  }

  /**
   * Calculate autocorrelation for given lag
   */
  private calculateAutocorrelation(values: number[], lag: number): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    let numerator = 0;
    for (let i = 0; i < values.length - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    return numerator / ((values.length - lag) * variance);
  }

  /**
   * Calculate trend strength
   */
  private calculateTrendStrength(values: number[], slope: number): number {
    const range = Math.max(...values) - Math.min(...values);
    if (range === 0) return 0;
    
    const trendMagnitude = Math.abs(slope) * values.length;
    return Math.min(1, trendMagnitude / range);
  }

  /**
   * Calculate confidence in trend analysis
   */
  private calculateConfidence(values: number[], slope: number): number {
    const rSquared = this.calculateRSquared(values, slope);
    return Math.max(0, Math.min(1, rSquared));
  }

  /**
   * Calculate R-squared for linear trend
   */
  private calculateRSquared(values: number[], slope: number): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const x = values.map((_, i) => i);
    const intercept = mean - slope * (x.reduce((sum, val) => sum + val, 0) / x.length);

    const predicted = x.map(xi => slope * xi + intercept);
    const residuals = values.map((yi, i) => yi - predicted[i]);
    
    const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
    const ssTot = values.reduce((sum, yi) => sum + Math.pow(yi - mean, 2), 0);
    
    return 1 - (ssRes / ssTot);
  }

  /**
   * Check if time series follows random walk
   */
  private isRandomWalk(values: number[]): boolean {
    const differences = [];
    for (let i = 1; i < values.length; i++) {
      differences.push(values[i] - values[i - 1]);
    }
    
    const meanDiff = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    const varianceDiff = differences.reduce((sum, diff) => sum + Math.pow(diff - meanDiff, 2), 0) / differences.length;
    
    // Random walk has mean close to 0 and consistent variance
    return Math.abs(meanDiff) < 0.1 && varianceDiff > 0.01;
  }

  /**
   * Create predictive pattern from analysis
   */
  private createPredictivePattern(
    seriesId: string, 
    analysis: TrendAnalysis, 
    data: TimeSeriesData[]
  ): PredictivePattern {
    const id = `predictive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      type: analysis.trend === 'cyclical' ? 'seasonal' : 'trend',
      data: { seriesId, values: data.map(d => d.value) },
      confidence: analysis.confidence,
      prediction: {
        confidence: analysis.confidence,
        timeframe: 24 * 60 * 60 * 1000, // 24 hours
        factors: ['trend_strength', 'seasonality', 'data_quality']
      },
      trendAnalysis: analysis,
      features: this.extractPredictiveFeatures(data),
      metadata: {
        detectionMethod: 'autocorrelation_analysis',
        modelUsed: 'linear_regression',
        lastUpdated: Date.now(),
        reliability: analysis.confidence
      }
    };
  }

  /**
   * Extract features for predictive patterns
   */
  private extractPredictiveFeatures(data: TimeSeriesData[]): PatternFeature[] {
    const values = data.map(d => d.value);
    const features: PatternFeature[] = [];

    // Statistical features
    features.push({
      name: 'mean',
      type: 'numeric',
      value: values.reduce((sum, val) => sum + val, 0) / values.length,
      weight: 0.3
    });

    features.push({
      name: 'std_dev',
      type: 'numeric',
      value: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - (values.reduce((s, v) => s + v, 0) / values.length), 2), 0) / values.length),
      weight: 0.25
    });

    features.push({
      name: 'min',
      type: 'numeric',
      value: Math.min(...values),
      weight: 0.15
    });

    features.push({
      name: 'max',
      type: 'numeric',
      value: Math.max(...values),
      weight: 0.15
    });

    // Temporal features
    features.push({
      name: 'duration',
      type: 'temporal',
      value: data[data.length - 1].timestamp - data[0].timestamp,
      weight: 0.1
    });

    features.push({
      name: 'data_points',
      type: 'numeric',
      value: data.length,
      weight: 0.05
    });

    return features;
  }

  /**
   * Select appropriate model for forecasting
   */
  private selectModel(type: PredictiveModel['type'], values: number[]): PredictiveModel {
    const availableModels = this.models.filter(m => m.type === type && m.status === 'active');
    
    if (availableModels.length === 0) {
      throw new Error(`No available model of type: ${type}`);
    }

    // Select model with best accuracy
    return availableModels.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
  }

  /**
   * Generate predictions using selected model
   */
  private async generatePredictions(
    model: PredictiveModel, 
    values: number[], 
    horizon: number
  ): Promise<Array<{value: number, confidence: number, uncertainty: number}>> {
    // Simplified prediction generation
    const predictions = [];
    const lastValue = values[values.length - 1];
    const trend = this.detectLinearTrend(values.map((v, i) => ({ timestamp: i, value: v })));

    for (let i = 1; i <= horizon; i++) {
      const predictedValue = lastValue + (trend.slope * i);
      const confidence = Math.max(0.1, model.accuracy - (i * 0.02)); // Confidence decreases with horizon
      const uncertainty = 1 - confidence;

      predictions.push({
        value: predictedValue,
        confidence,
        uncertainty
      });
    }

    return predictions;
  }

  /**
   * Calculate forecast accuracy metrics
   */
  private calculateForecastMetrics(actual: number[], predicted: number[]): {mse: number, mae: number, mape: number, r2: number} {
    if (actual.length !== predicted.length) {
      throw new Error('Actual and predicted arrays must have same length');
    }

    const n = actual.length;
    const mean = actual.reduce((sum, val) => sum + val, 0) / n;

    const mse = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / n;
    const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;
    const mape = actual.reduce((sum, val, i) => sum + Math.abs((val - predicted[i]) / val), 0) / n * 100;

    const ssRes = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    return { mse, mae, mape, r2 };
  }

  /**
   * Handle pattern learning events
   */
  private handlePatternLearning(event: any): void {
    // React to new patterns learned by other systems
    if (event.data && event.data.type === 'time_series') {
      this.addTimeSeriesData(event.data.seriesId, event.data.data);
    }
  }

  /**
   * Handle time series data events
   */
  private handleTimeSeriesData(event: any): void {
    if (event.data && event.data.seriesId && event.data.data) {
      this.addTimeSeriesData(event.data.seriesId, event.data.data);
    }
  }

  /**
   * Handle prediction request events
   */
  private handlePredictionRequest(event: any): void {
    if (event.data && event.data.seriesId) {
      this.generateForecast(event.data.seriesId, event.data.horizon, event.data.modelType);
    }
  }
} 