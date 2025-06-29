import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Option,
  Badge,
  ProgressBar,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Tab,
  TabList,
  TabValue,
  Text,
  Title3,
  Subtitle2,
  Caption1,
  Spinner,
  Switch,
  Slider,
  Label
} from '@fluentui/react-components';
import { 
  SearchRegular, 
  AddRegular, 
  DeleteRegular, 
  EditRegular,
  BrainRegular,
  LightbulbRegular,
  DataTrendingRegular,
  SettingsRegular,
  ArrowClockwiseRegular,
  FilterRegular,
  MoreHorizontalRegular,
  RocketRegular,
  TargetRegular,
  TimerRegular
} from '@fluentui/react-icons';
import { AdvancedLearning } from './advanced/AdvancedLearning';

interface AdvancedLearningUIProps {
  advancedLearning?: AdvancedLearning;
}

interface AdvancedPatternResult {
  patternId: string;
  confidence: number;
  complexity: number;
  novelty: number;
  predictivePower: number;
  features: PatternFeature[];
  relationships: PatternRelationship[];
  evolution: PatternEvolution;
}

interface PatternFeature {
  name: string;
  value: any;
  importance: number;
  type: 'numeric' | 'categorical' | 'temporal' | 'spatial' | 'semantic';
}

interface PatternRelationship {
  targetPatternId: string;
  relationshipType: 'similar' | 'opposite' | 'causal' | 'temporal' | 'hierarchical';
  strength: number;
  confidence: number;
}

interface PatternEvolution {
  version: number;
  changes: PatternChange[];
  stability: number;
  trend: 'improving' | 'declining' | 'stable' | 'emerging';
}

interface PatternChange {
  type: 'feature_addition' | 'feature_removal' | 'confidence_change' | 'relationship_change';
  description: string;
  impact: number;
  timestamp: number;
}

interface Prediction {
  id: string;
  target: string;
  value: any;
  confidence: number;
  timeframe: number;
  factors: string[];
  timestamp: number;
}

interface TransferKnowledge {
  sourceComponent: string;
  targetComponent: string;
  knowledgeType: 'pattern' | 'algorithm' | 'heuristic' | 'model';
  content: any;
  similarity: number;
  effectiveness: number;
  transferDate: number;
}

