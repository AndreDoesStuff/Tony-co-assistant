import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Card,
  CardHeader,
  CardFooter,
  Spinner,
  Tooltip,
  Toast,
  ToastTitle,
  ToastBody,
  Input,
  SearchBox,
  Dropdown,
  Option,
  Badge,
  Avatar,
  Divider,
  Tab,
  TabList,
  TabValue,
  SelectTabData,
  SelectTabEvent,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
  TableRowId,
  TableRowData,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Slider,
  Checkbox,
  Label,
  Textarea,
  Link,
} from '@fluentui/react-components';
import styled from 'styled-components';
import { Asset, AssetType, Category, Tag, Collection, AssetLibrary, AssetMetadata } from '../types/tony';
import { eventBus } from '../events/EventBus';
import { tonyStore } from '../store/TonyStore';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '8px',
  },
  searchSection: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flex: 1,
    maxWidth: '600px',
  },
  filtersSection: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  mainContent: {
    display: 'flex',
    gap: '16px',
    height: 'calc(100vh - 200px)',
  },
  sidebar: {
    width: '280px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '16px',
    borderRadius: '8px',
    overflowY: 'auto',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  assetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    padding: '16px',
    overflowY: 'auto',
  },
  assetCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: tokens.shadow8,
      transform: 'translateY(-2px)',
    },
  },
  assetPreview: {
    width: '100%',
    height: '160px',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  assetIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground3,
  },
  assetInfo: {
    padding: '12px',
  },
  assetTitle: {
    fontWeight: '600',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  assetMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginBottom: '8px',
  },
  assetTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginBottom: '8px',
  },
  tag: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 500,
  },
  qualityScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
  },
  dialogSurface: {
    width: '900px',
    maxWidth: '95vw',
  },
  dialogContent: {
    display: 'flex',
    gap: '16px',
    height: '600px',
  },
  previewPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailsPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  formLabel: {
    minWidth: '120px',
    fontWeight: 500,
  },
  formInput: {
    flex: 1,
  },
  relationshipMap: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '4px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: '120px',
  },
  versionHistory: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '4px',
    padding: '8px',
  },
  versionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '4px',
    marginBottom: '4px',
    backgroundColor: tokens.colorNeutralBackground2,
    fontSize: '12px',
  },
  statsCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '12px',
    borderRadius: '6px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '8px',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  statLabel: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
  },
  uploadArea: {
    border: `2px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    padding: '32px',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  uploadAreaActive: {
    // Remove problematic properties
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px',
    color: tokens.colorNeutralForeground3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});

// Enhanced Asset interface with additional properties
interface EnhancedAsset extends Asset {
  versions: AssetVersion[];
  relationships: AssetRelationship[];
  qualityMetrics: QualityMetrics;
  usageStats: UsageStats;
  metadata: EnhancedAssetMetadata;
}

interface AssetVersion {
  id: string;
  version: string;
  url: string;
  changes: string;
  createdAt: number;
  createdBy: string;
  fileSize: number;
}

interface AssetRelationship {
  id: string;
  targetAssetId: string;
  type: 'similar' | 'related' | 'depends_on' | 'used_with' | 'alternative';
  strength: number; // 0-1
  description: string;
  createdAt: number;
}

interface QualityMetrics {
  overall: number; // 0-100
  resolution: number;
  fileSize: number;
  format: number;
  metadata: number;
  usage: number;
  feedback: number;
}

interface UsageStats {
  totalUses: number;
  uniqueUsers: number;
  lastUsed: number;
  averageRating: number;
  downloadCount: number;
  shareCount: number;
}

interface EnhancedAssetMetadata extends AssetMetadata {
  author: string;
  license: string;
  keywords: string[];
  description: string;
  source: string;
  originalFormat: string;
  processingHistory: ProcessingStep[];
}

interface ProcessingStep {
  step: string;
  timestamp: number;
  parameters: Record<string, any>;
}

interface FilterState {
  search: string;
  category: string;
  type: AssetType | 'all';
  tags: string[];
  qualityMin: number;
  qualityMax: number;
  dateRange: { start: number; end: number };
  sortBy: 'name' | 'createdAt' | 'lastUpdated' | 'usage' | 'rating' | 'quality';
  sortOrder: 'asc' | 'desc';
}

interface AssetLibraryState {
  assets: Map<string, EnhancedAsset>;
  categories: Category[];
  tags: Tag[];
  collections: Collection[];
  filters: FilterState;
  selectedAssets: Set<string>;
  viewMode: 'grid' | 'list' | 'detail';
  isLoading: boolean;
  error: string | null;
}

// Types
interface DesignContextProfile {
  id: string;
  name: string;
  method: 'figma' | 'token' | 'manual' | 'material';
  lastSynced: number;
  context: any; // Should match DesignContext from types
}

const DEFAULT_PROFILES: DesignContextProfile[] = [
  {
    id: 'material',
    name: 'Material Design 3 (Fallback)',
    method: 'material',
    lastSynced: Date.now(),
    context: { platform: 'web', designSystem: 'Material Design 3' },
  },
];

const DesignAssetLibrary: React.FC = () => {
  const styles = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<AssetLibraryState>({
    assets: new Map(),
    categories: [],
    tags: [],
    collections: [],
    filters: {
      search: '',
      category: 'all',
      type: 'all',
      tags: [],
      qualityMin: 0,
      qualityMax: 100,
      dateRange: { start: 0, end: Date.now() },
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    selectedAssets: new Set(),
    viewMode: 'grid',
    isLoading: false,
    error: null,
  });

  const [selectedAsset, setSelectedAsset] = useState<EnhancedAsset | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<TabValue>('details');

  const [step, setStep] = useState<'choose' | 'figma' | 'token' | 'manual' | 'done'>('choose');
  const [profiles, setProfiles] = useState<DesignContextProfile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>('material');
  const [figmaToken, setFigmaToken] = useState('');
  const [figmaFileKey, setFigmaFileKey] = useState('');
  const [tokenFile, setTokenFile] = useState<File | null>(null);
  const [manualContext, setManualContext] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize component
  useEffect(() => {
    initializeAssetLibrary();
    subscribeToEvents();
  }, []);

  const initializeAssetLibrary = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Load initial data from Tony Store
      const currentState = tonyStore.getState();
      
      if (currentState.assets) {
        const enhancedAssets = new Map<string, EnhancedAsset>();
        
        // Convert basic assets to enhanced assets
        currentState.assets.assets.forEach(asset => {
          enhancedAssets.set(asset.id, {
            ...asset,
            versions: [{
              id: `${asset.id}_v1`,
              version: '1.0',
              url: asset.url,
              changes: 'Initial version',
              createdAt: asset.createdAt,
              createdBy: 'system',
              fileSize: asset.metadata.size,
            }],
            relationships: [],
            qualityMetrics: calculateQualityMetrics(asset),
            usageStats: {
              totalUses: asset.usage,
              uniqueUsers: 1,
              lastUsed: asset.lastUpdated,
              averageRating: asset.rating,
              downloadCount: 0,
              shareCount: 0,
            },
            metadata: {
              ...asset.metadata,
              author: 'Unknown',
              license: 'MIT',
              keywords: asset.tags,
              description: '',
              source: 'uploaded',
              originalFormat: asset.metadata.format,
              processingHistory: [],
            },
          });
        });

        setState(prev => ({
          ...prev,
          assets: enhancedAssets,
          categories: currentState.assets.categories || [],
          tags: currentState.assets.tags || [],
          collections: currentState.assets.collections || [],
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error initializing asset library:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load asset library' 
      }));
    }
  };

  const subscribeToEvents = () => {
    // Subscribe to asset-related events
    eventBus.subscribe('asset:created', handleAssetCreated);
    eventBus.subscribe('asset:updated', handleAssetUpdated);
    eventBus.subscribe('asset:deleted', handleAssetDeleted);
    eventBus.subscribe('asset:relationship:created', handleRelationshipCreated);
    eventBus.subscribe('asset:quality:updated', handleQualityUpdated);
  };

  const handleAssetCreated = (event: any) => {
    const newAsset = event.data as EnhancedAsset;
    setState(prev => ({
      ...prev,
      assets: new Map(prev.assets).set(newAsset.id, newAsset),
    }));
  };

  const handleAssetUpdated = (event: any) => {
    const updatedAsset = event.data as EnhancedAsset;
    setState(prev => ({
      ...prev,
      assets: new Map(prev.assets).set(updatedAsset.id, updatedAsset),
    }));
  };

  const handleAssetDeleted = (event: any) => {
    const assetId = event.data.assetId;
    setState(prev => {
      const newAssets = new Map(prev.assets);
      newAssets.delete(assetId);
      return { ...prev, assets: newAssets };
    });
  };

  const handleRelationshipCreated = (event: any) => {
    const { assetId, relationship } = event.data;
    setState(prev => {
      const asset = prev.assets.get(assetId);
      if (asset) {
        const updatedAsset = {
          ...asset,
          relationships: [...asset.relationships, relationship],
        };
        return {
          ...prev,
          assets: new Map(prev.assets).set(assetId, updatedAsset),
        };
      }
      return prev;
    });
  };

  const handleQualityUpdated = (event: any) => {
    const { assetId, qualityMetrics } = event.data;
    setState(prev => {
      const asset = prev.assets.get(assetId);
      if (asset) {
        const updatedAsset = {
          ...asset,
          qualityMetrics,
        };
        return {
          ...prev,
          assets: new Map(prev.assets).set(assetId, updatedAsset),
        };
      }
      return prev;
    });
  };

  const calculateQualityMetrics = (asset: Asset): QualityMetrics => {
    // Calculate quality metrics based on asset properties
    const resolution = asset.metadata.dimensions 
      ? Math.min(100, (asset.metadata.dimensions.width * asset.metadata.dimensions.height) / 10000)
      : 50;
    
    const fileSize = Math.max(0, 100 - (asset.metadata.size / 1024 / 1024)); // Penalize large files
    const format = ['png', 'jpg', 'svg', 'webp'].includes(asset.metadata.format.toLowerCase()) ? 100 : 70;
    const metadata = asset.tags.length > 0 ? Math.min(100, asset.tags.length * 20) : 30;
    const usage = Math.min(100, asset.usage * 10);
    const feedback = asset.rating * 20;

    const overall = Math.round((resolution + fileSize + format + metadata + usage + feedback) / 6);

    return {
      overall,
      resolution,
      fileSize,
      format,
      metadata,
      usage,
      feedback,
    };
  };

  const filteredAssets = useMemo(() => {
    let assets = Array.from(state.assets.values());

    // Apply search filter
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      assets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        asset.metadata.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (state.filters.category !== 'all') {
      assets = assets.filter(asset => asset.category === state.filters.category);
    }

    // Apply type filter
    if (state.filters.type !== 'all') {
      assets = assets.filter(asset => asset.type === state.filters.type);
    }

    // Apply tag filters
    if (state.filters.tags.length > 0) {
      assets = assets.filter(asset =>
        state.filters.tags.every(tag => asset.tags.includes(tag))
      );
    }

    // Apply quality filters
    assets = assets.filter(asset =>
      asset.qualityMetrics.overall >= state.filters.qualityMin &&
      asset.qualityMetrics.overall <= state.filters.qualityMax
    );

    // Apply date range filter
    assets = assets.filter(asset =>
      asset.createdAt >= state.filters.dateRange.start &&
      asset.createdAt <= state.filters.dateRange.end
    );

    // Apply sorting
    assets.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'lastUpdated':
          aValue = a.lastUpdated;
          bValue = b.lastUpdated;
          break;
        case 'usage':
          aValue = a.usage;
          bValue = b.usage;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'quality':
          aValue = a.qualityMetrics.overall;
          bValue = b.qualityMetrics.overall;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (state.filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return assets;
  }, [state.assets, state.filters]);

  const handleAssetClick = (asset: EnhancedAsset) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };

  const handleUploadClick = () => {
    setIsUploadDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadFiles(files);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      for (const file of uploadFiles) {
        const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Create new asset
        const newAsset: EnhancedAsset = {
          id: assetId,
          name: file.name,
          type: getAssetTypeFromFile(file),
          url: URL.createObjectURL(file),
          metadata: {
            size: file.size,
            format: file.type || 'unknown',
            dimensions: await getImageDimensions(file),
            author: 'current_user',
            license: 'MIT',
            keywords: [],
            description: '',
            source: 'uploaded',
            originalFormat: file.type || 'unknown',
            processingHistory: [],
          },
          tags: [],
          category: 'uncategorized',
          usage: 0,
          rating: 0,
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          versions: [{
            id: `${assetId}_v1`,
            version: '1.0',
            url: URL.createObjectURL(file),
            changes: 'Initial upload',
            createdAt: Date.now(),
            createdBy: 'current_user',
            fileSize: file.size,
          }],
          relationships: [],
          qualityMetrics: {
            overall: 50,
            resolution: 50,
            fileSize: 50,
            format: 50,
            metadata: 30,
            usage: 0,
            feedback: 0,
          },
          usageStats: {
            totalUses: 0,
            uniqueUsers: 1,
            lastUsed: Date.now(),
            averageRating: 0,
            downloadCount: 0,
            shareCount: 0,
          },
        };

        // Update state
        setState(prev => ({
          ...prev,
          assets: new Map(prev.assets).set(assetId, newAsset),
        }));

        // Publish event
        await eventBus.publish({
          type: 'asset:created',
          source: 'DesignAssetLibrary',
          data: newAsset,
          context: { file },
          timestamp: Date.now(),
          id: `event_${Date.now()}`,
          priority: 'medium',
        });

        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      setUploadFiles([]);
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      setState(prev => ({ ...prev, error: 'Upload failed' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getAssetTypeFromFile = (file: File): AssetType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'sound';
    if (file.type.includes('document') || file.type.includes('pdf')) return 'document';
    return 'document';
  };

  const getImageDimensions = async (file: File): Promise<{ width: number; height: number } | undefined> => {
    if (!file.type.startsWith('image/')) return undefined;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'image': return <span className={styles.assetIcon}>🖼️</span>;
      case 'video': return <span className={styles.assetIcon}>🎬</span>;
      case 'sound': return <span className={styles.assetIcon}>🔊</span>;
      case 'document': return <span className={styles.assetIcon}>📄</span>;
      case 'template': return <span className={styles.assetIcon}>📑</span>;
      case 'icon': return <span className={styles.assetIcon}>🔣</span>;
      default: return <span className={styles.assetIcon}>📄</span>;
    }
  };

  const renderAssetCard = (asset: EnhancedAsset) => (
    <Card key={asset.id} className={styles.assetCard} onClick={() => handleAssetClick(asset)}>
      <div className={styles.assetPreview}>
        {asset.type === 'image' ? (
          <img src={asset.url} alt={asset.name} className={styles.assetImage} />
        ) : (
          getAssetIcon(asset.type)
        )}
      </div>
      <div className={styles.assetInfo}>
        <Text className={styles.assetTitle}>{asset.name}</Text>
        <div className={styles.assetMeta}>
          <Text>{asset.metadata.format.toUpperCase()}</Text>
          <div className={styles.qualityScore}>
            {asset.qualityMetrics.overall}
          </div>
        </div>
        <div className={styles.assetTags}>
          {asset.tags.slice(0, 3).map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
          {asset.tags.length > 3 && (
            <span className={styles.tag}>+{asset.tags.length - 3}</span>
          )}
        </div>
      </div>
    </Card>
  );

  const renderSidebar = () => (
    <div className={styles.sidebar}>
      <div className={styles.statsCard}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{state.assets.size}</div>
            <div className={styles.statLabel}>Assets</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{state.categories.length}</div>
            <div className={styles.statLabel}>Categories</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{state.tags.length}</div>
            <div className={styles.statLabel}>Tags</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{state.collections.length}</div>
            <div className={styles.statLabel}>Collections</div>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <Label>Categories</Label>
        <Dropdown
          value={state.filters.category}
          onOptionSelect={(_, data) => setState(prev => ({
            ...prev,
            filters: { ...prev.filters, category: data.optionValue || 'all' }
          }))}
        >
          <Option value="all">All Categories</Option>
          {state.categories.map(category => (
            <Option key={category.id} value={category.id}>{category.name}</Option>
          ))}
        </Dropdown>
      </div>

      <div className={styles.formSection}>
        <Label>Asset Type</Label>
        <Dropdown
          value={state.filters.type}
          onOptionSelect={(_, data) => setState(prev => ({
            ...prev,
            filters: { ...prev.filters, type: (data.optionValue as AssetType) || 'all' }
          }))}
        >
          <Option value="all">All Types</Option>
          <Option value="image">Images</Option>
          <Option value="video">Videos</Option>
          <Option value="sound">Audio</Option>
          <Option value="document">Documents</Option>
          <Option value="template">Templates</Option>
          <Option value="icon">Icons</Option>
        </Dropdown>
      </div>

      <div className={styles.formSection}>
        <Label>Quality Range</Label>
        <div style={{ padding: '0 8px' }}>
          <Slider
            min={0}
            max={100}
            value={state.filters.qualityMin}
            onChange={(_, data) => setState(prev => ({
              ...prev,
              filters: { ...prev.filters, qualityMin: data.value }
            }))}
          />
          <Slider
            min={0}
            max={100}
            value={state.filters.qualityMax}
            onChange={(_, data) => setState(prev => ({
              ...prev,
              filters: { ...prev.filters, qualityMax: data.value }
            }))}
          />
        </div>
        <Text size={200}>
          {state.filters.qualityMin} - {state.filters.qualityMax}
        </Text>
      </div>

      <div className={styles.formSection}>
        <Label>Sort By</Label>
        <Dropdown
          value={state.filters.sortBy}
          onOptionSelect={(_, data) => setState(prev => ({
            ...prev,
            filters: { ...prev.filters, sortBy: data.optionValue as any || 'createdAt' }
          }))}
        >
          <Option value="name">Name</Option>
          <Option value="createdAt">Date Created</Option>
          <Option value="lastUpdated">Last Updated</Option>
          <Option value="usage">Usage</Option>
          <Option value="rating">Rating</Option>
          <Option value="quality">Quality</Option>
        </Dropdown>
      </div>
    </div>
  );

  // Helper: Format date
  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  // Handle Figma Sync
  const handleFigmaSync = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate Figma API call
      await new Promise((res) => setTimeout(res, 1200));
      const newProfile: DesignContextProfile = {
        id: `figma-${Date.now()}`,
        name: `Figma Library (${figmaFileKey})`,
        method: 'figma',
        lastSynced: Date.now(),
        context: {
          platform: 'web',
          designSystem: 'Figma',
          figmaToken,
          figmaFileKey,
          // ...tokens, components, styles would be parsed here
        },
      };
      setProfiles((prev) => [newProfile, ...prev.filter((p) => p.id !== 'material')]);
      setActiveProfileId(newProfile.id);
      setStep('done');
    } catch (e) {
      setError('Failed to sync with Figma.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Token File Upload
  const handleTokenUpload = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!tokenFile) throw new Error('No file selected');
      // Simulate parsing
      await new Promise((res) => setTimeout(res, 1000));
      const newProfile: DesignContextProfile = {
        id: `token-${Date.now()}`,
        name: `Token File (${tokenFile.name})`,
        method: 'token',
        lastSynced: Date.now(),
        context: {
          platform: 'web',
          designSystem: 'Custom Token File',
          fileName: tokenFile.name,
          // ...parsed tokens here
        },
      };
      setProfiles((prev) => [newProfile, ...prev.filter((p) => p.id !== 'material')]);
      setActiveProfileId(newProfile.id);
      setStep('done');
    } catch (e) {
      setError('Failed to parse token file.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual Builder
  const handleManualSave = () => {
    setLoading(true);
    setError(null);
    try {
      const newProfile: DesignContextProfile = {
        id: `manual-${Date.now()}`,
        name: `Manual Design System`,
        method: 'manual',
        lastSynced: Date.now(),
        context: manualContext,
      };
      setProfiles((prev) => [newProfile, ...prev.filter((p) => p.id !== 'material')]);
      setActiveProfileId(newProfile.id);
      setStep('done');
    } catch (e) {
      setError('Failed to save manual design system.');
    } finally {
      setLoading(false);
    }
  };

  // UI for onboarding steps
  const renderOnboarding = () => {
    if (step === 'choose') {
      return (
        <Card>
          <CardHeader>
            <h2>Connect your design system</h2>
            <p>Select a method to onboard your design system:</p>
          </CardHeader>
          <div style={{ display: 'flex', gap: 24, margin: '24px 0' }}>
            <Button appearance="primary" onClick={() => setStep('figma')}>Figma Sync</Button>
            <Button appearance="primary" onClick={() => setStep('token')}>Token File Upload</Button>
            <Button appearance="primary" onClick={() => setStep('manual')}>Manual Builder</Button>
          </div>
          <CardFooter>
            <p style={{ color: '#888' }}>Or use fallback: <b>Material Design 3</b></p>
          </CardFooter>
        </Card>
      );
    }
    if (step === 'figma') {
      return (
        <Card>
          <CardHeader>
            <h3>Figma Sync</h3>
            <p>Connect your Figma library to extract tokens, components, and styles.</p>
          </CardHeader>
          <Label>Figma Personal Access Token</Label>
          <Input value={figmaToken} onChange={(_, d) => setFigmaToken(d.value)} placeholder="Figma Token" />
          <Label>Figma File Key</Label>
          <Input value={figmaFileKey} onChange={(_, d) => setFigmaFileKey(d.value)} placeholder="Figma File Key" />
          <div style={{ marginTop: 16 }}>
            <Button appearance="primary" onClick={handleFigmaSync} disabled={loading || !figmaToken || !figmaFileKey}>Sync Figma</Button>
            <Button onClick={() => setStep('choose')} style={{ marginLeft: 8 }}>Back</Button>
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </Card>
      );
    }
    if (step === 'token') {
      return (
        <Card>
          <CardHeader>
            <h3>Token File Upload</h3>
            <p>Upload a design token file (tokens.json, SCSS, or TypeScript).</p>
          </CardHeader>
          <input
            type="file"
            accept=".json,.scss,.ts,.tsx"
            onChange={(e) => setTokenFile(e.target.files?.[0] || null)}
          />
          <div style={{ marginTop: 16 }}>
            <Button appearance="primary" onClick={handleTokenUpload} disabled={loading || !tokenFile}>Upload & Parse</Button>
            <Button onClick={() => setStep('choose')} style={{ marginLeft: 8 }}>Back</Button>
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </Card>
      );
    }
    if (step === 'manual') {
      return (
        <Card>
          <CardHeader>
            <h3>Manual Builder</h3>
            <p>Define your design system values manually.</p>
          </CardHeader>
          <Label>Brand Colors (comma separated)</Label>
          <Input value={manualContext.colors || ''} onChange={(_, d) => setManualContext({ ...manualContext, colors: d.value })} placeholder="#FF0000, #00FF00, #0000FF" />
          <Label>Typography Scale (comma separated)</Label>
          <Input value={manualContext.typography || ''} onChange={(_, d) => setManualContext({ ...manualContext, typography: d.value })} placeholder="12, 14, 16, 20, 24" />
          <Label>Spacing Scale (comma separated)</Label>
          <Input value={manualContext.spacing || ''} onChange={(_, d) => setManualContext({ ...manualContext, spacing: d.value })} placeholder="4, 8, 16, 32" />
          <Label>Radii (comma separated)</Label>
          <Input value={manualContext.radii || ''} onChange={(_, d) => setManualContext({ ...manualContext, radii: d.value })} placeholder="2, 4, 8" />
          <Label>Shadows (comma separated)</Label>
          <Input value={manualContext.shadows || ''} onChange={(_, d) => setManualContext({ ...manualContext, shadows: d.value })} placeholder="0 1px 2px #000, 0 2px 4px #000" />
          <div style={{ marginTop: 16 }}>
            <Button appearance="primary" onClick={handleManualSave} disabled={loading}>Save Design System</Button>
            <Button onClick={() => setStep('choose')} style={{ marginLeft: 8 }}>Back</Button>
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </Card>
      );
    }
    return null;
  };

  // UI for active profile and switching
  const renderProfiles = () => (
    <Card>
      <CardHeader>
        <h3>Design System Profiles</h3>
        <p>Switch between connected design systems.</p>
      </CardHeader>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {profiles.map((profile) => (
          <Card key={profile.id} style={{ minWidth: '220px', border: profile.id === activeProfileId ? '2px solid #0078d4' : '1px solid #444' }}>
            <CardHeader>
              <b>{profile.name}</b>
              <Badge appearance={profile.id === activeProfileId ? 'filled' : 'outline'}>{profile.method.toUpperCase()}</Badge>
            </CardHeader>
            <div style={{ fontSize: '12px', color: '#888' }}>Last synced: {formatDate(profile.lastSynced)}</div>
            <CardFooter>
              <Button size="small" onClick={() => setActiveProfileId(profile.id)} disabled={profile.id === activeProfileId}>Activate</Button>
              {['figma','token','manual'].includes(profile.method) && (
                <Tooltip content="Re-sync or re-import this design system" relationship="label">
                  <Button size="small" onClick={() => setStep(profile.method as any)}>Re-sync</Button>
                </Tooltip>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <CardFooter>
        <Button appearance="primary" onClick={() => setStep('choose')}>Connect New Design System</Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.searchSection}>
          <SearchBox
            placeholder="Search assets..."
            value={state.filters.search}
            onChange={(_, data) => setState(prev => ({
              ...prev,
              filters: { ...prev.filters, search: data.value }
            }))}
          />
          <Button
            appearance="subtle"
            onClick={() => {/* Toggle advanced filters */}}
          />
        </div>
        <div className={styles.filtersSection}>
          <Button
            appearance="primary"
            onClick={handleUploadClick}
          >
            Upload Assets
          </Button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {renderSidebar()}
        
        <div className={styles.content}>
          {state.isLoading ? (
            <div className={styles.emptyState}>
              <Spinner size="large" />
              <Text>Loading assets...</Text>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.assetIcon}>📄</span>
              <Text>No assets found</Text>
              <Text size={200}>Try adjusting your filters or upload new assets</Text>
            </div>
          ) : (
            <div className={styles.assetGrid}>
              {filteredAssets.map(renderAssetCard)}
            </div>
          )}
        </div>
      </div>

      {/* Asset Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(_, data) => setIsDialogOpen(data.open)}>
        <DialogSurface className={styles.dialogSurface}>
          <DialogBody>
            <DialogTitle>Asset Details</DialogTitle>
            <DialogContent className={styles.dialogContent}>
              {selectedAsset && (
                <>
                  <div className={styles.previewPanel}>
                    <div className={styles.assetPreview}>
                      {selectedAsset.type === 'image' ? (
                        <img src={selectedAsset.url} alt={selectedAsset.name} className={styles.assetImage} />
                      ) : (
                        getAssetIcon(selectedAsset.type)
                      )}
                    </div>
                    
                    <TabList selectedValue={activeTab} onTabSelect={(_, data) => setActiveTab(data.value)}>
                      <Tab value="details">Details</Tab>
                      <Tab value="relationships">Relationships</Tab>
                      <Tab value="versions">Versions</Tab>
                      <Tab value="quality">Quality</Tab>
                    </TabList>
                  </div>

                  <div className={styles.detailsPanel}>
                    {activeTab === 'details' && (
                      <div className={styles.formSection}>
                        <div className={styles.formRow}>
                          <Text className={styles.formLabel}>Name:</Text>
                          <Input className={styles.formInput} value={selectedAsset.name} />
                        </div>
                        <div className={styles.formRow}>
                          <Text className={styles.formLabel}>Type:</Text>
                          <Text>{selectedAsset.type}</Text>
                        </div>
                        <div className={styles.formRow}>
                          <Text className={styles.formLabel}>Category:</Text>
                          <Text>{selectedAsset.category}</Text>
                        </div>
                        <div className={styles.formRow}>
                          <Text className={styles.formLabel}>Tags:</Text>
                          <div className={styles.assetTags}>
                            {selectedAsset.tags.map(tag => (
                              <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className={styles.formRow}>
                          <Text className={styles.formLabel}>Quality Score:</Text>
                          <Text>{selectedAsset.qualityMetrics.overall}/100</Text>
                        </div>
                        <div className={styles.formRow}>
                          <Text className={styles.formLabel}>Usage:</Text>
                          <Text>{selectedAsset.usageStats.totalUses} times</Text>
                        </div>
                        <div className={styles.formRow}>
                          <Text className={styles.formLabel}>Rating:</Text>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star}>
                                {star <= selectedAsset.rating ? <span className={styles.assetIcon}>⭐</span> : <span className={styles.assetIcon}>☆</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'relationships' && (
                      <div className={styles.relationshipMap}>
                        <Text weight="semibold" style={{ marginBottom: '8px' }}>Related Assets</Text>
                        {selectedAsset.relationships.length === 0 ? (
                          <Text size={200}>No relationships found</Text>
                        ) : (
                          selectedAsset.relationships.map(rel => (
                            <div key={rel.id} style={{ marginBottom: '8px' }}>
                              <Text size={200}>
                                {rel.type} - {rel.description} (Strength: {Math.round(rel.strength * 100)}%)
                              </Text>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'versions' && (
                      <div className={styles.versionHistory}>
                        <Text weight="semibold" style={{ marginBottom: '8px' }}>Version History</Text>
                        {selectedAsset.versions.map(version => (
                          <div key={version.id} className={styles.versionItem}>
                            <div>
                              <Text size={200}>v{version.version}</Text>
                              <Text size={100}>{version.changes}</Text>
                            </div>
                            <Text size={100}>
                              {new Date(version.createdAt).toLocaleDateString()}
                            </Text>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'quality' && (
                      <div className={styles.formSection}>
                        <Text weight="semibold" style={{ marginBottom: '8px' }}>Quality Metrics</Text>
                        <div className={styles.statsGrid}>
                          <div className={styles.statItem}>
                            <div className={styles.statValue}>{selectedAsset.qualityMetrics.overall}</div>
                            <div className={styles.statLabel}>Overall</div>
                          </div>
                          <div className={styles.statItem}>
                            <div className={styles.statValue}>{selectedAsset.qualityMetrics.resolution}</div>
                            <div className={styles.statLabel}>Resolution</div>
                          </div>
                          <div className={styles.statItem}>
                            <div className={styles.statValue}>{selectedAsset.qualityMetrics.fileSize}</div>
                            <div className={styles.statLabel}>File Size</div>
                          </div>
                          <div className={styles.statItem}>
                            <div className={styles.statValue}>{selectedAsset.qualityMetrics.format}</div>
                            <div className={styles.statLabel}>Format</div>
                          </div>
                          <div className={styles.statItem}>
                            <div className={styles.statValue}>{selectedAsset.qualityMetrics.metadata}</div>
                            <div className={styles.statLabel}>Metadata</div>
                          </div>
                          <div className={styles.statItem}>
                            <div className={styles.statValue}>{selectedAsset.qualityMetrics.usage}</div>
                            <div className={styles.statLabel}>Usage</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button appearance="primary">
                Edit Asset
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={(_, data) => setIsUploadDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Upload Assets</DialogTitle>
            <DialogContent>
              <div className={styles.uploadArea}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  appearance="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Files
                </Button>
                <Text size={200} style={{ marginTop: '8px' }}>
                  Drag and drop files here or click to browse
                </Text>
              </div>
              
              {uploadFiles.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Text weight="semibold">Selected Files:</Text>
                  {uploadFiles.map(file => (
                    <div key={file.name} style={{ marginTop: '8px' }}>
                      <Text size={200}>{file.name}</Text>
                      {uploadProgress[file.name] !== undefined && (
                        <div style={{ width: '100%', height: '4px', backgroundColor: tokens.colorNeutralStroke1, borderRadius: '2px', marginTop: '4px' }}>
                          <div
                            style={{
                              width: `${uploadProgress[file.name]}%`,
                              height: '100%',
                              backgroundColor: tokens.colorBrandStroke1,
                              borderRadius: '2px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleUpload}
                disabled={uploadFiles.length === 0}
              >
                Upload
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Error Toast */}
      {state.error && (
        <Toast>
          <ToastTitle>Error</ToastTitle>
          <ToastBody>{state.error}</ToastBody>
        </Toast>
      )}

      {step === 'choose' || step === 'figma' || step === 'token' || step === 'manual' ? renderOnboarding() : renderProfiles()}
    </div>
  );
};

export default DesignAssetLibrary;
