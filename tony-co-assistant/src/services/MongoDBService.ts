import { MemoryStore, MemoryNode } from '../types/tony';

/**
 * MongoDB Configuration
 */
interface MongoDBConfig {
  enabled: boolean;
  connectionString: string;
  databaseName: string;
  collections: {
    memory: string;
    uxRepository: string;
    learningSystem: string;
    designSystem: string;
    schoolBench: string;
    assetLibrary: string;
  };
  syncInterval: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
  apiEndpoint?: string; // Backend API endpoint for MongoDB operations
  useDataAPI: boolean; // Use MongoDB Atlas Data API
  dataAPIUrl?: string; // MongoDB Atlas Data API URL
  dataAPIKey?: string; // MongoDB Atlas Data API Key
}

/**
 * MongoDB Document Structure
 */
interface MemoryDocument {
  _id?: string;
  userId: string;
  sessionId: string;
  data: MemoryStore;
  lastSynced: number;
  createdAt: number;
  updatedAt: number;
}

interface UXRepositoryDocument {
  _id?: string;
  userId: string;
  sessionId: string;
  data: any;
  lastSynced: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * MongoDB Service for Cloud Storage (Browser-Compatible)
 * 
 * This service provides two modes:
 * 1. Backend API Mode: Communicates with a backend service that handles MongoDB operations
 * 2. Data API Mode: Uses MongoDB Atlas Data API directly (requires setup)
 */
export class MongoDBService {
  private config: MongoDBConfig;
  private isConnected: boolean = false;
  private syncTimer?: NodeJS.Timeout;
  private pendingOperations: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.config = {
      enabled: process.env.REACT_APP_ENABLE_MONGODB === 'true',
      connectionString: process.env.REACT_APP_MONGODB_URI || '',
      databaseName: process.env.REACT_APP_MONGODB_DB || 'tony_assistant',
      collections: {
        memory: 'memory',
        uxRepository: 'ux_repository',
        learningSystem: 'learning_system',
        designSystem: 'design_system',
        schoolBench: 'school_bench',
        assetLibrary: 'asset_library'
      },
      syncInterval: parseInt(process.env.REACT_APP_MONGODB_SYNC_INTERVAL || '30000'),
      retryAttempts: parseInt(process.env.REACT_APP_MONGODB_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.REACT_APP_MONGODB_RETRY_DELAY || '1000'),
      apiEndpoint: process.env.REACT_APP_MONGODB_API_ENDPOINT,
      useDataAPI: process.env.REACT_APP_MONGODB_USE_DATA_API === 'true',
      dataAPIUrl: process.env.REACT_APP_MONGODB_DATA_API_URL,
      dataAPIKey: process.env.REACT_APP_MONGODB_DATA_API_KEY
    };
  }

  /**
   * Initialize MongoDB connection
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('MongoDB disabled');
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.connectToMongoDB();
    return this.connectionPromise;
  }

  /**
   * Connect to MongoDB (test connection)
   */
  private async connectToMongoDB(): Promise<void> {
    try {
      console.log('Testing MongoDB connection...');
      
      // Test connection based on mode
      if (this.config.useDataAPI && this.config.dataAPIUrl) {
        await this.testDataAPIConnection();
      } else if (this.config.apiEndpoint) {
        await this.testBackendAPIConnection();
      } else {
        console.warn('No MongoDB API endpoint or Data API configured. Using local storage only.');
        this.isConnected = false;
        return;
      }

      this.isConnected = true;
      console.log('MongoDB connected successfully');

      // Start sync timer
      this.startSyncTimer();

    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Test MongoDB Atlas Data API connection
   */
  private async testDataAPIConnection(): Promise<void> {
    if (!this.config.dataAPIUrl || !this.config.dataAPIKey) {
      throw new Error('MongoDB Data API URL and Key are required');
    }

    const response = await fetch(`${this.config.dataAPIUrl}/action/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.dataAPIKey
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: this.config.databaseName,
        collection: this.config.collections.memory,
        filter: {},
        limit: 1
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB Data API test failed: ${response.statusText}`);
    }

    console.log('MongoDB Data API connection successful');
  }

  /**
   * Test backend API connection
   */
  private async testBackendAPIConnection(): Promise<void> {
    if (!this.config.apiEndpoint) {
      throw new Error('MongoDB API endpoint is required');
    }

    const response = await fetch(`${this.config.apiEndpoint}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API test failed: ${response.statusText}`);
    }

    console.log('Backend API connection successful');
  }

