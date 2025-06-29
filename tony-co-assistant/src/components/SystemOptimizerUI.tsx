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
  LockShieldRegular,
  Memory16Regular,
  CutRegular,
  NewRegular,
  StorageRegular
} from '@fluentui/react-icons';
import { SystemOptimizer } from './advanced/SystemOptimizer';

interface SystemOptimizerUIProps {
  systemOptimizer?: SystemOptimizer;
}

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  databaseQueryTime: number;
  networkLatency: number;
}

interface MemoryStats {
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  memoryUsagePercentage: number;
  memoryLeaks: MemoryLeak[];
  garbageCollectionStats: GarbageCollectionStats;
}

interface MemoryLeak {
  id: string;
  component: string;
  memorySize: number;
  detectionTime: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface GarbageCollectionStats {
  totalCollections: number;
  totalTime: number;
  averageTime: number;
  lastCollectionTime: number;
  memoryFreed: number;
}

interface OptimizationAction {
  id: string;
  type: 'performance' | 'memory' | 'scalability' | 'resource' | 'monitoring';
  action: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  result?: any;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'critical' | 'info';
  component: string;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolutionTime?: number;
}

export const SystemOptimizerUI: React.FC<SystemOptimizerUIProps> = ({ systemOptimizer }) => {
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [optimizationActions, setOptimizationActions] = useState<OptimizationAction[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [selectedAction, setSelectedAction] = useState<OptimizationAction | null>(null);

  useEffect(() => {
    if (systemOptimizer) {
      loadSystemData();
      if (monitoringEnabled) {
        const interval = setInterval(loadSystemData, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [systemOptimizer, monitoringEnabled]);

  const loadSystemData = async () => {
    if (!systemOptimizer) return;
    
    setIsLoading(true);
    try {
      const metrics = systemOptimizer.getPerformanceMetrics();
      const memory = systemOptimizer.getMemoryStats();
      const actions = systemOptimizer.getOptimizationActions();
      const alerts = systemOptimizer.getSystemAlerts();
      const systemStats = systemOptimizer.getStats();
      
      setPerformanceMetrics(metrics);
      setMemoryStats(memory);
      setOptimizationActions(actions);
      setSystemAlerts(alerts);
      setStats(systemStats);
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerformanceOptimization = async () => {
    if (!systemOptimizer) return;
    
    setIsLoading(true);
    try {
      const action = await systemOptimizer.applyPerformanceOptimization();
      setOptimizationActions(prev => [action, ...prev]);
    } catch (error) {
      console.error('Error applying performance optimization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemoryOptimization = async () => {
    if (!systemOptimizer) return;
    
    setIsLoading(true);
    try {
      const action = await systemOptimizer.applyMemoryOptimization();
      setOptimizationActions(prev => [action, ...prev]);
    } catch (error) {
      console.error('Error applying memory optimization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemAssessment = async () => {
    if (!systemOptimizer) return;
    
    setIsLoading(true);
    try {
      await systemOptimizer.performSystemAssessment();
      loadSystemData();
    } catch (error) {
      console.error('Error performing system assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertTypeColor = (type: string) => {
    const colors: Record<string, 'filled' | 'tint' | 'outline' | 'ghost'> = {
      warning: 'outline',
      error: 'filled',
      critical: 'filled',
      info: 'tint'
    };
    return colors[type] || 'filled';
  };

  const getActionStatusColor = (status: string) => {
    const colors: Record<string, 'filled' | 'tint' | 'outline' | 'ghost'> = {
      pending: 'outline',
      running: 'tint',
      completed: 'filled',
      failed: 'filled'
    };
    return colors[status] || 'outline';
  };

  const getActionImpactColor = (impact: string) => {
    const colors: Record<string, string> = {
      low: '#107c10',
      medium: '#ff8c00',
      high: '#d13438',
      critical: '#5c2d91'
    };
    return colors[impact] || '#666';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderSystemOverview = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      <Card>
        <CardHeader header={<Title3>Performance Metrics</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>CPU Usage</Text>
              <Badge appearance="filled">{Math.round(performanceMetrics?.cpuUsage || 0)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Memory Usage</Text>
              <Badge appearance="filled">{Math.round(performanceMetrics?.memoryUsage || 0)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Response Time</Text>
              <Badge appearance="filled">{performanceMetrics?.responseTime || 0}ms</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Throughput</Text>
              <Badge appearance="filled">{performanceMetrics?.throughput || 0} req/s</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Error Rate</Text>
              <Badge appearance="filled">{Math.round((performanceMetrics?.errorRate || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Cache Hit Rate</Text>
              <Badge appearance="filled">{Math.round((performanceMetrics?.cacheHitRate || 0) * 100)}%</Badge>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader header={<Title3>Memory Management</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Total Memory</Text>
              <Badge appearance="filled">{formatBytes(memoryStats?.totalMemory || 0)}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Used Memory</Text>
              <Badge appearance="filled">{formatBytes(memoryStats?.usedMemory || 0)}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Free Memory</Text>
              <Badge appearance="filled">{formatBytes(memoryStats?.freeMemory || 0)}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Usage Percentage</Text>
              <Badge appearance="filled">{Math.round(memoryStats?.memoryUsagePercentage || 0)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Memory Leaks</Text>
              <Badge appearance="filled">{memoryStats?.memoryLeaks?.length || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>GC Collections</Text>
              <Badge appearance="filled">{memoryStats?.garbageCollectionStats?.totalCollections || 0}</Badge>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <CardHeader header={<Title3>Optimization Stats</Title3>} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Performance Gain</Text>
              <Badge appearance="filled">{Math.round((stats?.performanceOptimization?.averagePerformanceGain || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Memory Reduction</Text>
              <Badge appearance="filled">{Math.round((stats?.memoryManagement?.memoryUsageReduction || 0) * 100)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Scaling Events</Text>
              <Badge appearance="filled">{stats?.scalabilityImprovements?.scalingEvents || 0}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>System Health</Text>
              <Badge appearance="filled">{Math.round(stats?.systemMonitoring?.systemHealthScore || 0)}%</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Active Alerts</Text>
              <Badge appearance="filled">{systemAlerts.filter(alert => !alert.resolved).length}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Pending Actions</Text>
              <Badge appearance="filled">{optimizationActions.filter(action => action.status === 'pending').length}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderOptimizationActionsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Action</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Impact</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Duration</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {optimizationActions.map((action) => (
          <TableRow key={action.id} onClick={() => setSelectedAction(action)}>
            <TableCell>
              <Badge appearance="outline">{action.type}</Badge>
            </TableCell>
            <TableCell>
              <Text weight="semibold">{action.action}</Text>
            </TableCell>
            <TableCell>
              <Text>{action.description}</Text>
            </TableCell>
            <TableCell>
              <Badge 
                appearance="outline" 
                style={{ 
                  backgroundColor: getActionImpactColor(action.impact),
                  color: 'white'
                }}
              >
                {action.impact}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge appearance={getActionStatusColor(action.status)}>
                {action.status}
              </Badge>
            </TableCell>
            <TableCell>
              {action.startTime && action.endTime ? (
                <Text>{Math.round((action.endTime - action.startTime) / 1000)}s</Text>
              ) : action.startTime ? (
                <Text>Running...</Text>
              ) : (
                <Text>-</Text>
              )}
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

  const renderSystemAlertsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Component</TableHeaderCell>
          <TableHeaderCell>Message</TableHeaderCell>
          <TableHeaderCell>Severity</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Timestamp</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {systemAlerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell>
              <Badge appearance={getAlertTypeColor(alert.type)}>
                {alert.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Text weight="semibold">{alert.component}</Text>
            </TableCell>
            <TableCell>
              <Text>{alert.message}</Text>
            </TableCell>
            <TableCell>
              <Badge 
                appearance="outline" 
                style={{ 
                  backgroundColor: getActionImpactColor(alert.severity),
                  color: 'white'
                }}
              >
                {alert.severity}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge appearance={alert.resolved ? 'filled' : 'outline'}>
                {alert.resolved ? 'Resolved' : 'Active'}
              </Badge>
            </TableCell>
            <TableCell>
              <Text>{formatTimestamp(alert.timestamp)}</Text>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', gap: '4px' }}>
                {!alert.resolved && (
                  <Button size="small" appearance="subtle" icon={<CheckmarkRegular />} />
                )}
                <Button size="small" appearance="subtle" icon={<DeleteRegular />} />
                <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderMemoryLeaksTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Component</TableHeaderCell>
          <TableHeaderCell>Memory Size</TableHeaderCell>
          <TableHeaderCell>Severity</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Detection Time</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memoryStats?.memoryLeaks?.map((leak) => (
          <TableRow key={leak.id}>
            <TableCell>
              <Text weight="semibold">{leak.component}</Text>
            </TableCell>
            <TableCell>
              <Text>{formatBytes(leak.memorySize)}</Text>
            </TableCell>
            <TableCell>
              <Badge 
                appearance="outline" 
                style={{ 
                  backgroundColor: getActionImpactColor(leak.severity),
                  color: 'white'
                }}
              >
                {leak.severity}
              </Badge>
            </TableCell>
            <TableCell>
              <Text>{leak.description}</Text>
            </TableCell>
            <TableCell>
              <Text>{formatTimestamp(leak.detectionTime)}</Text>
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
          <RocketRegular style={{ fontSize: '24px' }} />
          <Title3>System Optimizer</Title3>
          <Button
            appearance="subtle"
            icon={<ArrowClockwiseRegular />}
            onClick={loadSystemData}
            disabled={isLoading}
          />
          <Switch
            checked={monitoringEnabled}
            onChange={(e, data) => setMonitoringEnabled(data.checked)}
            label="Real-time Monitoring"
          />
          <Switch
            checked={autoOptimization}
            onChange={(e, data) => setAutoOptimization(data.checked)}
            label="Auto Optimization"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            appearance="primary"
            icon={<Memory16Regular />}
            onClick={handlePerformanceOptimization}
            disabled={isLoading}
          >
            Optimize Performance
          </Button>
          <Button
            appearance="outline"
            icon={<Memory16Regular />}
            onClick={handleMemoryOptimization}
            disabled={isLoading}
          >
            Optimize Memory
          </Button>
          <Button
            appearance="outline"
            icon={<RocketRegular />}
            onClick={handleSystemAssessment}
            disabled={isLoading}
          >
            System Assessment
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
        <Tab value="actions" icon={<RocketRegular />}>Optimization Actions</Tab>
        <Tab value="alerts" icon={<WarningRegular />}>System Alerts</Tab>
        <Tab value="memory" icon={<Memory16Regular />}>Memory Leaks</Tab>
        <Tab value="settings" icon={<SettingsRegular />}>Settings</Tab>
      </TabList>

      <div style={{ flex: 1, overflow: 'auto', marginTop: '16px' }}>
        {selectedTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderSystemOverview()}
            {selectedAction && (
              <div>
                <Subtitle2 style={{ marginBottom: '12px' }}>Selected Action Details</Subtitle2>
                <Card>
                  <CardHeader header={<Title3>{selectedAction.action}</Title3>} />
                  <div style={{ padding: '16px' }}>
                    <Text><strong>Type:</strong> {selectedAction.type}</Text>
                    <Text><strong>Description:</strong> {selectedAction.description}</Text>
                    <Text><strong>Impact:</strong> {selectedAction.impact}</Text>
                    <Text><strong>Status:</strong> {selectedAction.status}</Text>
                    {selectedAction.result && (
                      <Text><strong>Result:</strong> {JSON.stringify(selectedAction.result, null, 2)}</Text>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'actions' && renderOptimizationActionsTable()}
        {selectedTab === 'alerts' && renderSystemAlertsTable()}
        {selectedTab === 'memory' && renderMemoryLeaksTable()}
        
        {selectedTab === 'settings' && (
          <Card>
            <CardHeader header={<Title3>System Optimizer Settings</Title3>} />
            <div style={{ padding: '16px' }}>
              <Text>Configuration options for System Optimizer will be implemented here.</Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}; 