// Core Tony State Management Interfaces
// Based on ARCHITECTURE.md specifications

export interface TonyState {
  memory: MemoryStore;
  learning: LearningSystem;
  design: DesignSystem;
  ux: UXRepository;
  school: SchoolBench;
  assets: AssetLibrary;
  aiSuggestions: AIDesignSuggestions;
  system: SystemState;
  user: UserState;
}

export interface SystemState {
  status: 'initializing' | 'ready' | 'error' | 'maintenance' | 'inactive' | 'idle' | 'learning' | 'processing';
  version: string;
  lastUpdated: number;
  components: {
    MemoryStore: ComponentStatus;
    LearningSystem: ComponentStatus;
    DesignSystem: ComponentStatus;
    UXRepository: ComponentStatus;
    SchoolBench: ComponentStatus;
    AssetLibrary: ComponentStatus;
    AIDesignSuggestions: ComponentStatus;
  };
}

export interface ComponentStatus {
  status: 'active' | 'inactive' | 'error' | 'initializing';
  lastActivity: number;
}

export interface UserState {
  id: string;
  preferences: Record<string, any>;
  session: UserSession;
}

export interface UserSession {
  startTime: number;
  lastActivity: number;
}

export interface SystemError {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  source: string;
  resolved: boolean;
}

// Memory System
export interface MemoryStore {
  nodes: Map<string, MemoryNode>;
  connections: Map<string, string[]>;
  shortTerm: MemoryNode[];
  longTerm: MemoryNode[];
  lastIndexed: number;
}

export interface MemoryNode {
  id: string;
  type: 'interaction' | 'pattern' | 'knowledge' | 'feedback' | 'design' | 'asset';
  data: any;
  connections: string[];
  metadata: MemoryMetadata;
  createdAt: number;
  lastUpdated: number;
}

export interface MemoryMetadata {
  source: string;
  confidence: number;
  lastUpdated: number;
  tags: string[];
  importance: number; // 0-1 scale
  accessCount: number;
}

// Learning System
export interface LearningSystem {
  patterns: Pattern[];
  feedbackLoops: FeedbackLoop[];
  knowledgeBase: KnowledgeNode[];
  learningAlgorithms: LearningAlgorithm[];
  performance: LearningPerformance;
  patternRecognition: PatternRecognitionEngine;
  feedbackProcessor: FeedbackProcessor;
  knowledgeSharing: KnowledgeSharingSystem;
  learningMetrics: LearningMetrics;
}

export interface Pattern {
  id: string;
  type: string;
  data: any;
  confidence: number;
  occurrences: number;
  lastSeen: number;
  sources: string[];
  features: PatternFeature[];
  similarity: PatternSimilarity[];
  prediction: PatternPrediction;
  validation: PatternValidation;
}

export interface PatternFeature {
  name: string;
  value: any;
  weight: number;
  type: 'numeric' | 'categorical' | 'temporal' | 'spatial';
}

export interface PatternSimilarity {
  patternId: string;
  similarity: number;
  method: 'cosine' | 'euclidean' | 'jaccard' | 'custom';
}

export interface PatternPrediction {
  nextValue?: any;
  confidence: number;
  timeframe: number;
  factors: string[];
}

export interface PatternValidation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  testCases: number;
}

export interface FeedbackLoop {
  id: string;
  type: 'user' | 'system' | 'performance' | 'correction' | 'reinforcement';
  data: any;
  processed: boolean;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  impact: FeedbackImpact;
  action: FeedbackAction;
}

export interface FeedbackImpact {
  learningRate: number;
  confidenceChange: number;
  patternUpdates: string[];
  knowledgeUpdates: string[];
}

export interface FeedbackAction {
  type: 'update_pattern' | 'create_knowledge' | 'adjust_algorithm' | 'retrain' | 'none';
  parameters: any;
  executed: boolean;
  result?: any;
}

export interface KnowledgeNode {
  id: string;
  type: string;
  content: any;
  relationships: string[];
  confidence: number;
  lastUpdated: number;
  sharing: KnowledgeSharing;
  validation: KnowledgeValidation;
  usage: KnowledgeUsage;
}

export interface KnowledgeSharing {
  isPublic: boolean;
  sharedWith: string[];
  accessLevel: 'read' | 'write' | 'admin';
  lastShared: number;
}

export interface KnowledgeValidation {
  verified: boolean;
  verificationMethod: string;
  verifiedBy: string;
  verificationDate: number;
}

