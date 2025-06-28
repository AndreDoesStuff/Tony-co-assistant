import { TonyEvent, EventHandler, EventSubscription } from '../types/tony';

/**
 * Event Bus - Central Communication System
 * Implements the neural network data flow as described in ARCHITECTURE.md
 */
export class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: TonyEvent[] = [];
  private maxHistorySize: number = 1000;
  private isProcessing = false;
  private processingQueue: TonyEvent[] = [];

  /**
   * Subscribe to an event type
   */
  subscribe(eventType: string, handler: EventHandler): EventSubscription {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      handler,
      active: true
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);

    console.log(`Subscribed to event type: ${eventType} with ID: ${subscription.id}`);

    return subscription;
  }

  /**
   * Unsubscribe from an event type
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of Array.from(this.subscriptions.entries())) {
      const index = subscriptions.findIndex((sub: EventSubscription) => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        console.log(`Unsubscribed from event type: ${eventType} with ID: ${subscriptionId}`);
        
        // Clean up empty event type arrays
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }
        
        return true;
      }
    }
    return false;
  }

  /**
   * Publish an event
   */
  async publish(event: TonyEvent): Promise<void> {
    // Add event to history
    this.addToHistory(event);

    // Add to processing queue
    this.processingQueue.push(event);

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Process the event queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.processingQueue.length > 0) {
        const event = this.processingQueue.shift()!;
        await this.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error processing event queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Dispatch event to all subscribers
   */
  private async dispatchEvent(event: TonyEvent): Promise<void> {
    const subscriptions = this.subscriptions.get(event.type) || [];
    const activeSubscriptions = subscriptions.filter(sub => sub.active);

    console.log(`Dispatching event ${event.type} to ${activeSubscriptions.length} subscribers`);

    // Dispatch to all active subscribers
    const promises = activeSubscriptions.map(async (subscription) => {
      try {
        await subscription.handler(event);
      } catch (error) {
        console.error(`Error in event handler for subscription ${subscription.id}:`, error);
        // Mark subscription as inactive if it fails
        subscription.active = false;
      }
    });

    // Wait for all handlers to complete
    await Promise.allSettled(promises);
  }

  /**
   * Add event to history
   */
  private addToHistory(event: TonyEvent): void {
    this.eventHistory.push(event);

    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: string): TonyEvent[] {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): EventSubscription[] {
    const allSubscriptions: EventSubscription[] = [];
    for (const subscriptions of Array.from(this.subscriptions.values())) {
      allSubscriptions.push(...subscriptions.filter((sub: EventSubscription) => sub.active));
    }
    return allSubscriptions;
  }

  /**
   * Get subscription count for an event type
   */
  getSubscriptionCount(eventType: string): number {
    const subscriptions = this.subscriptions.get(eventType) || [];
    return subscriptions.filter(sub => sub.active).length;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { length: number; isProcessing: boolean } {
    return {
      length: this.processingQueue.length,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Create a TonyEvent with default values
   */
  createEvent(
    type: string,
    source: string,
    data: any,
    context: any = {},
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): TonyEvent {
    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      source,
      data,
      context,
      timestamp: Date.now(),
      priority
    };
  }

  /**
   * Publish a simple event with automatic event creation
   */
  async publishSimple(
    type: string,
    source: string,
    data: any,
    context: any = {},
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const event = this.createEvent(type, source, data, context, priority);
    await this.publish(event);
  }

  /**
   * Get system statistics
   */
  getStats(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    eventTypes: string[];
    historySize: number;
    queueSize: number;
  } {
    const eventTypes = Array.from(this.subscriptions.keys());
    const totalSubscriptions = Array.from(this.subscriptions.values())
      .reduce((total, subs) => total + subs.length, 0);
    const activeSubscriptions = this.getActiveSubscriptions().length;

    return {
      totalSubscriptions,
      activeSubscriptions,
      eventTypes,
      historySize: this.eventHistory.length,
      queueSize: this.processingQueue.length
    };
  }
}

// Export singleton instance
export const eventBus = new EventBus(); 