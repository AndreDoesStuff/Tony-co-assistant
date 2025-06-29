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
  TimerRegular,
  WarningRegular,
  ErrorCircleRegular,
  CheckmarkRegular,
  Memory16Regular,
  CutRegular,
  NewRegular,
  StorageRegular,
  PersonRegular,
  HeartRegular,
  StarRegular,
  ThumbLikeRegular,
  ThumbDislikeRegular
} from '@fluentui/react-icons';
import { UserExperienceEnhancement } from './advanced/UserExperienceEnhancement';

interface UserExperienceEnhancementUIProps {
  userExperienceEnhancement?: UserExperienceEnhancement;
}

interface UserFeedback {
  id: string;
  userId: string;
  component: string;
  rating: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  feedback: string;
  timestamp: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface UXMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: number;
}

interface UXOptimization {
  id: string;
  type: 'interface' | 'performance' | 'accessibility' | 'usability';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'proposed' | 'implemented' | 'testing' | 'released';
  priority: number;
  estimatedEffort: number;
  userImpact: number;
  timestamp: number;
}

interface UserJourney {
  id: string;
  name: string;
  steps: UserJourneyStep[];
  completionRate: number;
  averageTime: number;
  dropoffPoints: string[];
  satisfaction: number;
}

interface UserJourneyStep {
  id: string;
  name: string;
  description: string;
  completionRate: number;
  averageTime: number;
  issues: string[];
}