export const AdvancedLearningUI: React.FC<AdvancedLearningUIProps> = ({ advancedLearning }) => {
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patterns, setPatterns] = useState<AdvancedPatternResult[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [transferKnowledge, setTransferKnowledge] = useState<TransferKnowledge[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedPattern, setSelectedPattern] = useState<AdvancedPatternResult | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [learningRate, setLearningRate] = useState(0.1);
  const [explorationRate, setExplorationRate] = useState(0.1);
  const [predictionHorizon, setPredictionHorizon] = useState(7);

  useEffect(() => {
    if (advancedLearning) {
      loadLearningData();
      if (autoRefresh) {
        const interval = setInterval(loadLearningData, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [advancedLearning, autoRefresh]);

  const loadLearningData = async () => {
    if (!advancedLearning) return;
    
    setIsLoading(true);
    try {
      const allPatterns = advancedLearning.getAdvancedPatterns();
      const allPredictions = advancedLearning.getPredictiveModels();
      const stats = advancedLearning.getStats();
      
      setPatterns(allPatterns);
      setPredictions(allPredictions.map(model => model.predictions).flat());
      setStats(stats);
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatternDiscovery = async () => {
    if (!advancedLearning || !searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const newPatterns = await advancedLearning.discoverAdvancedPattern(
        [{ query: searchQuery, timestamp: Date.now() }],
        { context: 'user_query' }
      );
      setPatterns(prev => [...prev, ...newPatterns]);
    } catch (error) {
      console.error('Error discovering patterns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakePrediction = async () => {
    if (!advancedLearning || !searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const prediction = await advancedLearning.makePrediction(
        searchQuery,
        { query: searchQuery },
        predictionHorizon
      );
      if (prediction) {
        setPredictions(prev => [prediction, ...prev]);
      }
    } catch (error) {
      console.error('Error making prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPatternTrendColor = (trend: string) => {
    const colors: Record<string, 'filled' | 'tint' | 'outline' | 'ghost'> = {
      improving: 'filled',
      stable: 'tint',
      declining: 'outline',
      emerging: 'ghost'
    };
    return colors[trend] || 'filled';
  };

  const getKnowledgeTypeColor = (type: string) => {
    const colors: Record<string, 'filled' | 'tint' | 'outline' | 'ghost'> = {
      pattern: 'filled',
      algorithm: 'tint',
      heuristic: 'outline',
      model: 'ghost'
    };
    return colors[type] || 'filled';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderLearningStats = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      <Card>
        <CardHeader header={<Title3>Reinforcement Learning</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Total Episodes</Text>
              <Badge appearance="filled">{stats?.reinforcementLearning?.totalEpisodes || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Average Reward</Text>
              <Badge appearance="filled">{Math.round((stats?.reinforcementLearning?.averageReward || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Exploration Rate</Text>
              <Badge appearance="filled">{Math.round((stats?.reinforcementLearning?.explorationRate || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Policy Updates</Text>
              <Badge appearance="filled">{stats?.reinforcementLearning?.policyUpdates || 0}</Badge>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader header={<Title3>Transfer Learning</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Total Transfers</Text>
              <Badge appearance="filled">{stats?.transferLearning?.totalTransfers || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Success Rate</Text>
              <Badge appearance="filled">{Math.round((stats?.transferLearning?.successRate || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Average Effectiveness</Text>
              <Badge appearance="filled">{Math.round((stats?.transferLearning?.averageEffectiveness || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Cross-Component</Text>
              <Badge appearance="filled">{stats?.transferLearning?.crossComponentTransfers || 0}</Badge>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader header={<Title3>Pattern Recognition</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Patterns Discovered</Text>
              <Badge appearance="filled">{stats?.patternRecognition?.patternsDiscovered || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Average Confidence</Text>
              <Badge appearance="filled">{Math.round((stats?.patternRecognition?.averageConfidence || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Novelty Score</Text>
              <Badge appearance="filled">{Math.round((stats?.patternRecognition?.noveltyScore || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Complexity Distribution</Text>
              <Badge appearance="filled">{stats?.patternRecognition?.complexityDistribution?.length || 0}</Badge>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader header={<Title3>Predictive Capabilities</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Total Predictions</Text>
              <Badge appearance="filled">{stats?.predictiveCapabilities?.totalPredictions || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Accuracy</Text>
              <Badge appearance="filled">{Math.round((stats?.predictiveCapabilities?.accuracy || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Average Confidence</Text>
              <Badge appearance="filled">{Math.round((stats?.predictiveCapabilities?.averageConfidence || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Prediction Horizon</Text>
              <Badge appearance="filled">{stats?.predictiveCapabilities?.predictionHorizon || 0} days</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPatternDetails = (pattern: AdvancedPatternResult) => (
    <Card>
      <CardHeader
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge appearance={getPatternTrendColor(pattern.evolution.trend)}>{pattern.evolution.trend}</Badge>
            <Title3>Pattern {pattern.patternId}</Title3>
          </div>
        }
        action={
          <Button
            appearance="subtle"
            icon={<EditRegular />}
            onClick={() => console.log('Edit pattern:', pattern.patternId)}
          />
        }
      />
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <Subtitle2>Confidence</Subtitle2>
            <ProgressBar value={pattern.confidence} />
            <Caption1>{Math.round(pattern.confidence * 100)}%</Caption1>
          </div>
          <div>
            <Subtitle2>Complexity</Subtitle2>
            <ProgressBar value={pattern.complexity} />
            <Caption1>{Math.round(pattern.complexity * 100)}%</Caption1>
          </div>
          <div>
            <Subtitle2>Novelty</Subtitle2>
            <ProgressBar value={pattern.novelty} />
            <Caption1>{Math.round(pattern.novelty * 100)}%</Caption1>
          </div>
          <div>
            <Subtitle2>Predictive Power</Subtitle2>
            <ProgressBar value={pattern.predictivePower} />
            <Caption1>{Math.round(pattern.predictivePower * 100)}%</Caption1>
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Features ({pattern.features.length})</Subtitle2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {pattern.features.map((feature, index) => (
              <Badge key={index} appearance="outline">
                {feature.name} ({feature.type})
              </Badge>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Relationships ({pattern.relationships.length})</Subtitle2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {pattern.relationships.map((rel, index) => (
              <Badge key={index} appearance="tint">
                {rel.relationshipType} → {rel.targetPatternId}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <Subtitle2>Evolution (v{pattern.evolution.version})</Subtitle2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <Caption1>Stability: {Math.round(pattern.evolution.stability * 100)}%</Caption1>
            <Caption1>Changes: {pattern.evolution.changes.length}</Caption1>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderPatternsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Pattern ID</TableHeaderCell>
          <TableHeaderCell>Trend</TableHeaderCell>
          <TableHeaderCell>Confidence</TableHeaderCell>
          <TableHeaderCell>Complexity</TableHeaderCell>
          <TableHeaderCell>Novelty</TableHeaderCell>
          <TableHeaderCell>Predictive Power</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patterns.map((pattern) => (
          <TableRow key={pattern.patternId} onClick={() => setSelectedPattern(pattern)}>
            <TableCell>
              <Text weight="semibold">{pattern.patternId}</Text>
            </TableCell>
            <TableCell>
              <Badge appearance={getPatternTrendColor(pattern.evolution.trend)}>
                {pattern.evolution.trend}
              </Badge>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProgressBar value={pattern.confidence} style={{ width: '60px' }} />
                <Text>{Math.round(pattern.confidence * 100)}%</Text>
              </div>
            </TableCell>
            <TableCell>
              <ProgressBar value={pattern.complexity} style={{ width: '60px' }} />
            </TableCell>
            <TableCell>
              <ProgressBar value={pattern.novelty} style={{ width: '60px' }} />
            </TableCell>
            <TableCell>
              <ProgressBar value={pattern.predictivePower} style={{ width: '60px' }} />
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button size="small" appearance="subtle" icon={<EditRegular />} />
                <Button size="small" appearance="subtle" icon={<DeleteRegular />} />
                <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderPredictionsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Target</TableHeaderCell>
          <TableHeaderCell>Value</TableHeaderCell>
          <TableHeaderCell>Confidence</TableHeaderCell>
          <TableHeaderCell>Timeframe</TableHeaderCell>
          <TableHeaderCell>Factors</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {predictions.map((prediction) => (
          <TableRow key={prediction.id}>
            <TableCell>
              <Text weight="semibold">{prediction.target}</Text>
            </TableCell>
            <TableCell>
              <Text>{JSON.stringify(prediction.value)}</Text>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProgressBar value={prediction.confidence} style={{ width: '60px' }} />
                <Text>{Math.round(prediction.confidence * 100)}%</Text>
              </div>
            </TableCell>
            <TableCell>
              <Badge appearance="filled">{prediction.timeframe} days</Badge>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {prediction.factors.slice(0, 3).map((factor, index) => (
                  <Badge key={index} appearance="outline" size="small">{factor}</Badge>
                ))}
                {prediction.factors.length > 3 && (
                  <Badge appearance="ghost" size="small">+{prediction.factors.length - 3}</Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Text>{formatTimestamp(prediction.timestamp)}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderTransferKnowledgeTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Source</TableHeaderCell>
          <TableHeaderCell>Target</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Similarity</TableHeaderCell>
          <TableHeaderCell>Effectiveness</TableHeaderCell>
          <TableHeaderCell>Transfer Date</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transferKnowledge.map((transfer) => (
          <TableRow key={`${transfer.sourceComponent}-${transfer.targetComponent}-${transfer.transferDate}`}>
            <TableCell>
              <Text weight="semibold">{transfer.sourceComponent}</Text>
            </TableCell>
            <TableCell>
              <Text weight="semibold">{transfer.targetComponent}</Text>
            </TableCell>
            <TableCell>
              <Badge appearance={getKnowledgeTypeColor(transfer.knowledgeType)}>
                {transfer.knowledgeType}
              </Badge>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProgressBar value={transfer.similarity} style={{ width: '60px' }} />
                <Text>{Math.round(transfer.similarity * 100)}%</Text>
              </div>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProgressBar value={transfer.effectiveness} style={{ width: '60px' }} />
                <Text>{Math.round(transfer.effectiveness * 100)}%</Text>
              </div>
            </TableCell>
            <TableCell>
              <Text>{formatTimestamp(transfer.transferDate)}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <BrainRegular style={{ fontSize: '24px' }} />
          <Title3>Advanced Learning</Title3>
          <Button
            appearance="subtle"
            icon={<ArrowClockwiseRegular />}
            onClick={loadLearningData}
            disabled={isLoading}
          />
          <Switch
            checked={autoRefresh}
            onChange={(e, data) => setAutoRefresh(data.checked)}
            label="Auto Refresh"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Input
            placeholder="Enter data for pattern discovery or prediction..."
            value={searchQuery}
            onChange={(e, data) => setSearchQuery(data.value)}
            style={{ minWidth: '300px' }}
          />
          <Button
            appearance="primary"
            icon={<LightbulbRegular />}
            onClick={handlePatternDiscovery}
            disabled={isLoading}
          >
            Discover Patterns
          </Button>
          <Button
            appearance="outline"
            icon={<TargetRegular />}
            onClick={handleMakePrediction}
            disabled={isLoading}
          >
            Make Prediction
          </Button>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Label>Learning Rate:</Label>
            <Slider
              value={learningRate}
              onChange={(e, data) => setLearningRate(data.value)}
              min={0.01}
              max={0.5}
              step={0.01}
              style={{ width: '100px' }}
            />
            <Text>{Math.round(learningRate * 100)}%</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Label>Exploration Rate:</Label>
            <Slider
              value={explorationRate}
              onChange={(e, data) => setExplorationRate(data.value)}
              min={0.01}
              max={0.5}
              step={0.01}
              style={{ width: '100px' }}
            />
            <Text>{Math.round(explorationRate * 100)}%</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Label>Prediction Horizon:</Label>
            <Slider
              value={predictionHorizon}
              onChange={(e, data) => setPredictionHorizon(data.value)}
              min={1}
              max={30}
              step={1}
              style={{ width: '100px' }}
            />
            <Text>{predictionHorizon} days</Text>
          </div>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Spinner label="Loading..." />
        </div>
      )}

      <TabList selectedValue={selectedTab} onTabSelect={(e, data) => setSelectedTab(data.value)}>
        <Tab value="overview" icon={<DataTrendingRegular />}>Overview</Tab>
        <Tab value="patterns" icon={<LightbulbRegular />}>Patterns</Tab>
        <Tab value="predictions" icon={<TargetRegular />}>Predictions</Tab>
        <Tab value="transfer" icon={<RocketRegular />}>Transfer Learning</Tab>
        <Tab value="settings" icon={<SettingsRegular />}>Settings</Tab>
      </TabList>

      <div style={{ flex: 1, overflow: 'auto', marginTop: '16px' }}>
        {selectedTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderLearningStats()}
            {selectedPattern && (
              <div>
                <Subtitle2 style={{ marginBottom: '12px' }}>Selected Pattern Details</Subtitle2>
                {renderPatternDetails(selectedPattern)}
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'patterns' && renderPatternsTable()}
        {selectedTab === 'predictions' && renderPredictionsTable()}
        {selectedTab === 'transfer' && renderTransferKnowledgeTable()}
        
        {selectedTab === 'settings' && (
          <Card>
            <CardHeader header={<Title3>Advanced Learning Settings</Title3>} />
            <div style={{ padding: '16px' }}>
              <Text>Configuration options for Advanced Learning will be implemented here.</Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 