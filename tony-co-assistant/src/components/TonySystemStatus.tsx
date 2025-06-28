import React, { useState, useEffect } from 'react';
import { tonyStore } from '../store/TonyStore';
import { componentManager } from './core/ComponentManager';
import { TonyState } from '../types/tony';

interface TonySystemStatusProps {
  isVisible: boolean;
  onToggle: () => void;
}

const TonySystemStatus: React.FC<TonySystemStatusProps> = ({ isVisible, onToggle }) => {
  const [state, setState] = useState<TonyState | null>(null);
  const [componentStats, setComponentStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = tonyStore.subscribe(setState);
    
    // Get initial state
    setState(tonyStore.getState());

    // Load component stats
    loadComponentStats();

    return unsubscribe;
  }, []);

  const loadComponentStats = async () => {
    try {
      setIsLoading(true);
      const stats = await tonyStore.getComponentStats();
      setComponentStats(stats);
    } catch (error) {
      console.error('Failed to load component stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return '#10b981'; // green
      case 'initializing':
        return '#f59e0b'; // yellow
      case 'error':
        return '#ef4444'; // red
      case 'inactive':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return '●';
      case 'initializing':
        return '⟳';
      case 'error':
        return '✕';
      case 'inactive':
        return '○';
      default:
        return '○';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatDuration = (timestamp: number) => {
    if (!timestamp) return '0s';
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (!state) {
    return null;
  }

  const systemHealth = tonyStore.getSystemHealth();

  return (
    <div className={`system-status-panel ${isVisible ? 'visible' : ''}`}>
      <div className="system-status-header">
        <h3>System Status</h3>
        <button onClick={onToggle} className="close-button">
          ×
        </button>
      </div>

      <div className="system-status-content">
        {/* Overall System Status */}
        <div className="status-section">
          <h4>System Overview</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span 
                className="status-value"
                style={{ color: getStatusColor(state.system.status) }}
              >
                {getStatusIcon(state.system.status)} {state.system.status}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Version:</span>
              <span className="status-value">{state.system.version}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Components:</span>
              <span className="status-value">
                {systemHealth.initializedCount}/{systemHealth.componentCount} active
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Updated:</span>
              <span className="status-value">
                {formatTimestamp(state.system.lastUpdated)}
              </span>
            </div>
          </div>
        </div>

        {/* Component Status */}
        <div className="status-section">
          <h4>Component Status</h4>
          <div className="component-list">
            {Object.entries(state.system.components).map(([name, component]) => (
              <div key={name} className="component-item">
                <div className="component-header">
                  <span 
                    className="component-status"
                    style={{ color: getStatusColor(component.status) }}
                  >
                    {getStatusIcon(component.status)}
                  </span>
                  <span className="component-name">{name}</span>
                </div>
                <div className="component-details">
                  <span className="component-status-text">{component.status}</span>
                  <span className="component-activity">
                    {component.lastActivity ? formatDuration(component.lastActivity) : 'Never'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Component Statistics */}
        {componentStats && (
          <div className="status-section">
            <h4>Component Statistics</h4>
            <div className="stats-grid">
              {Object.entries(componentStats).map(([name, stats]: [string, any]) => (
                <div key={name} className="stats-item">
                  <h5>{name}</h5>
                  <div className="stats-content">
                    {stats.error ? (
                      <span className="error-text">{stats.error}</span>
                    ) : (
                      Object.entries(stats).map(([key, value]) => (
                        <div key={key} className="stat-row">
                          <span className="stat-label">{key}:</span>
                          <span className="stat-value">{String(value)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Session */}
        <div className="status-section">
          <h4>User Session</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">User ID:</span>
              <span className="status-value">{state.user.id}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Session Start:</span>
              <span className="status-value">
                {formatTimestamp(state.user.session.startTime)}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Activity:</span>
              <span className="status-value">
                {formatDuration(state.user.session.lastActivity)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="status-section">
          <h4>Actions</h4>
          <div className="action-buttons">
            <button 
              onClick={loadComponentStats}
              disabled={isLoading}
              className="action-button"
            >
              {isLoading ? 'Loading...' : 'Refresh Stats'}
            </button>
            <button 
              onClick={() => tonyStore.updateUserSession()}
              className="action-button"
            >
              Update Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TonySystemStatus; 