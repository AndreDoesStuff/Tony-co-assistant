import React, { useState, useEffect, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Card,
  CardHeader,
  CardFooter,
  Spinner,
  Tooltip,
  Toast,
  ToastTitle,
  ToastBody,
  TabList,
  Tab,
  TabValue,
  Select,
  Input,
  Label,
  Textarea,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
  useTableFeatures,
  TableRowData,
} from '@fluentui/react-components';
import { 
  AddRegular, 
  SearchRegular, 
  FilterRegular, 
  LightbulbRegular,
  BookRegular,
  WarningRegular,
  CheckmarkRegular,
  ArrowTrendingRegular,
  PeopleRegular,
  DocumentRegular
} from '@fluentui/react-icons';
import { 
  DesignPattern, 
  UXKnowledgeBase, 
  BestPractice, 
  AntiPattern, 
  Guideline, 
  PatternRelationship 
} from './core/UXRepository';
import { uxRepositoryService } from '../services/uxRepositoryService';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    padding: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  tabContent: {
    padding: '16px 0',
  },
  searchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    alignItems: 'center',
  },
  patternGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  patternCard: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  patternHeader: {
    padding: '12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  patternBody: {
    padding: '12px',
  },
  patternFooter: {
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  tag: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
  },
  relationshipCard: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
  },
  knowledgeBaseSection: {
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  analyticsChart: {
    height: '200px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
});

interface UXStats {
  totalPatterns: number;
  totalInteractions: number;
  userSatisfaction: number;
  errorRate: number;
  engagement: number;
  knowledgeBaseItems: number;
}

