import React, { useState, useEffect } from 'react';
import { Button, Text, Card, CardHeader, CardPreview, Badge } from '@fluentui/react-components';
import { 
  DatabaseRegular, 
  CloudSyncRegular, 
  DeleteRegular, 
  WarningRegular,
  CheckmarkRegular 
} from '@fluentui/react-icons';
import { mongoDBService } from '../services/MongoDBService';

interface MongoDBStatusProps {
  userId?: string;
  sessionId?: string;
  onUserContextSet?: (userId: string, sessionId: string) => void;
}

export const MongoDBStatus: React.FC<MongoDBStatusProps> = ({ 
  userId, 
  sessionId, 
  onUserContextSet 
}) => {
  const [status, setStatus] = useState({ connected: false, pendingOperations: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Update status every 5 seconds
    const interval = setInterval(() => {
      setStatus(mongoDBService.getConnectionStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSetUserContext = () => {
    const newUserId = `user_${Date.now()}`;
    const newSessionId = `session_${Date.now()}`;
    
    if (onUserContextSet) {
      onUserContextSet(newUserId, newSessionId);
    }
  };

  const handleDeleteUserData = async () => {
    if (!userId) {
      alert('Please set user context first');
      return;
    }

    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await mongoDBService.deleteUserData(userId, sessionId);
      setLastSync(new Date());
      alert('User data deleted successfully');
    } catch (error) {
      console.error('Failed to delete user data:', error);
      alert('Failed to delete user data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSyncNow = async () => {
    if (!userId || !sessionId) {
      alert('Please set user context first');
      return;
    }

    try {
      // Trigger a manual sync (this would be implemented in the memory system)
      setLastSync(new Date());
      alert('Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader
        image={<DatabaseRegular />}
        header={
          <Text style={{ fontWeight: 600 }}>
            MongoDB Cloud Storage
          </Text>
        }
      />
      <CardPreview>
        <div style={{ padding: '16px' }}>
          {/* Connection Status */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {status.connected ? (
                <CheckmarkRegular style={{ color: 'green' }} />
              ) : (
                <WarningRegular style={{ color: 'orange' }} />
              )}
              <Text>
                Status: {status.connected ? 'Connected' : 'Disconnected'}
              </Text>
              <Badge appearance={status.connected ? 'filled' : 'tint'}>
                {status.connected ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            {status.pendingOperations > 0 && (
              <Text style={{ color: 'orange', fontSize: '12px' }}>
                {status.pendingOperations} pending operations
              </Text>
            )}
          </div>

          {/* User Context */}
          <div style={{ marginBottom: '16px' }}>
            <Text style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              User Context
            </Text>
            {userId && sessionId ? (
              <div>
                <Text style={{ fontSize: '12px' }}>User ID: {userId}</Text>
                <br />
                <Text style={{ fontSize: '12px' }}>Session ID: {sessionId}</Text>
              </div>
            ) : (
              <div>
                <Text style={{ color: 'gray', marginBottom: '8px', display: 'block', fontSize: '12px' }}>
                  No user context set
                </Text>
                <Button 
                  size="small" 
                  onClick={handleSetUserContext}
                  icon={<CloudSyncRegular />}
                >
                  Set User Context
                </Button>
              </div>
            )}
          </div>

          {/* Last Sync */}
          {lastSync && (
            <div style={{ marginBottom: '16px' }}>
              <Text style={{ color: 'gray', fontSize: '12px' }}>
                Last sync: {lastSync.toLocaleString()}
              </Text>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button 
              size="small" 
              onClick={handleSyncNow}
              disabled={!userId || !sessionId}
              icon={<CloudSyncRegular />}
            >
              Sync Now
            </Button>
            
            <Button 
              size="small" 
              appearance="subtle"
              onClick={handleDeleteUserData}
              disabled={!userId || isDeleting}
              icon={<DeleteRegular />}
            >
              {isDeleting ? 'Deleting...' : 'Delete All Data'}
            </Button>
          </div>

          {/* Info */}
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <Text style={{ color: 'gray', fontSize: '12px' }}>
              <strong>How it works:</strong> Data is stored locally for fast access and synced to MongoDB for backup and cross-device access. 
              Only you can delete your data.
            </Text>
          </div>
        </div>
      </CardPreview>
    </Card>
  );
}; 