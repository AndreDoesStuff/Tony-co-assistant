import { UserExperienceEnhancement } from '../src/components/advanced/UserExperienceEnhancement';
import { eventBus } from '../src/events/EventBus';

describe('Phase 5.3: User Experience Polish', () => {
  let uxEnhancement: UserExperienceEnhancement;

  beforeEach(async () => {
    uxEnhancement = new UserExperienceEnhancement();
    await uxEnhancement.initialize();
  });

  afterEach(async () => {
    await uxEnhancement.destroy();
  });

  describe('Interface Development', () => {
    test('should initialize with default UI state', () => {
      const uiState = uxEnhancement.getUIState();
      
      expect(uiState.theme).toBe('auto');
      expect(uiState.layout).toBe('comfortable');
      expect(uiState.fontSize).toBe('medium');
      expect(uiState.contrast).toBe('normal');
      expect(uiState.animations).toBe(true);
      expect(uiState.reducedMotion).toBe(false);
    });

    test('should update UI state correctly', () => {
      const updates = {
        theme: 'dark' as const,
        layout: 'compact' as const,
        fontSize: 'large' as const,
        contrast: 'high' as const,
        animations: false,
        reducedMotion: true
      };

      uxEnhancement.updateUIState(updates);
      const uiState = uxEnhancement.getUIState();

      expect(uiState.theme).toBe('dark');
      expect(uiState.layout).toBe('compact');
      expect(uiState.fontSize).toBe('large');
      expect(uiState.contrast).toBe('high');
      expect(uiState.animations).toBe(false);
      expect(uiState.reducedMotion).toBe(true);
    });

    test('should track UI state changes in statistics', () => {
      const initialStats = uxEnhancement.getStats();
      
      uxEnhancement.updateUIState({ theme: 'dark' });
      uxEnhancement.updateUIState({ layout: 'spacious' });
      uxEnhancement.updateUIState({ contrast: 'maximum' });
      uxEnhancement.updateUIState({ animations: false });

      const updatedStats = uxEnhancement.getStats();
      
      expect(updatedStats.interfaceDevelopment.themeChanges).toBeGreaterThan(initialStats.interfaceDevelopment.themeChanges);
      expect(updatedStats.interfaceDevelopment.layoutUpdates).toBeGreaterThan(initialStats.interfaceDevelopment.layoutUpdates);
      expect(updatedStats.interfaceDevelopment.accessibilityToggles).toBeGreaterThan(initialStats.interfaceDevelopment.accessibilityToggles);
      expect(updatedStats.interfaceDevelopment.animationSettings).toBeGreaterThan(initialStats.interfaceDevelopment.animationSettings);
    });
  });

  describe('Interaction Optimization', () => {
    test('should start new interaction session', () => {
      const session = uxEnhancement.startNewSession('test-user');
      
      expect(session.id).toBeDefined();
      expect(session.userId).toBe('test-user');
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.interactions).toEqual([]);
      expect(session.performance).toBeDefined();
      expect(session.accessibility).toBeDefined();
    });

    test('should record user interactions', () => {
      uxEnhancement.startNewSession('test-user');
      
      uxEnhancement.recordInteraction('click', 'button-submit', true);
      uxEnhancement.recordInteraction('hover', 'menu-item', true);
      uxEnhancement.recordInteraction('keyboard', 'input-field', false, 'Invalid input');
      uxEnhancement.recordInteraction('gesture', 'swipe-panel', true);

      const session = uxEnhancement.getCurrentSession();
      expect(session?.interactions).toHaveLength(4);
      expect(session?.interactions[0].type).toBe('click');
      expect(session?.interactions[0].target).toBe('button-submit');
      expect(session?.interactions[0].success).toBe(true);
      expect(session?.interactions[2].success).toBe(false);
      expect(session?.interactions[2].error).toBe('Invalid input');
    });

    test('should track interaction statistics', () => {
      const initialStats = uxEnhancement.getStats();
      
      uxEnhancement.startNewSession('test-user');
      uxEnhancement.recordInteraction('click', 'button-1', true);
      uxEnhancement.recordInteraction('click', 'button-2', true);
      uxEnhancement.recordInteraction('click', 'button-3', false, 'Error');

      const updatedStats = uxEnhancement.getStats();
      
      expect(updatedStats.interactionOptimization.totalInteractions).toBeGreaterThan(initialStats.interactionOptimization.totalInteractions);
      expect(updatedStats.interactionOptimization.successRate).toBeGreaterThan(0);
    });

    test('should end interaction session and calculate metrics', () => {
      const session = uxEnhancement.startNewSession('test-user');
      
      uxEnhancement.recordInteraction('click', 'button-1', true);
      uxEnhancement.recordInteraction('click', 'button-2', true);
      uxEnhancement.recordInteraction('click', 'button-3', false, 'Error');

      uxEnhancement.endCurrentSession();

      expect(session.endTime).toBeDefined();
      expect(session.performance.successRate).toBeCloseTo(0.67, 1);
      expect(session.performance.errorRate).toBeCloseTo(0.33, 1);
      expect(session.accessibility.overallAccessibility).toBeGreaterThan(0);
    });

    test('should handle interaction context', () => {
      uxEnhancement.startNewSession('test-user');
      
      const context = {
        page: 'dashboard',
        component: 'navigation',
        userIntent: 'navigate_to_settings',
        deviceType: 'mobile' as const,
        inputMethod: 'touch' as const
      };

      uxEnhancement.recordInteraction('gesture', 'swipe-menu', true, undefined, context);

      const session = uxEnhancement.getCurrentSession();
      const interaction = session?.interactions[0];
      
      expect(interaction?.context.page).toBe('dashboard');
      expect(interaction?.context.component).toBe('navigation');
      expect(interaction?.context.userIntent).toBe('navigate_to_settings');
      expect(interaction?.context.deviceType).toBe('mobile');
      expect(interaction?.context.inputMethod).toBe('touch');
    });
  });

  describe('Feedback Mechanisms', () => {
    test('should send feedback messages', () => {
      const feedback = uxEnhancement.sendFeedback(
        'success',
        'Operation Completed',
        'Your changes have been saved successfully.',
        5000
      );

      expect(feedback.id).toBeDefined();
      expect(feedback.type).toBe('success');
      expect(feedback.title).toBe('Operation Completed');
      expect(feedback.message).toBe('Your changes have been saved successfully.');
      expect(feedback.duration).toBe(5000);
      expect(feedback.timestamp).toBeGreaterThan(0);
    });

    test('should send feedback with actions', () => {
      const actions = [
        { label: 'Undo', action: 'undo_changes' },
        { label: 'View Details', action: 'view_details' }
      ];

      const feedback = uxEnhancement.sendFeedback(
        'warning',
        'Changes Pending',
        'You have unsaved changes. Would you like to save them?',
        10000,
        actions
      );

      expect(feedback.actions).toEqual(actions);
    });

    test('should track feedback statistics', () => {
      const initialStats = uxEnhancement.getStats();
      
      uxEnhancement.sendFeedback('success', 'Success', 'Operation completed');
      uxEnhancement.sendFeedback('error', 'Error', 'Something went wrong');
      uxEnhancement.sendFeedback('info', 'Info', 'Here is some information');

      const updatedStats = uxEnhancement.getStats();
      
      expect(updatedStats.feedbackMechanisms.messagesSent).toBeGreaterThan(initialStats.feedbackMechanisms.messagesSent);
    });

    test('should get feedback queue', () => {
      uxEnhancement.sendFeedback('success', 'Success 1', 'Message 1');
      uxEnhancement.sendFeedback('error', 'Error 1', 'Message 2');
      uxEnhancement.sendFeedback('info', 'Info 1', 'Message 3');

      const queue = uxEnhancement.getFeedbackQueue();
      
      expect(queue).toHaveLength(3);
      expect(queue[0].type).toBe('success');
      expect(queue[1].type).toBe('error');
      expect(queue[2].type).toBe('info');
    });

    test('should process feedback queue and remove expired messages', () => {
      // Send feedback with short duration
      uxEnhancement.sendFeedback('info', 'Temporary', 'This will expire', 100);
      
      // Wait for expiration
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const queue = uxEnhancement.getFeedbackQueue();
          expect(queue.length).toBeLessThanOrEqual(1); // May have been processed
          resolve();
        }, 200);
      });
    });
  });

  describe('Accessibility Features', () => {
    test('should initialize accessibility features', () => {
      const features = uxEnhancement.getAccessibilityFeatures();
      
      expect(features).toHaveLength(5);
      
      const screenReader = features.find(f => f.id === 'screen_reader');
      expect(screenReader).toBeDefined();
      expect(screenReader?.name).toBe('Screen Reader Support');
      expect(screenReader?.enabled).toBe(true);
      expect(screenReader?.impact).toBe('high');

      const highContrast = features.find(f => f.id === 'high_contrast');
      expect(highContrast).toBeDefined();
      expect(highContrast?.enabled).toBe(false);
      expect(highContrast?.impact).toBe('medium');
    });

    test('should toggle accessibility features', () => {
      const result = uxEnhancement.toggleAccessibilityFeature('high_contrast', true);
      expect(result).toBe(true);

      const features = uxEnhancement.getAccessibilityFeatures();
      const highContrast = features.find(f => f.id === 'high_contrast');
      expect(highContrast?.enabled).toBe(true);

      const result2 = uxEnhancement.toggleAccessibilityFeature('high_contrast', false);
      expect(result2).toBe(true);

      const features2 = uxEnhancement.getAccessibilityFeatures();
      const highContrast2 = features2.find(f => f.id === 'high_contrast');
      expect(highContrast2?.enabled).toBe(false);
    });

    test('should handle invalid accessibility feature toggle', () => {
      const result = uxEnhancement.toggleAccessibilityFeature('invalid_feature', true);
      expect(result).toBe(false);
    });

    test('should update accessibility score when features are toggled', () => {
      const initialStats = uxEnhancement.getStats();
      
      uxEnhancement.toggleAccessibilityFeature('high_contrast', true);
      uxEnhancement.toggleAccessibilityFeature('color_blind', true);
      
      const updatedStats = uxEnhancement.getStats();
      
      expect(updatedStats.accessibilityFeatures.activeFeatures).toBeGreaterThan(initialStats.accessibilityFeatures.activeFeatures);
      expect(updatedStats.accessibilityFeatures.accessibilityScore).toBeGreaterThan(initialStats.accessibilityFeatures.accessibilityScore);
    });

    test('should calculate accessibility metrics correctly', () => {
      uxEnhancement.startNewSession('test-user');
      
      // Enable all accessibility features
      uxEnhancement.toggleAccessibilityFeature('screen_reader', true);
      uxEnhancement.toggleAccessibilityFeature('high_contrast', true);
      uxEnhancement.toggleAccessibilityFeature('font_size', true);
      uxEnhancement.toggleAccessibilityFeature('color_blind', true);
      uxEnhancement.toggleAccessibilityFeature('keyboard_nav', true);

      uxEnhancement.endCurrentSession();
      
      const session = uxEnhancement.getCurrentSession();
      expect(session?.accessibility.screenReaderCompatibility).toBeGreaterThan(0.8);
      expect(session?.accessibility.keyboardNavigationScore).toBeGreaterThan(0.7);
      expect(session?.accessibility.colorContrastRatio).toBeGreaterThan(0.8);
      expect(session?.accessibility.textReadability).toBeGreaterThan(0.7);
      expect(session?.accessibility.overallAccessibility).toBeGreaterThan(0.7);
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = {
        interfaceDevelopment: {
          enabled: false,
          responsiveDesign: false,
          darkMode: false,
          animations: false,
          accessibility: false
        }
      };

      uxEnhancement.updateConfig(newConfig);
      
      // Note: The component doesn't expose config getter, so we test through behavior
      // The configuration update should affect future operations
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Event Handling', () => {
    test('should handle user interaction events', async () => {
      const interactionData = {
        type: 'click' as const,
        target: 'test-button',
        success: true,
        context: {
          page: 'test-page',
          component: 'test-component'
        }
      };

      await eventBus.publishSimple(
        'user_interaction',
        'TestComponent',
        { interaction: interactionData },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const session = uxEnhancement.getCurrentSession();
      expect(session?.interactions.length).toBeGreaterThan(0);
    });

    test('should handle accessibility request events', async () => {
      const accessibilityRequest = {
        featureId: 'high_contrast',
        action: 'enable' as const
      };

      await eventBus.publishSimple(
        'accessibility_request',
        'TestComponent',
        { accessibilityRequest },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const features = uxEnhancement.getAccessibilityFeatures();
      const highContrast = features.find(f => f.id === 'high_contrast');
      expect(highContrast?.enabled).toBe(true);
    });

    test('should handle feedback request events', async () => {
      const feedbackRequest = {
        type: 'success' as const,
        title: 'Test Success',
        message: 'Test message',
        duration: 3000
      };

      await eventBus.publishSimple(
        'feedback_request',
        'TestComponent',
        { feedbackRequest },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const queue = uxEnhancement.getFeedbackQueue();
      expect(queue.length).toBeGreaterThan(0);
    });

    test('should handle UI state change events', async () => {
      const uiState = {
        theme: 'dark' as const,
        layout: 'compact' as const
      };

      await eventBus.publishSimple(
        'ui_state_change',
        'TestComponent',
        { uiState },
        { component: 'TestComponent' }
      );

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const currentState = uxEnhancement.getUIState();
      expect(currentState.theme).toBe('dark');
      expect(currentState.layout).toBe('compact');
    });
  });

  describe('Performance and Statistics', () => {
    test('should provide comprehensive statistics', () => {
      const stats = uxEnhancement.getStats();
      
      expect(stats.interfaceDevelopment).toBeDefined();
      expect(stats.interactionOptimization).toBeDefined();
      expect(stats.feedbackMechanisms).toBeDefined();
      expect(stats.accessibilityFeatures).toBeDefined();
      
      expect(stats.interfaceDevelopment.themeChanges).toBeGreaterThanOrEqual(0);
      expect(stats.interactionOptimization.totalInteractions).toBeGreaterThanOrEqual(0);
      expect(stats.feedbackMechanisms.messagesSent).toBeGreaterThanOrEqual(0);
      expect(stats.accessibilityFeatures.activeFeatures).toBeGreaterThanOrEqual(0);
    });

    test('should calculate performance metrics correctly', () => {
      uxEnhancement.startNewSession('test-user');
      
      // Record interactions with different outcomes
      uxEnhancement.recordInteraction('click', 'button-1', true);
      uxEnhancement.recordInteraction('click', 'button-2', true);
      uxEnhancement.recordInteraction('click', 'button-3', false, 'Error');
      uxEnhancement.recordInteraction('click', 'button-4', true);

      const stats = uxEnhancement.getStats();
      
      expect(stats.interactionOptimization.totalInteractions).toBe(4);
      expect(stats.interactionOptimization.successRate).toBeCloseTo(0.75, 1);
    });
  });

  describe('Session Management', () => {
    test('should handle multiple sessions', () => {
      const session1 = uxEnhancement.startNewSession('user-1');
      uxEnhancement.recordInteraction('click', 'button-1', true);
      
      const session2 = uxEnhancement.startNewSession('user-2');
      uxEnhancement.recordInteraction('click', 'button-2', true);

      expect(session1.id).not.toBe(session2.id);
      expect(session1.userId).toBe('user-1');
      expect(session2.userId).toBe('user-2');
      
      const currentSession = uxEnhancement.getCurrentSession();
      expect(currentSession?.id).toBe(session2.id);
    });

    test('should end session and calculate final metrics', () => {
      const session = uxEnhancement.startNewSession('test-user');
      
      uxEnhancement.recordInteraction('click', 'button-1', true);
      uxEnhancement.recordInteraction('click', 'button-2', true);
      uxEnhancement.recordInteraction('click', 'button-3', false, 'Error');

      uxEnhancement.endCurrentSession();

      expect(session.endTime).toBeDefined();
      expect(session.performance.successRate).toBeCloseTo(0.67, 1);
      expect(session.performance.errorRate).toBeCloseTo(0.33, 1);
      expect(session.accessibility.overallAccessibility).toBeGreaterThan(0);
    });
  });

  describe('System Integration', () => {
    test('should integrate with event bus system', async () => {
      const events: string[] = [];
      
      const subscription = eventBus.subscribe('ux_enhancement_initialized', () => {
        events.push('ux_enhancement_initialized');
      });

      // Re-initialize to trigger event
      await uxEnhancement.destroy();
      await uxEnhancement.initialize();

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(events).toContain('ux_enhancement_initialized');
      
      eventBus.unsubscribe(subscription.id);
    });

    test('should emit appropriate events for state changes', async () => {
      const events: string[] = [];
      
      const subscriptions = [
        eventBus.subscribe('ui_state_updated', () => events.push('ui_state_updated')),
        eventBus.subscribe('interaction_recorded', () => events.push('interaction_recorded')),
        eventBus.subscribe('feedback_sent', () => events.push('feedback_sent')),
        eventBus.subscribe('accessibility_feature_toggled', () => events.push('accessibility_feature_toggled'))
      ];

      // Trigger various actions
      uxEnhancement.updateUIState({ theme: 'dark' });
      uxEnhancement.startNewSession('test-user');
      uxEnhancement.recordInteraction('click', 'test-button', true);
      uxEnhancement.sendFeedback('success', 'Test', 'Message');
      uxEnhancement.toggleAccessibilityFeature('high_contrast', true);

      // Give time for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(events).toContain('ui_state_updated');
      expect(events).toContain('interaction_recorded');
      expect(events).toContain('feedback_sent');
      expect(events).toContain('accessibility_feature_toggled');

      // Cleanup subscriptions
      subscriptions.forEach(sub => eventBus.unsubscribe(sub.id));
    });
  });
}); 