const UXRepositoryEnhanced: React.FC = () => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<TabValue>('patterns');
  const [stats, setStats] = useState<UXStats>({
    totalPatterns: 0,
    totalInteractions: 0,
    userSatisfaction: 0,
    errorRate: 0,
    engagement: 0,
    knowledgeBaseItems: 0
  });
  const [patterns, setPatterns] = useState<DesignPattern[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<UXKnowledgeBase>({
    patterns: [],
    relationships: [],
    insights: [],
    bestPractices: [],
    antiPatterns: [],
    guidelines: []
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [showAddBestPractice, setShowAddBestPractice] = useState(false);
  const [showAddAntiPattern, setShowAddAntiPattern] = useState(false);
  const [showAddGuideline, setShowAddGuideline] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load patterns by category
      const patternsData = await uxRepositoryService.getDesignPatternsByCategory('all');
      setPatterns(patternsData);

      // Load knowledge base
      const kbData = await uxRepositoryService.loadKnowledgeBase();
      setKnowledgeBase(kbData);

      // Load analytics
      const analytics = await uxRepositoryService.getUXAnalytics();
      
      setStats({
        totalPatterns: patternsData.length,
        totalInteractions: 0, // Would come from interaction tracking
        userSatisfaction: analytics.userSatisfaction,
        errorRate: analytics.errorRate,
        engagement: analytics.engagement,
        knowledgeBaseItems: kbData.patterns.length + kbData.bestPractices.length + 
                           kbData.antiPatterns.length + kbData.guidelines.length
      });
    } catch (error) {
      console.error('Error loading UX data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPattern = async (patternData: Partial<DesignPattern>) => {
    try {
      const newPattern = await uxRepositoryService.saveDesignPattern(patternData as DesignPattern);
      setPatterns([...patterns, newPattern]);
      setShowAddPattern(false);
    } catch (error) {
      console.error('Error adding pattern:', error);
    }
  };

  const handleAddBestPractice = async (bestPracticeData: Partial<BestPractice>) => {
    try {
      const newBestPractice = await uxRepositoryService.saveBestPractice(bestPracticeData as BestPractice);
      setKnowledgeBase({
        ...knowledgeBase,
        bestPractices: [...knowledgeBase.bestPractices, newBestPractice]
      });
      setShowAddBestPractice(false);
    } catch (error) {
      console.error('Error adding best practice:', error);
    }
  };

  const handleAddAntiPattern = async (antiPatternData: Partial<AntiPattern>) => {
    try {
      const newAntiPattern = await uxRepositoryService.saveAntiPattern(antiPatternData as AntiPattern);
      setKnowledgeBase({
        ...knowledgeBase,
        antiPatterns: [...knowledgeBase.antiPatterns, newAntiPattern]
      });
      setShowAddAntiPattern(false);
    } catch (error) {
      console.error('Error adding anti-pattern:', error);
    }
  };

  const handleAddGuideline = async (guidelineData: Partial<Guideline>) => {
    try {
      const newGuideline = await uxRepositoryService.saveGuideline(guidelineData as Guideline);
      setKnowledgeBase({
        ...knowledgeBase,
        guidelines: [...knowledgeBase.guidelines, newGuideline]
      });
      setShowAddGuideline(false);
    } catch (error) {
      console.error('Error adding guideline:', error);
    }
  };

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStatsCards = () => (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <Text weight="semibold" size={500}>Total Patterns</Text>
        <Text size={600} weight="bold">{stats.totalPatterns}</Text>
      </div>
      <div className={styles.statCard}>
        <Text weight="semibold" size={500}>User Satisfaction</Text>
        <Text size={600} weight="bold">{(stats.userSatisfaction * 100).toFixed(1)}%</Text>
      </div>
      <div className={styles.statCard}>
        <Text weight="semibold" size={500}>Error Rate</Text>
        <Text size={600} weight="bold">{(stats.errorRate * 100).toFixed(1)}%</Text>
      </div>
      <div className={styles.statCard}>
        <Text weight="semibold" size={500}>Engagement</Text>
        <Text size={600} weight="bold">{(stats.engagement * 100).toFixed(1)}%</Text>
      </div>
      <div className={styles.statCard}>
        <Text weight="semibold" size={500}>Knowledge Base Items</Text>
        <Text size={600} weight="bold">{stats.knowledgeBaseItems}</Text>
      </div>
    </div>
  );

  const renderPatternsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.searchBar}>
        <Input
          placeholder="Search patterns..."
          value={searchQuery}
          onChange={(e, data) => setSearchQuery(data.value)}
          contentBefore={<SearchRegular />}
        />
        <Select
          value={selectedCategory}
          onChange={(e, data) => setSelectedCategory(data.value)}
        >
          <option value="all">All Categories</option>
          <option value="navigation">Navigation</option>
          <option value="input">Input</option>
          <option value="feedback">Feedback</option>
          <option value="layout">Layout</option>
          <option value="interaction">Interaction</option>
          <option value="visual">Visual</option>
        </Select>
        <Button 
          appearance="primary" 
          icon={<AddRegular />}
          onClick={() => setShowAddPattern(true)}
        >
          Add Pattern
        </Button>
      </div>

      <div className={styles.patternGrid}>
        {filteredPatterns.map(pattern => (
          <Card key={pattern.id} className={styles.patternCard}>
            <CardHeader className={styles.patternHeader}>
              <Text weight="semibold">{pattern.name}</Text>
              <Badge appearance="filled" color="brand">{pattern.category}</Badge>
            </CardHeader>
            <div className={styles.patternBody}>
              <Text>{pattern.description}</Text>
              <div className={styles.tagContainer}>
                {pattern.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
            <CardFooter className={styles.patternFooter}>
              <Text size={200}>Used {pattern.metrics.frequency} times</Text>
              <Text size={200}>{(pattern.metrics.successRate * 100).toFixed(1)}% success</Text>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderKnowledgeBaseTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.knowledgeBaseSection}>
        <div className={styles.header}>
          <Text weight="semibold" size={500}>Best Practices</Text>
          <Button 
            appearance="primary" 
            icon={<AddRegular />}
            onClick={() => setShowAddBestPractice(true)}
          >
            Add Best Practice
          </Button>
        </div>
        {knowledgeBase.bestPractices.map(bp => (
          <Card key={bp.id} className={styles.patternCard}>
            <CardHeader className={styles.patternHeader}>
              <Text weight="semibold">{bp.title}</Text>
              <Badge appearance="filled" color="success">{bp.category}</Badge>
            </CardHeader>
            <div className={styles.patternBody}>
              <Text>{bp.description}</Text>
            </div>
          </Card>
        ))}
      </div>

      <Divider />

      <div className={styles.knowledgeBaseSection}>
        <div className={styles.header}>
          <Text weight="semibold" size={500}>Anti-Patterns</Text>
          <Button 
            appearance="primary" 
            icon={<AddRegular />}
            onClick={() => setShowAddAntiPattern(true)}
          >
            Add Anti-Pattern
          </Button>
        </div>
        {knowledgeBase.antiPatterns.map(ap => (
          <Card key={ap.id} className={styles.patternCard}>
            <CardHeader className={styles.patternHeader}>
              <Text weight="semibold">{ap.title}</Text>
              <Badge appearance="filled" color="danger">{ap.category}</Badge>
            </CardHeader>
            <div className={styles.patternBody}>
              <Text>{ap.description}</Text>
            </div>
          </Card>
        ))}
      </div>

      <Divider />

      <div className={styles.knowledgeBaseSection}>
        <div className={styles.header}>
          <Text weight="semibold" size={500}>Guidelines</Text>
          <Button 
            appearance="primary" 
            icon={<AddRegular />}
            onClick={() => setShowAddGuideline(true)}
          >
            Add Guideline
          </Button>
        </div>
        {knowledgeBase.guidelines.map(guideline => (
          <Card key={guideline.id} className={styles.patternCard}>
            <CardHeader className={styles.patternHeader}>
              <Text weight="semibold">{guideline.title}</Text>
              <Badge appearance="filled" color="warning">{guideline.priority}</Badge>
            </CardHeader>
            <div className={styles.patternBody}>
              <Text>{guideline.description}</Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.analyticsChart}>
        <Text>Pattern Usage Analytics Chart</Text>
      </div>
      
      <div className={styles.analyticsChart}>
        <Text>User Satisfaction Trends</Text>
      </div>
      
      <div className={styles.analyticsChart}>
        <Text>Error Rate Analysis</Text>
      </div>
    </div>
  );

  const renderRelationshipsTab = () => (
    <div className={styles.tabContent}>
      <Text weight="semibold" size={500} style={{ marginBottom: '16px' }}>
        Pattern Relationships ({knowledgeBase.relationships.length})
      </Text>
      
      {knowledgeBase.relationships.map(relationship => (
        <div key={`${relationship.sourceId}-${relationship.targetId}`} className={styles.relationshipCard}>
          <Text weight="semibold">
            {relationship.sourceId} → {relationship.targetId}
          </Text>
          <Text size={200}>Type: {relationship.type}</Text>
          <Text size={200}>Strength: {(relationship.strength * 100).toFixed(1)}%</Text>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={styles.root}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <Text weight="bold" size={700}>Enhanced UX Repository</Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            Phase 3, Step 3.1 - Design Patterns, Knowledge Base & Analytics
          </Text>
        </div>
      </div>

      {renderStatsCards()}

      <TabList selectedValue={selectedTab} onTabSelect={(e, data) => setSelectedTab(data.value)}>
        <Tab value="patterns" icon={<DocumentRegular />}>Design Patterns</Tab>
        <Tab value="knowledge" icon={<BookRegular />}>Knowledge Base</Tab>
        <Tab value="analytics" icon={<ArrowTrendingRegular />}>Analytics</Tab>
        <Tab value="relationships" icon={<PeopleRegular />}>Relationships</Tab>
      </TabList>

      {selectedTab === 'patterns' && renderPatternsTab()}
      {selectedTab === 'knowledge' && renderKnowledgeBaseTab()}
      {selectedTab === 'analytics' && renderAnalyticsTab()}
      {selectedTab === 'relationships' && renderRelationshipsTab()}

      {/* Add Pattern Dialog would go here */}
      {/* Add Best Practice Dialog would go here */}
      {/* Add Anti-Pattern Dialog would go here */}
      {/* Add Guideline Dialog would go here */}
    </div>
  );
};

export default UXRepositoryEnhanced; 