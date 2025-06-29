import React, { useState, useEffect, useRef } from 'react';
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
  LinkRegular,
  BrainRegular,
  LightbulbRegular,
  DataTrendingRegular,
  SettingsRegular,
  ArrowClockwiseRegular,
  FilterRegular,
  MoreHorizontalRegular
} from '@fluentui/react-icons';
import { KnowledgeGraph } from './advanced/KnowledgeGraph';

interface KnowledgeGraphUIProps {
  knowledgeGraph?: KnowledgeGraph;
}

interface KnowledgeNode {
  id: string;
  type: 'concept' | 'entity' | 'relationship' | 'attribute' | 'context';
  content: any;
  confidence: number;
  source: string;
  timestamp: number;
  metadata: {
    importance: number;
    relevance: number;
    freshness: number;
    usage: number;
    trustworthiness: number;
    complexity: number;
  };
  relationships: any[];
  semanticTags: string[];
  context: any;
}

interface KnowledgeRelationship {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: 'is_a' | 'part_of' | 'related_to' | 'causes' | 'influences' | 'similar_to' | 'opposite_of' | 'depends_on';
  strength: number;
  confidence: number;
  bidirectional: boolean;
  metadata: any;
}

export const KnowledgeGraphUI: React.FC<KnowledgeGraphUIProps> = ({ knowledgeGraph }) => {
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [relationships, setRelationships] = useState<KnowledgeRelationship[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [graphStats, setGraphStats] = useState<any>(null);
  const [inferenceResults, setInferenceResults] = useState<any[]>([]);
  const [semanticResults, setSemanticResults] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (knowledgeGraph) {
      loadGraphData();
      if (autoRefresh) {
        const interval = setInterval(loadGraphData, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [knowledgeGraph, autoRefresh]);

  const loadGraphData = async () => {
    if (!knowledgeGraph) return;
    
    setIsLoading(true);
    try {
      const allNodes = knowledgeGraph.getAllNodes();
      const allRelationships = knowledgeGraph.getAllRelationships();
      const stats = knowledgeGraph.getStats();
      
      setNodes(allNodes);
      setRelationships(allRelationships);
      setGraphStats(stats);
    } catch (error) {
      console.error('Error loading graph data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!knowledgeGraph || !searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const searchResults = knowledgeGraph.searchNodes(searchQuery, {
        type: filterType === 'all' ? undefined : filterType as any,
        minConfidence
      });
      setNodes(searchResults);
    } catch (error) {
      console.error('Error searching nodes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSemanticAnalysis = async () => {
    if (!knowledgeGraph || !searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await knowledgeGraph.analyzeSemantics(searchQuery);
      setSemanticResults(result);
    } catch (error) {
      console.error('Error performing semantic analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInferences = async () => {
    if (!knowledgeGraph || !searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const inferences = await knowledgeGraph.generateInferences(searchQuery);
      setInferenceResults(inferences);
    } catch (error) {
      console.error('Error generating inferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeTypeColor = (type: string) => {
    const colors: Record<string, 'filled' | 'tint' | 'outline' | 'ghost'> = {
      concept: 'filled',
      entity: 'tint',
      relationship: 'outline',
      attribute: 'ghost',
      context: 'filled'
    };
    return colors[type] || 'filled';
  };

  const getRelationshipTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      is_a: '#0078d4',
      part_of: '#107c10',
      related_to: '#ff8c00',
      causes: '#d13438',
      influences: '#5c2d91',
      similar_to: '#00bcf2',
      opposite_of: '#ff6b6b',
      depends_on: '#ffd700'
    };
    return colors[type] || '#666';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderNodeDetails = (node: KnowledgeNode) => (
    <Card>
      <CardHeader
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge appearance={getNodeTypeColor(node.type)}>{node.type}</Badge>
            <Title3>{node.id}</Title3>
          </div>
        }
        action={
          <Button
            appearance="subtle"
            icon={<EditRegular />}
            onClick={() => console.log('Edit node:', node.id)}
          />
        }
      />
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Content</Subtitle2>
          <Text>{JSON.stringify(node.content, null, 2)}</Text>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Confidence</Subtitle2>
          <ProgressBar value={node.confidence} />
          <Caption1>{Math.round(node.confidence * 100)}%</Caption1>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Metadata</Subtitle2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <Caption1>Importance</Caption1>
              <ProgressBar value={node.metadata.importance} />
            </div>
            <div>
              <Caption1>Relevance</Caption1>
              <ProgressBar value={node.metadata.relevance} />
            </div>
            <div>
              <Caption1>Trustworthiness</Caption1>
              <ProgressBar value={node.metadata.trustworthiness} />
            </div>
            <div>
              <Caption1>Complexity</Caption1>
              <ProgressBar value={node.metadata.complexity} />
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Semantic Tags</Subtitle2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {node.semanticTags.map((tag, index) => (
              <Badge key={index} appearance="outline">{tag}</Badge>
            ))}
          </div>
        </div>
        
        <div>
          <Subtitle2>Relationships ({node.relationships.length})</Subtitle2>
          <Caption1>Source: {node.source}</Caption1>
          <br />
          <Caption1>Created: {formatTimestamp(node.timestamp)}</Caption1>
        </div>
      </div>
    </Card>
  );

  const renderGraphStats = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <Card>
        <CardHeader header={<Title3>Graph Overview</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Total Nodes</Text>
              <Badge appearance="filled">{graphStats?.totalNodes || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Total Relationships</Text>
              <Badge appearance="filled">{graphStats?.totalRelationships || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Average Confidence</Text>
              <Badge appearance="filled">{Math.round((graphStats?.averageConfidence || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Average Connectivity</Text>
              <Badge appearance="filled">{graphStats?.averageConnectivity || 0}</Badge>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader header={<Title3>Performance</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Inference Count</Text>
              <Badge appearance="filled">{graphStats?.inferenceCount || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Semantic Analysis</Text>
              <Badge appearance="filled">{graphStats?.semanticAnalysisCount || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Compression Ratio</Text>
              <Badge appearance="filled">{Math.round((graphStats?.graphOptimization?.compressionRatio || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Performance Score</Text>
              <Badge appearance="filled">{Math.round(graphStats?.graphOptimization?.performance || 0)}%</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNodesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>ID</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Confidence</TableHeaderCell>
          <TableHeaderCell>Source</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <TableRow key={node.id} onClick={() => setSelectedNode(node)}>
            <TableCell>
              <Text weight="semibold">{node.id}</Text>
            </TableCell>
            <TableCell>
              <Badge appearance={getNodeTypeColor(node.type)}>{node.type}</Badge>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProgressBar value={node.confidence} style={{ width: '60px' }} />
                <Text>{Math.round(node.confidence * 100)}%</Text>
              </div>
            </TableCell>
            <TableCell>
              <Text>{node.source}</Text>
            </TableCell>
            <TableCell>
              <Text>{formatTimestamp(node.timestamp)}</Text>
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

  const renderRelationshipsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Source</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Target</TableHeaderCell>
          <TableHeaderCell>Strength</TableHeaderCell>
          <TableHeaderCell>Confidence</TableHeaderCell>
          <TableHeaderCell>Bidirectional</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {relationships.map((rel) => (
          <TableRow key={rel.id}>
            <TableCell>
              <Text weight="semibold">{rel.sourceNodeId}</Text>
            </TableCell>
            <TableCell>
              <Badge 
                appearance="outline" 
                style={{ 
                  backgroundColor: getRelationshipTypeColor(rel.type),
                  color: 'white'
                }}
              >
                {rel.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Text weight="semibold">{rel.targetNodeId}</Text>
            </TableCell>
            <TableCell>
              <ProgressBar value={rel.strength} style={{ width: '60px' }} />
            </TableCell>
            <TableCell>
              <ProgressBar value={rel.confidence} style={{ width: '60px' }} />
            </TableCell>
            <TableCell>
              <Badge appearance={rel.bidirectional ? 'filled' : 'outline'}>
                {rel.bidirectional ? 'Yes' : 'No'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderSemanticResults = () => (
    <Card>
      <CardHeader header={<Title3>Semantic Analysis Results</Title3>} />
      <div style={{ padding: '16px' }}>
        {semanticResults ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Subtitle2>Entities ({semanticResults.entities?.length || 0})</Subtitle2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {semanticResults.entities?.map((entity: any, index: number) => (
                  <Badge key={index} appearance="filled">
                    {entity.name} ({entity.type})
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Subtitle2>Concepts ({semanticResults.concepts?.length || 0})</Subtitle2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {semanticResults.concepts?.map((concept: any, index: number) => (
                  <Badge key={index} appearance="tint">
                    {concept.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Subtitle2>Sentiment Analysis</Subtitle2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                <div>
                  <Caption1>Overall</Caption1>
                  <ProgressBar value={(semanticResults.sentiment?.overall || 0) + 1} />
                </div>
                <div>
                  <Caption1>Positive</Caption1>
                  <ProgressBar value={semanticResults.sentiment?.positive || 0} />
                </div>
                <div>
                  <Caption1>Negative</Caption1>
                  <ProgressBar value={semanticResults.sentiment?.negative || 0} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Text>No semantic analysis results available.</Text>
        )}
      </div>
    </Card>
  );

  const renderInferenceResults = () => (
    <Card>
      <CardHeader header={<Title3>Inference Results ({inferenceResults.length})</Title3>} />
      <div style={{ padding: '16px' }}>
        {inferenceResults.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {inferenceResults.map((inference, index) => (
              <Card key={index}>
                <CardHeader header={<Subtitle2>Inference {index + 1}</Subtitle2>} />
                <div style={{ padding: '16px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text weight="semibold">Conclusion:</Text>
                    <Text>{inference.conclusion}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text weight="semibold">Confidence:</Text>
                    <ProgressBar value={inference.confidence} style={{ width: '100px' }} />
                  </div>
                  <div>
                    <Text weight="semibold">Reasoning:</Text>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                      {inference.reasoning?.map((reason: string, i: number) => (
                        <li key={i}><Text>{reason}</Text></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Text>No inference results available.</Text>
        )}
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <BrainRegular style={{ fontSize: '24px' }} />
          <Title3>Knowledge Graph</Title3>
          <Button
            appearance="subtle"
            icon={<ArrowClockwiseRegular />}
            onClick={loadGraphData}
            disabled={isLoading}
          />
          <Switch
            checked={autoRefresh}
            onChange={(e, data) => setAutoRefresh(data.checked)}
            label="Auto Refresh"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search nodes or perform analysis..."
            value={searchQuery}
            onChange={(e, data) => setSearchQuery(data.value)}
            style={{ minWidth: '300px' }}
          />
          <Select
            value={filterType}
            onChange={(e, data) => setFilterType(data.value)}
            style={{ minWidth: '150px' }}
          >
            <Option value="all">All Types</Option>
            <Option value="concept">Concepts</Option>
            <Option value="entity">Entities</Option>
            <Option value="relationship">Relationships</Option>
            <Option value="attribute">Attributes</Option>
            <Option value="context">Context</Option>
          </Select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Label>Min Confidence:</Label>
            <Slider
              value={minConfidence}
              onChange={(e, data) => setMinConfidence(data.value)}
              min={0}
              max={1}
              step={0.1}
              style={{ width: '100px' }}
            />
            <Text>{Math.round(minConfidence * 100)}%</Text>
          </div>
          <Button
            appearance="primary"
            icon={<SearchRegular />}
            onClick={handleSearch}
            disabled={isLoading}
          >
            Search
          </Button>
          <Button
            appearance="outline"
            icon={<BrainRegular />}
            onClick={handleSemanticAnalysis}
            disabled={isLoading}
          >
            Analyze
          </Button>
          <Button
            appearance="outline"
            icon={<LightbulbRegular />}
            onClick={handleGenerateInferences}
            disabled={isLoading}
          >
            Infer
          </Button>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Spinner label="Loading..." />
        </div>
      )}

      <TabList selectedValue={selectedTab} onTabSelect={(e, data) => setSelectedTab(data.value)}>
        <Tab value="overview" icon={<DataTrendingRegular />}>Overview</Tab>
        <Tab value="nodes" icon={<BrainRegular />}>Nodes</Tab>
        <Tab value="relationships" icon={<LinkRegular />}>Relationships</Tab>
        <Tab value="semantic" icon={<BrainRegular />}>Semantic Analysis</Tab>
        <Tab value="inferences" icon={<LightbulbRegular />}>Inferences</Tab>
        <Tab value="settings" icon={<SettingsRegular />}>Settings</Tab>
      </TabList>

      <div style={{ flex: 1, overflow: 'auto', marginTop: '16px' }}>
        {selectedTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderGraphStats()}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {selectedNode && (
                <div>
                  <Subtitle2 style={{ marginBottom: '12px' }}>Selected Node Details</Subtitle2>
                  {renderNodeDetails(selectedNode)}
                </div>
              )}
              <div>
                <Subtitle2 style={{ marginBottom: '12px' }}>Graph Visualization</Subtitle2>
                <Card>
                  <div style={{ padding: '16px' }}>
                    <canvas
                      ref={canvasRef}
                      style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
                    />
                    <Text>Interactive graph visualization will be implemented here.</Text>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'nodes' && renderNodesTable()}
        {selectedTab === 'relationships' && renderRelationshipsTable()}
        {selectedTab === 'semantic' && renderSemanticResults()}
        {selectedTab === 'inferences' && renderInferenceResults()}
        
        {selectedTab === 'settings' && (
          <Card>
            <CardHeader header={<Title3>Knowledge Graph Settings</Title3>} />
            <div style={{ padding: '16px' }}>
              <Text>Configuration options for the Knowledge Graph will be implemented here.</Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 