export interface KnowledgeUsage {
  accessCount: number;
  lastAccessed: number;
  effectiveness: number;
  userSatisfaction: number;
}

export interface LearningAlgorithm {
  id: string;
  type: 'supervised' | 'unsupervised' | 'reinforcement' | 'deep' | 'ensemble';
  status: 'active' | 'inactive' | 'training' | 'evaluating';
  performance: number;
  lastRun: number;
  configuration: AlgorithmConfig;
  training: TrainingStatus;
  evaluation: AlgorithmEvaluation;
  hyperparameters: Record<string, any>;
}

export interface AlgorithmConfig {
  name: string;
  version: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  requirements: string[];
}

export interface TrainingStatus {
  isTraining: boolean;
  progress: number;
  epochs: number;
  currentEpoch: number;
  loss: number;
  accuracy: number;
  startTime: number;
  estimatedCompletion: number;
}

export interface AlgorithmEvaluation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix?: number[][];
  rocCurve?: Array<{fpr: number, tpr: number}>;
  lastEvaluated: number;
}

export interface LearningPerformance {
  accuracy: number;
  responseTime: number;
  learningRate: number;
  patternRecognitionRate: number;
  overall: PerformanceMetrics;
  byAlgorithm: Record<string, PerformanceMetrics>;
  byPatternType: Record<string, PerformanceMetrics>;
  trends: PerformanceTrend[];
}

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

export interface PerformanceTrend {
  metric: string;
  values: Array<{timestamp: number, value: number}>;
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number;
}

// New interfaces for Step 2.2 enhancements
export interface PatternRecognitionEngine {
  active: boolean;
  methods: PatternRecognitionMethod[];
  thresholds: RecognitionThresholds;
  statistics: RecognitionStatistics;
}

export interface PatternRecognitionMethod {
  name: string;
  type: 'frequency' | 'sequence' | 'similarity' | 'clustering' | 'classification';
  active: boolean;
  accuracy: number;
  lastUsed: number;
}

export interface RecognitionThresholds {
  confidence: number;
  similarity: number;
  frequency: number;
  support: number;
}

export interface RecognitionStatistics {
  patternsDetected: number;
  falsePositives: number;
  falseNegatives: number;
  averageConfidence: number;
  processingTime: number;
}

export interface FeedbackProcessor {
  active: boolean;
  queue: FeedbackQueue;
  processing: ProcessingStatus;
  rules: FeedbackRule[];
}

export interface FeedbackQueue {
  pending: string[];
  processing: string[];
  completed: string[];
  failed: string[];
}

export interface ProcessingStatus {
  isProcessing: boolean;
  currentBatch: number;
  totalProcessed: number;
  averageProcessingTime: number;
}

export interface FeedbackRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
  active: boolean;
}

export interface KnowledgeSharingSystem {
  active: boolean;
  protocols: SharingProtocol[];
  permissions: SharingPermissions;
  statistics: SharingStatistics;
}

export interface SharingProtocol {
  name: string;
  type: 'push' | 'pull' | 'broadcast' | 'request-response';
  active: boolean;
  reliability: number;
}

export interface SharingPermissions {
  readAccess: string[];
  writeAccess: string[];
  adminAccess: string[];
  restrictions: string[];
}

export interface SharingStatistics {
  sharedItems: number;
  receivedItems: number;
  successRate: number;
  averageLatency: number;
}

export interface LearningMetrics {
  overall: LearningMetricsData;
  patterns: PatternMetrics;
  algorithms: AlgorithmMetrics;
  knowledge: KnowledgeMetrics;
  feedback: FeedbackMetrics;
}

export interface LearningMetricsData {
  totalPatterns: number;
  totalKnowledge: number;
  totalFeedback: number;
  learningEfficiency: number;
  adaptationRate: number;
}

export interface PatternMetrics {
  recognitionRate: number;
  accuracy: number;
  falsePositiveRate: number;
  processingTime: number;
  byType: Record<string, number>;
}

export interface AlgorithmMetrics {
  activeAlgorithms: number;
  averagePerformance: number;
  trainingTime: number;
  convergenceRate: number;
  byType: Record<string, number>;
}

export interface KnowledgeMetrics {
  totalNodes: number;
  averageConfidence: number;
  sharingRate: number;
  validationRate: number;
  byType: Record<string, number>;
}