  /**
   * Save memory data to MongoDB
   */
  async saveMemory(userId: string, sessionId: string, memoryStore: MemoryStore): Promise<void> {
    if (!this.isConnected) {
      this.queueOperation(() => this.saveMemory(userId, sessionId, memoryStore));
      return;
    }

    try {
      const document: MemoryDocument = {
        userId,
        sessionId,
        data: memoryStore,
        lastSynced: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      if (this.config.useDataAPI && this.config.dataAPIUrl) {
        await this.saveViaDataAPI('memory', document);
      } else if (this.config.apiEndpoint) {
        await this.saveViaBackendAPI('memory', document);
      } else {
        console.warn('No MongoDB connection available, data not saved to cloud');
        return;
      }

      console.log(`Memory data saved for user ${userId}, session ${sessionId}`);

    } catch (error) {
      console.error('Failed to save memory to MongoDB:', error);
      this.queueOperation(() => this.saveMemory(userId, sessionId, memoryStore));
    }
  }

  /**
   * Load memory data from MongoDB
   */
  async loadMemory(userId: string, sessionId: string): Promise<MemoryStore | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      let result: any = null;

      if (this.config.useDataAPI && this.config.dataAPIUrl) {
        result = await this.loadViaDataAPI('memory', { userId, sessionId });
      } else if (this.config.apiEndpoint) {
        result = await this.loadViaBackendAPI('memory', { userId, sessionId });
      } else {
        return null;
      }

      if (result && result.data) {
        console.log(`Memory data loaded for user ${userId}, session ${sessionId}`);
        return result.data as MemoryStore;
      }

      return null;

    } catch (error) {
      console.error('Failed to load memory from MongoDB:', error);
      return null;
    }
  }

  /**
   * Save data via MongoDB Atlas Data API
   */
  private async saveViaDataAPI(collection: string, document: any): Promise<void> {
    if (!this.config.dataAPIUrl || !this.config.dataAPIKey) {
      throw new Error('MongoDB Data API not configured');
    }

    const response = await fetch(`${this.config.dataAPIUrl}/action/replaceOne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.dataAPIKey
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: this.config.databaseName,
        collection: this.config.collections[collection as keyof typeof this.config.collections],
        filter: { userId: document.userId, sessionId: document.sessionId },
        replacement: document,
        upsert: true
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB Data API save failed: ${response.statusText}`);
    }
  }

  /**
   * Load data via MongoDB Atlas Data API
   */
  private async loadViaDataAPI(collection: string, filter: any): Promise<any> {
    if (!this.config.dataAPIUrl || !this.config.dataAPIKey) {
      throw new Error('MongoDB Data API not configured');
    }

    const response = await fetch(`${this.config.dataAPIUrl}/action/findOne`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.dataAPIKey
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: this.config.databaseName,
        collection: this.config.collections[collection as keyof typeof this.config.collections],
        filter: filter
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB Data API load failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.document;
  }

  /**
   * Save data via backend API
   */
  private async saveViaBackendAPI(collection: string, document: any): Promise<void> {
    if (!this.config.apiEndpoint) {
      throw new Error('Backend API endpoint not configured');
    }

    const response = await fetch(`${this.config.apiEndpoint}/api/mongodb/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(document)
    });

    if (!response.ok) {
      throw new Error(`Backend API save failed: ${response.statusText}`);
    }
  }

  /**
   * Load data via backend API
   */
  private async loadViaBackendAPI(collection: string, filter: any): Promise<any> {
    if (!this.config.apiEndpoint) {
      throw new Error('Backend API endpoint not configured');
    }

    const queryParams = new URLSearchParams(filter).toString();
    const response = await fetch(`${this.config.apiEndpoint}/api/mongodb/${collection}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API load failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Save UX Repository data to MongoDB
   */
  async saveUXRepository(userId: string, sessionId: string, data: any): Promise<void> {
    if (!this.isConnected) {
      this.queueOperation(() => this.saveUXRepository(userId, sessionId, data));
      return;
    }

    try {
      const document: UXRepositoryDocument = {
        userId,
        sessionId,
        data,
        lastSynced: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      if (this.config.useDataAPI && this.config.dataAPIUrl) {
        await this.saveViaDataAPI('uxRepository', document);
      } else if (this.config.apiEndpoint) {
        await this.saveViaBackendAPI('uxRepository', document);
      } else {
        console.warn('No MongoDB connection available, data not saved to cloud');
        return;
      }

      console.log(`UX Repository data saved for user ${userId}, session ${sessionId}`);

    } catch (error) {
      console.error('Failed to save UX Repository to MongoDB:', error);
      this.queueOperation(() => this.saveUXRepository(userId, sessionId, data));
    }
  }

  /**
   * Load UX Repository data from MongoDB
   */
  async loadUXRepository(userId: string, sessionId: string): Promise<any | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      let result: any = null;

      if (this.config.useDataAPI && this.config.dataAPIUrl) {
        result = await this.loadViaDataAPI('uxRepository', { userId, sessionId });
      } else if (this.config.apiEndpoint) {
        result = await this.loadViaBackendAPI('uxRepository', { userId, sessionId });
      } else {
        return null;
      }

      if (result && result.data) {
        console.log(`UX Repository data loaded for user ${userId}, session ${sessionId}`);
        return result.data;
      }

      return null;

    } catch (error) {
      console.error('Failed to load UX Repository from MongoDB:', error);
      return null;
    }
  }

  /**
   * Save any component data to MongoDB
   */
  async saveComponentData(
    component: keyof MongoDBConfig['collections'],
    userId: string,
    sessionId: string,
    data: any
  ): Promise<void> {
    if (!this.isConnected) {
      this.queueOperation(() => this.saveComponentData(component, userId, sessionId, data));
      return;
    }

    try {
      const document = {
        userId,
        sessionId,
        data,
        lastSynced: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      if (this.config.useDataAPI && this.config.dataAPIUrl) {
        await this.saveViaDataAPI(component, document);
      } else if (this.config.apiEndpoint) {
        await this.saveViaBackendAPI(component, document);
      } else {
        console.warn('No MongoDB connection available, data not saved to cloud');
        return;
      }

      console.log(`${component} data saved for user ${userId}, session ${sessionId}`);

    } catch (error) {
      console.error(`Failed to save ${component} to MongoDB:`, error);
      this.queueOperation(() => this.saveComponentData(component, userId, sessionId, data));
    }
  }

  /**
   * Load component data from MongoDB
   */
  async loadComponentData(
    component: keyof MongoDBConfig['collections'],
    userId: string,
    sessionId: string
  ): Promise<any | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      let result: any = null;

      if (this.config.useDataAPI && this.config.dataAPIUrl) {
        result = await this.loadViaDataAPI(component, { userId, sessionId });
      } else if (this.config.apiEndpoint) {
        result = await this.loadViaBackendAPI(component, { userId, sessionId });
      } else {
        return null;
      }

      if (result && result.data) {
        console.log(`${component} data loaded for user ${userId}, session ${sessionId}`);
        return result.data;
      }

      return null;

    } catch (error) {
      console.error(`Failed to load ${component} from MongoDB:`, error);
      return null;
    }
  }

  /**
   * Delete user data from MongoDB
   */
  async deleteUserData(userId: string, sessionId?: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const filter = sessionId ? { userId, sessionId } : { userId };
      const collections = Object.keys(this.config.collections);

      for (const collection of collections) {
        if (this.config.useDataAPI && this.config.dataAPIUrl) {
          await this.deleteViaDataAPI(collection, filter);
        } else if (this.config.apiEndpoint) {
          await this.deleteViaBackendAPI(collection, filter);
        }
      }

      console.log(`Successfully deleted all data for user ${userId}${sessionId ? `, session ${sessionId}` : ''}`);

    } catch (error) {
      console.error('Failed to delete user data from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Delete data via MongoDB Atlas Data API
   */
  private async deleteViaDataAPI(collection: string, filter: any): Promise<void> {
    if (!this.config.dataAPIUrl || !this.config.dataAPIKey) {
      throw new Error('MongoDB Data API not configured');
    }

    const response = await fetch(`${this.config.dataAPIUrl}/action/deleteMany`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.dataAPIKey
      },
      body: JSON.stringify({
        dataSource: 'Cluster0',
        database: this.config.databaseName,
        collection: this.config.collections[collection as keyof typeof this.config.collections],
        filter: filter
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB Data API delete failed: ${response.statusText}`);
    }
  }

  /**
   * Delete data via backend API
   */
  private async deleteViaBackendAPI(collection: string, filter: any): Promise<void> {
    if (!this.config.apiEndpoint) {
      throw new Error('Backend API endpoint not configured');
    }

    const response = await fetch(`${this.config.apiEndpoint}/api/mongodb/${collection}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filter)
    });

    if (!response.ok) {
      throw new Error(`Backend API delete failed: ${response.statusText}`);
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<any> {
    if (!this.isConnected) {
      return null;
    }

    try {
      if (this.config.apiEndpoint) {
        const response = await fetch(`${this.config.apiEndpoint}/api/mongodb/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // For Data API, we can't easily get stats without additional setup
      return {
        connected: this.isConnected,
        mode: this.config.useDataAPI ? 'Data API' : 'Backend API',
        pendingOperations: this.pendingOperations.length
      };

    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  }

  /**
   * Perform MongoDB operation with retry logic
   */
  private async performMongoOperation<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`MongoDB operation failed (attempt ${attempt}/${this.config.retryAttempts}):`, error);
        
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Queue operation for later execution
   */
  private queueOperation(operation: () => Promise<void>): void {
    this.pendingOperations.push(operation);
    
    if (!this.isProcessing) {
      this.processPendingOperations();
    }
  }

  /**
   * Process pending operations
   */
  private async processPendingOperations(): Promise<void> {
    if (this.isProcessing || this.pendingOperations.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.pendingOperations.length > 0 && this.isConnected) {
        const operation = this.pendingOperations.shift();
        if (operation) {
          try {
            await operation();
          } catch (error) {
            console.error('Failed to process pending operation:', error);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start sync timer
   */
  private startSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.processPendingOperations();
    }, this.config.syncInterval);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: boolean; pendingOperations: number; mode: string } {
    return {
      connected: this.isConnected,
      pendingOperations: this.pendingOperations.length,
      mode: this.config.useDataAPI ? 'Data API' : this.config.apiEndpoint ? 'Backend API' : 'Local Only'
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MongoDBConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable/disable MongoDB
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    if (enabled && !this.isConnected) {
      this.initialize();
    } else if (!enabled) {
      this.isConnected = false;
      if (this.syncTimer) {
        clearInterval(this.syncTimer);
      }
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      
      // Test with a simple operation
      if (this.config.useDataAPI && this.config.dataAPIUrl) {
        await this.testDataAPIConnection();
      } else if (this.config.apiEndpoint) {
        await this.testBackendAPIConnection();
      } else {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      return false;
    }
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    // Process any remaining pending operations
    await this.processPendingOperations();

    this.isConnected = false;
    this.connectionPromise = null;
    
    console.log('MongoDB service destroyed');
  }
}

// Export singleton instance
export const mongoDBService = new MongoDBService(); 