export const UserExperienceEnhancementUI: React.FC<UserExperienceEnhancementUIProps> = ({ userExperienceEnhancement }) => {
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [uxMetrics, setUxMetrics] = useState<UXMetric[]>([]);
  const [uxOptimizations, setUxOptimizations] = useState<UXOptimization[]>([]);
  const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

  useEffect(() => {
    if (userExperienceEnhancement) {
      loadUXData();
      if (autoRefresh) {
        const interval = setInterval(loadUXData, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [userExperienceEnhancement, autoRefresh]);

  const loadUXData = async () => {
    if (!userExperienceEnhancement) return;
    
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockFeedback: UserFeedback[] = [
        {
          id: '1',
          userId: 'user1',
          component: 'ChatInterface',
          rating: 4,
          sentiment: 'positive',
          feedback: 'Great chat interface, very intuitive!',
          timestamp: Date.now() - 3600000,
          category: 'interface',
          priority: 'medium'
        },
        {
          id: '2',
          userId: 'user2',
          component: 'KnowledgeGraph',
          rating: 2,
          sentiment: 'negative',
          feedback: 'Too complex to understand',
          timestamp: Date.now() - 7200000,
          category: 'usability',
          priority: 'high'
        }
      ];

      const mockMetrics: UXMetric[] = [
        {
          id: '1',
          name: 'User Satisfaction',
          value: 4.2,
          target: 4.5,
          unit: '/5',
          trend: 'improving',
          lastUpdated: Date.now()
        },
        {
          id: '2',
          name: 'Task Completion Rate',
          value: 85,
          target: 90,
          unit: '%',
          trend: 'stable',
          lastUpdated: Date.now()
        }
      ];

      setUserFeedback(mockFeedback);
      setUxMetrics(mockMetrics);
      setStats({
        totalFeedback: mockFeedback.length,
        averageRating: 3.5,
        positiveSentiment: 0.6,
        negativeSentiment: 0.3,
        neutralSentiment: 0.1
      });
    } catch (error) {
      console.error('Error loading UX data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFeedback = async () => {
    if (!userExperienceEnhancement || !searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // Mock analysis
      console.log('Analyzing feedback:', searchQuery);
      setTimeout(() => setIsLoading(false), 2000);
    } catch (error) {
      console.error('Error analyzing feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, 'filled' | 'tint' | 'outline' | 'ghost'> = {
      positive: 'filled',
      negative: 'outline',
      neutral: 'tint'
    };
    return colors[sentiment] || 'filled';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#107c10',
      medium: '#ff8c00',
      high: '#d13438',
      critical: '#5c2d91'
    };
    return colors[priority] || '#666';
  };

  const getTrendColor = (trend: string) => {
    const colors: Record<string, 'filled' | 'tint' | 'outline' | 'ghost'> = {
      improving: 'filled',
      declining: 'outline',
      stable: 'tint'
    };
    return colors[trend] || 'filled';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderUXOverview = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      <Card>
        <CardHeader header={<Title3>User Satisfaction</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Average Rating</Text>
              <Badge appearance="filled">{stats?.averageRating || 0}/5</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Total Feedback</Text>
              <Badge appearance="filled">{stats?.totalFeedback || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Positive Sentiment</Text>
              <Badge appearance="filled">{Math.round((stats?.positiveSentiment || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Negative Sentiment</Text>
              <Badge appearance="filled">{Math.round((stats?.negativeSentiment || 0) * 100)}%</Badge>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader header={<Title3>UX Metrics</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {uxMetrics.map((metric) => (
              <div key={metric.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text>{metric.name}</Text>
                  <Badge appearance={getTrendColor(metric.trend)}>
                    {metric.value}{metric.unit}
                  </Badge>
                </div>
                <ProgressBar value={metric.value / metric.target} />
                <Caption1>Target: {metric.target}{metric.unit}</Caption1>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader header={<Title3>Recent Activity</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>New Feedback</Text>
              <Badge appearance="filled">{userFeedback.filter(f => f.timestamp > Date.now() - 86400000).length}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Pending Optimizations</Text>
              <Badge appearance="filled">{uxOptimizations.filter(o => o.status === 'proposed').length}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Active User Journeys</Text>
              <Badge appearance="filled">{userJourneys.length}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Critical Issues</Text>
              <Badge appearance="filled">{userFeedback.filter(f => f.priority === 'critical').length}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderFeedbackDetails = (feedback: UserFeedback) => (
    <Card>
      <CardHeader
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge appearance={getSentimentColor(feedback.sentiment)}>{feedback.sentiment}</Badge>
            <Title3>Feedback from {feedback.userId}</Title3>
          </div>
        }
        action={
          <Button
            appearance="subtle"
            icon={<EditRegular />}
            onClick={() => console.log('Edit feedback:', feedback.id)}
          />
        }
      />
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Component</Subtitle2>
          <Text>{feedback.component}</Text>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Rating</Subtitle2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarRegular 
                  key={star} 
                  style={{ 
                    color: star <= feedback.rating ? '#ffd700' : '#ccc',
                    fontSize: '16px'
                  }} 
                />
              ))}
            </div>
            <Text>{feedback.rating}/5</Text>
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Feedback</Subtitle2>
          <Text>{feedback.feedback}</Text>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Subtitle2>Metadata</Subtitle2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <Caption1>Category</Caption1>
              <Badge appearance="outline">{feedback.category}</Badge>
            </div>
            <div>
              <Caption1>Priority</Caption1>
              <Badge 
                appearance="outline" 
                style={{ 
                  backgroundColor: getPriorityColor(feedback.priority),
                  color: 'white'
                }}
              >
                {feedback.priority}
              </Badge>
            </div>
          </div>
        </div>
        
        <div>
          <Caption1>Submitted: {formatTimestamp(feedback.timestamp)}</Caption1>
        </div>
      </div>
    </Card>
  );

  const renderFeedbackTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>User</TableHeaderCell>
          <TableHeaderCell>Component</TableHeaderCell>
          <TableHeaderCell>Rating</TableHeaderCell>
          <TableHeaderCell>Sentiment</TableHeaderCell>
          <TableHeaderCell>Feedback</TableHeaderCell>
          <TableHeaderCell>Priority</TableHeaderCell>
          <TableHeaderCell>Timestamp</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userFeedback.map((feedback) => (
          <TableRow key={feedback.id} onClick={() => setSelectedFeedback(feedback)}>
            <TableCell>
              <Text weight="semibold">{feedback.userId}</Text>
            </TableCell>
            <TableCell>
              <Badge appearance="outline">{feedback.component}</Badge>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '1px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarRegular 
                      key={star} 
                      style={{ 
                        color: star <= feedback.rating ? '#ffd700' : '#ccc',
                        fontSize: '12px'
                      }} 
                    />
                  ))}
                </div>
                <Text>{feedback.rating}</Text>
              </div>
            </TableCell>
            <TableCell>
              <Badge appearance={getSentimentColor(feedback.sentiment)}>
                {feedback.sentiment}
              </Badge>
            </TableCell>
            <TableCell>
              <Text style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {feedback.feedback}
              </Text>
            </TableCell>
            <TableCell>
              <Badge 
                appearance="outline" 
                style={{ 
                  backgroundColor: getPriorityColor(feedback.priority),
                  color: 'white'
                }}
              >
                {feedback.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Text>{formatTimestamp(feedback.timestamp)}</Text>
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

  const renderOptimizationsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Impact</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Priority</TableHeaderCell>
          <TableHeaderCell>User Impact</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {uxOptimizations.map((optimization) => (
          <TableRow key={optimization.id}>
            <TableCell>
              <Badge appearance="outline">{optimization.type}</Badge>
            </TableCell>
            <TableCell>
              <Text>{optimization.description}</Text>
            </TableCell>
            <TableCell>
              <Badge 
                appearance="outline" 
                style={{ 
                  backgroundColor: getPriorityColor(optimization.impact),
                  color: 'white'
                }}
              >
                {optimization.impact}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge appearance="outline">{optimization.status}</Badge>
            </TableCell>
            <TableCell>
              <ProgressBar value={optimization.priority / 10} style={{ width: '60px' }} />
            </TableCell>
            <TableCell>
              <ProgressBar value={optimization.userImpact} style={{ width: '60px' }} />
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

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <PersonRegular style={{ fontSize: '24px' }} />
          <Title3>User Experience Enhancement</Title3>
          <Button
            appearance="subtle"
            icon={<ArrowClockwiseRegular />}
            onClick={loadUXData}
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
            placeholder="Analyze user feedback or search..."
            value={searchQuery}
            onChange={(e, data) => setSearchQuery(data.value)}
            style={{ minWidth: '300px' }}
          />
          <Select
            value={feedbackFilter}
            onChange={(e, data) => setFeedbackFilter(data.value)}
            style={{ minWidth: '150px' }}
          >
            <Option value="all">All Components</Option>
            <Option value="ChatInterface">Chat Interface</Option>
            <Option value="KnowledgeGraph">Knowledge Graph</Option>
            <Option value="SchoolBench">School Bench</Option>
            <Option value="UXRepository">UX Repository</Option>
          </Select>
          <Select
            value={sentimentFilter}
            onChange={(e, data) => setSentimentFilter(data.value)}
            style={{ minWidth: '150px' }}
          >
            <Option value="all">All Sentiments</Option>
            <Option value="positive">Positive</Option>
            <Option value="negative">Negative</Option>
            <Option value="neutral">Neutral</Option>
          </Select>
          <Button
            appearance="primary"
            icon={<HeartRegular />}
            onClick={handleAnalyzeFeedback}
            disabled={isLoading}
          >
            Analyze Feedback
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
        <Tab value="feedback" icon={<HeartRegular />}>User Feedback</Tab>
        <Tab value="optimizations" icon={<RocketRegular />}>UX Optimizations</Tab>
        <Tab value="journeys" icon={<PersonRegular />}>User Journeys</Tab>
        <Tab value="settings" icon={<SettingsRegular />}>Settings</Tab>
      </TabList>

      <div style={{ flex: 1, overflow: 'auto', marginTop: '16px' }}>
        {selectedTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderUXOverview()}
            {selectedFeedback && (
              <div>
                <Subtitle2 style={{ marginBottom: '12px' }}>Selected Feedback Details</Subtitle2>
                {renderFeedbackDetails(selectedFeedback)}
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'feedback' && renderFeedbackTable()}
        {selectedTab === 'optimizations' && renderOptimizationsTable()}
        
        {selectedTab === 'journeys' && (
          <Card>
            <CardHeader header={<Title3>User Journeys</Title3>} />
            <div style={{ padding: '16px' }}>
              <Text>User journey analysis and visualization will be implemented here.</Text>
            </div>
          </Card>
        )}
        
        {selectedTab === 'settings' && (
          <Card>
            <CardHeader header={<Title3>UX Enhancement Settings</Title3>} />
            <div style={{ padding: '16px' }}>
              <Text>Configuration options for User Experience Enhancement will be implemented here.</Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 