export interface FeedbackMetrics {
  totalFeedback: number;
  processingRate: number;
  averageImpact: number;
  responseTime: number;
  byType: Record<string, number>;
}

// Design System
export interface DesignSystem {
  patterns: DesignPattern[];
  components: DesignComponent[];
  styles: StyleGuide;
  assets: DesignAsset[];
}

export interface DesignPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  usage: string[];
  examples: any[];
  confidence: number;
  lastUsed: number;
}

export interface DesignComponent {
  id: string;
  name: string;
  type: string;
  props: any;
  variants: any[];
  usage: number;
  lastUpdated: number;
}

export interface StyleGuide {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  breakpoints: Breakpoint[];
}

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  neutral: string[];
  semantic: Record<string, string>;
}

export interface Typography {
  fonts: string[];
  sizes: Record<string, string>;
  weights: Record<string, number>;
}

export interface Spacing {
  scale: number[];
  units: string;
}

export interface Breakpoint {
  name: string;
  value: number;
}

export interface DesignAsset {
  id: string;
  type: 'image' | 'icon' | 'animation' | 'sound';
  url: string;
  metadata: AssetMetadata;
  tags: string[];
  usage: number;
}

export interface AssetMetadata {
  size: number;
  format: string;
  dimensions?: { width: number; height: number };
  duration?: number;
}

// UX Repository
export interface UXRepository {
  interactions: UserInteraction[];
  patterns: UXPattern[];
  insights: UXInsight[];
  metrics: UXMetrics;
}

export interface UserInteraction {
  id: string;
  type: string;
  userId: string;
  timestamp: number;
  data: any;
  context: any;
  outcome: 'success' | 'failure' | 'partial';
}

export interface UXPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  successRate: number;
  userSatisfaction: number;
  lastObserved: number;
}

export interface UXInsight {
  id: string;
  type: string;
  description: string;
  confidence: number;
  data: any;
  timestamp: number;
}

export interface UXMetrics {
  engagement: number;
  satisfaction: number;
  efficiency: number;
  errorRate: number;
  completionRate: number;
}

// School Bench
export interface SchoolBench {
  lessons: Lesson[];
  progress: LearningProgress;
  recommendations: Recommendation[];
  assessments: Assessment[];
}

export interface Lesson {
  id: string;
  title: string;
  content: any;
  difficulty: number;
  prerequisites: string[];
  outcomes: string[];
  completed: boolean;
  score?: number;
}

export interface LearningProgress {
  completedLessons: string[];
  currentLesson?: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  lastActivity: number;
}

export interface Recommendation {
  id: string;
  type: 'lesson' | 'practice' | 'review';
  content: any;
  priority: number;
  reason: string;
  timestamp: number;
}

export interface Assessment {
  id: string;
  type: string;
  questions: any[];
  score: number;
  completed: boolean;
  timestamp: number;
}

// Asset Library
export interface AssetLibrary {
  assets: Asset[];
  categories: Category[];
  tags: Tag[];
  collections: Collection[];
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  metadata: AssetMetadata;
  tags: string[];
  category: string;
  collection?: string;
  usage: number;
  rating: number;
  createdAt: number;
  lastUpdated: number;
}

export type AssetType = 'image' | 'icon' | 'animation' | 'sound' | 'video' | 'document' | 'template';

export interface Category {
  id: string;
  name: string;
  description: string;
  parentCategory?: string;
  assetCount: number;
}

export interface Tag {
  id: string;
  name: string;
  usage: number;
  relatedTags: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  assets: string[];
  isPublic: boolean;
  createdAt: number;
  lastUpdated: number;
}

// Event System
export interface TonyEvent {
  type: string;
  source: string;
  data: any;
  timestamp: number;
  context: any;
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventHandler {
  (event: TonyEvent): void | Promise<void>;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  active: boolean;
}

// Utility Types
export type ComponentId = string;
export type UserId = string;
export type SessionId = string;

export interface TonyConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
  limits: {
    maxMemoryNodes: number;
    maxConnections: number;
    maxEvents: number;
  };
}

// AI Design Suggestions System
export interface AIDesignSuggestions {
  suggestions: DesignSuggestion[];
  contextAnalysis: ContextAnalysis[];
  suggestionEngine: SuggestionEngine;
  recommendationHistory: RecommendationHistory[];
  performance: SuggestionPerformance;
  configuration: SuggestionConfig;
}

export interface DesignSuggestion {
  id: string;
  type: 'pattern' | 'component' | 'layout' | 'style' | 'interaction' | 'asset' | 'best_practice';
  title: string;
  description: string;
  content: any;
  confidence: number;
  relevance: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: SuggestionContext;
  sources: string[];
  reasoning: string[];
  alternatives: string[];
  implementation: ImplementationGuide;
  feedback: SuggestionFeedback[];
  createdAt: number;
  lastUpdated: number;
}

export interface SuggestionContext {
  userContext: UserContext;
  designContext: DesignContext;
  interactionContext: InteractionContext;
  learningContext: LearningContext;
  constraints: DesignConstraints;
}

export interface UserContext {
  userId: string;
  preferences: Record<string, any>;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  projectType: string;
  goals: string[];
  constraints: string[];
}

export interface DesignContext {
  currentDesign: any;
  designSystem: any;
  availableAssets: string[];
  designPatterns: string[];
  styleGuide: any;
  platform: 'web' | 'mobile' | 'desktop' | 'tablet';
  deviceType: string;
}

export interface InteractionContext {
  userInteractions: any[];
  interactionPatterns: any[];
  userBehavior: any;
  painPoints: string[];
  successMetrics: any;
}

export interface LearningContext {
  learnedPatterns: any[];
  knowledgeBase: any[];
  userProgress: any;
  strengths: string[];
  weaknesses: string[];
}

export interface DesignConstraints {
  technical: string[];
  business: string[];
  accessibility: string[];
  performance: string[];
  budget: string[];
  timeline: string[];
}

export interface ImplementationGuide {
  steps: ImplementationStep[];
  codeExamples: CodeExample[];
  resources: Resource[];
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[];
}

export interface ImplementationStep {
  order: number;
  title: string;
  description: string;
  code?: string;
  tips: string[];
}

export interface CodeExample {
  language: string;
  code: string;
  description: string;
  framework?: string;
}

export interface Resource {
  type: 'documentation' | 'tutorial' | 'example' | 'tool';
  title: string;
  url: string;
  description: string;
}

export interface SuggestionFeedback {
  userId: string;
  rating: number;
  comment?: string;
  implemented: boolean;
  effectiveness: number;
  timestamp: number;
}

export interface ContextAnalysis {
  id: string;
  contextType: 'user' | 'design' | 'interaction' | 'learning' | 'constraints';
  analysis: any;
  insights: string[];
  confidence: number;
  timestamp: number;
}

export interface SuggestionEngine {
  active: boolean;
  algorithms: SuggestionAlgorithm[];
  thresholds: SuggestionThresholds;
  statistics: SuggestionStatistics;
  configuration: EngineConfig;
}

export interface SuggestionAlgorithm {
  id: string;
  name: string;
  type: 'pattern_matching' | 'collaborative_filtering' | 'content_based' | 'hybrid' | 'contextual';
  active: boolean;
  accuracy: number;
  performance: number;
  lastUsed: number;
  configuration: any;
}

export interface SuggestionThresholds {
  confidence: number;
  relevance: number;
  similarity: number;
  frequency: number;
  recency: number;
}

export interface SuggestionStatistics {
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  suggestionsRejected: number;
  averageConfidence: number;
  averageRelevance: number;
  processingTime: number;
  byType: Record<string, number>;
  byAlgorithm: Record<string, number>;
}

export interface EngineConfig {
  maxSuggestions: number;
  suggestionLifetime: number;
  updateInterval: number;
  learningEnabled: boolean;
  contextWeight: number;
  patternWeight: number;
  userPreferenceWeight: number;
}

export interface RecommendationHistory {
  id: string;
  suggestionId: string;
  userId: string;
  action: 'accepted' | 'rejected' | 'modified' | 'implemented';
  feedback?: SuggestionFeedback;
  timestamp: number;
  context: any;
}

export interface SuggestionPerformance {
  overall: PerformanceMetrics;
  byType: Record<string, PerformanceMetrics>;
  byAlgorithm: Record<string, PerformanceMetrics>;
  trends: PerformanceTrend[];
  userSatisfaction: number;
  implementationRate: number;
  effectivenessRate: number;
}

export interface SuggestionConfig {
  enabled: boolean;
  autoSuggest: boolean;
  suggestionLimit: number;
  confidenceThreshold: number;
  relevanceThreshold: number;
  learningRate: number;
  contextSensitivity: number;
  personalizationLevel: 'low' | 'medium' | 'high';
} 