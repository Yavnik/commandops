/**
 * Deployment Recovery System
 *
 * Handles seamless recovery from deployment-related errors including:
 * - Chunk loading errors
 * - Server action mismatches
 * - Cache invalidation
 * - Hydration errors
 */

'use client';

import { showToast } from './toast-helper';

// Version tracking for deployment changes
const VERSION_KEY = 'app-deployment-version';
const RECOVERY_ATTEMPTS_KEY = 'deployment-recovery-attempts';
const LAST_RECOVERY_KEY = 'last-recovery-timestamp';
const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_COOLDOWN = 30000; // 30 seconds

interface DeploymentError {
  type: 'chunk-load' | 'server-action' | 'hydration' | 'version-mismatch';
  message: string;
  details?: Record<string, unknown>;
}

class DeploymentRecoverySystem {
  private version: string | null = null;
  private recoveryInProgress = false;
  private pendingActions = new Map<string, () => Promise<unknown>>();
  private errorQueue: DeploymentError[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeVersionTracking();
      this.setupErrorInterceptors();
      this.setupVisibilityHandling();
    }
  }

  private initializeVersionTracking() {
    // Get version from build metadata
    this.version = this.getBuildVersion();

    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedVersion && storedVersion !== this.version) {
      // Version mismatch detected
      this.handleVersionMismatch();
    } else if (this.version) {
      localStorage.setItem(VERSION_KEY, this.version);
    }
  }

  private getBuildVersion(): string | null {
    // Next.js exposes build ID
    if (
      typeof window !== 'undefined' &&
      (window as { __NEXT_DATA__?: { buildId: string } }).__NEXT_DATA__
    ) {
      return (window as { __NEXT_DATA__: { buildId: string } }).__NEXT_DATA__
        .buildId;
    }
    return null;
  }

  private setupErrorInterceptors() {
    // Intercept chunk loading errors
    this.interceptChunkLoadErrors();

    // Intercept server action errors
    this.interceptServerActionErrors();

    // Intercept fetch errors
    this.interceptFetchErrors();
  }

  private interceptChunkLoadErrors() {
    // Override webpack chunk loading error handler
    if (
      typeof window !== 'undefined' &&
      (
        window as {
          __webpack_require__?: {
            e?: (chunkId: string) => Promise<unknown>;
            cache?: object;
          };
        }
      ).__webpack_require__
    ) {
      const webpackRequire = (
        window as unknown as {
          __webpack_require__: { e: (chunkId: string) => Promise<unknown> };
        }
      ).__webpack_require__;
      const originalError = webpackRequire.e;

      webpackRequire.e = async (chunkId: string) => {
        try {
          return await originalError.call(webpackRequire, chunkId);
        } catch (error) {
          console.warn('Chunk loading error detected:', error);
          return this.handleChunkLoadError(chunkId, error as Error);
        }
      };
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      if (this.isChunkLoadError(event.reason)) {
        event.preventDefault();
        this.handleChunkLoadError('unknown', event.reason);
      }
    });

    // Handle regular script errors
    window.addEventListener('error', event => {
      if (this.isChunkLoadError(event.error) || this.isAssetLoadError(event)) {
        event.preventDefault();
        this.handleChunkLoadError(
          'unknown',
          event.error || new Error(event.message)
        );
      }
    });
  }

  private interceptServerActionErrors() {
    // Intercept fetch to catch server action errors
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Check for server action errors
        if (!response.ok && this.isServerActionRequest(args[0])) {
          const text = await response.text();

          if (this.isServerActionError(text)) {
            return this.handleServerActionError(args, response);
          }
        }

        return response;
      } catch (error) {
        if (this.isNetworkError(error)) {
          return this.handleNetworkError(args, error as Error);
        }
        throw error;
      }
    };
  }

  private interceptFetchErrors() {
    // Additional error handling for fetch failures
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const maxRetries = 3;
      let lastError;

      for (let i = 0; i < maxRetries; i++) {
        try {
          return await originalFetch(...args);
        } catch (error) {
          lastError = error;

          if (this.isRetriableError(error) && i < maxRetries - 1) {
            await this.delay(Math.min(1000 * Math.pow(2, i), 5000));
            continue;
          }

          break;
        }
      }

      throw lastError;
    };
  }

  private setupVisibilityHandling() {
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });

    // Handle online/offline events
    window.addEventListener('online', () => {
      this.processErrorQueue();
    });
  }

  private async checkForUpdates() {
    try {
      const currentVersion = this.getBuildVersion();

      if (currentVersion && currentVersion !== this.version) {
        this.handleVersionMismatch();
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  private handleVersionMismatch() {
    console.log('Deployment version mismatch detected');

    // Clear any pending actions for safety
    this.pendingActions.clear();

    // Reset Zustand store data to prevent corruption
    this.resetStoreState();

    // Perform soft refresh
    this.performSoftRefresh();
  }

  private async handleChunkLoadError(
    chunkId: string,
    error: Error
  ): Promise<unknown> {
    console.warn('[DEPLOYMENT_RECOVERY]', {
      issue: 'chunk_load_error_intercepted',
      chunkId,
      error: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString(),
      recoveryAttempts: this.getRecoveryAttempts(),
    });

    this.errorQueue.push({
      type: 'chunk-load',
      message: error.message,
      details: { chunkId },
    });

    if (!this.shouldAttemptRecovery()) {
      console.error('[DEPLOYMENT_RECOVERY]', {
        issue: 'recovery_limit_exceeded',
        chunkId,
        maxAttempts: this.getRecoveryAttempts(),
      });
      throw error;
    }

    // Try to recover
    return this.attemptChunkRecovery(chunkId, error);
  }

  private async attemptChunkRecovery(
    chunkId: string,
    error: Error
  ): Promise<unknown> {
    const attempts = this.getRecoveryAttempts();

    if (attempts >= MAX_RECOVERY_ATTEMPTS) {
      // Show user-friendly error
      this.showRecoveryFailedMessage();
      throw error;
    }

    this.incrementRecoveryAttempts();

    // Strategy 1: Clear caches and retry
    await this.clearCaches();

    // Strategy 2: Try loading from different source
    try {
      return await this.retryChunkLoad(chunkId);
    } catch (retryError) {
      // Strategy 3: Perform soft refresh
      this.performSoftRefresh();
      throw retryError;
    }
  }

  private async handleServerActionError(
    args: [RequestInfo | URL, RequestInit?],
    response: Response
  ): Promise<Response> {
    console.warn('Handling server action error');

    this.errorQueue.push({
      type: 'server-action',
      message: 'Server action mismatch',
      details: { url: args[0], status: response.status },
    });

    if (!this.shouldAttemptRecovery()) {
      return response;
    }

    // Queue the action for retry after refresh
    const actionId = this.extractActionId(args[0]);
    if (actionId) {
      this.pendingActions.set(actionId, () =>
        fetch(...(args as [RequestInfo | URL, RequestInit?]))
      );
    }

    // Perform recovery
    this.performSoftRefresh();

    // Return a response that won't break the app
    return new Response(
      JSON.stringify({
        error: 'Update in progress. Your action will complete shortly.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  private async handleNetworkError(
    args: [RequestInfo | URL, RequestInit?],
    error: Error
  ): Promise<Response> {
    // For network errors, queue the request
    const actionId = this.extractActionId(args[0]);
    if (actionId) {
      this.pendingActions.set(actionId, () =>
        fetch(...(args as [RequestInfo | URL, RequestInit?]))
      );
    }

    throw error;
  }

  private resetStoreState() {
    try {
      // Clear Zustand persist storage if it exists
      const zustandKeys = Object.keys(localStorage).filter(
        key =>
          key.includes('command-ops-store') ||
          key.includes('zustand') ||
          key.includes('store')
      );

      zustandKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Cleared store key: ${key}`);
      });

      // Clear session storage as well
      const sessionZustandKeys = Object.keys(sessionStorage).filter(
        key =>
          key.includes('command-ops-store') ||
          key.includes('zustand') ||
          key.includes('store')
      );

      sessionZustandKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`Cleared session store key: ${key}`);
      });

      console.log('Store state reset completed');
    } catch (error) {
      console.error('Failed to reset store state:', error);
    }
  }

  private performSoftRefresh() {
    if (this.recoveryInProgress) return;

    this.recoveryInProgress = true;

    // Show subtle loading indicator
    this.showUpdateInProgressMessage();

    // Save current state
    this.saveApplicationState();

    // Reset store state to prevent corruption
    this.resetStoreState();

    // Clear caches
    this.clearCaches().then(() => {
      // Reload the page
      window.location.reload();
    });
  }

  private async clearCaches() {
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear module cache
      if (
        (window as { __webpack_require__?: { cache?: object } })
          .__webpack_require__?.cache
      ) {
        (
          window as unknown as { __webpack_require__: { cache: object } }
        ).__webpack_require__.cache = {};
      }

      // Clear Next.js router cache (if available)
      try {
        if (
          (window as { next?: { router?: { reload(): void } } }).next?.router
        ) {
          (
            window as unknown as { next: { router: { reload(): void } } }
          ).next.router.reload();
        }
      } catch (error) {
        console.warn('Failed to reload Next.js router:', error);
      }
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  private async retryChunkLoad(chunkId: string): Promise<unknown> {
    // Force reload the chunk with cache bypass
    const script = document.createElement('script');
    script.src = `/_next/static/chunks/${chunkId}.js?v=${Date.now()}`;

    return new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private saveApplicationState() {
    try {
      // Save form data
      const formData = this.collectFormData();
      if (formData) {
        sessionStorage.setItem('pending-form-data', JSON.stringify(formData));
      }

      // Save scroll position
      sessionStorage.setItem(
        'scroll-position',
        JSON.stringify({
          x: window.scrollX,
          y: window.scrollY,
        })
      );

      // Save any pending actions
      const pendingActionIds = Array.from(this.pendingActions.keys());
      if (pendingActionIds.length > 0) {
        sessionStorage.setItem(
          'pending-actions',
          JSON.stringify(pendingActionIds)
        );
      }
    } catch (error) {
      console.error('Failed to save application state:', error);
    }
  }

  private collectFormData(): Record<
    string,
    Record<string, FormDataEntryValue>
  > | null {
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) return null;

    const data: Record<string, Record<string, FormDataEntryValue>> = {};

    forms.forEach((form, index) => {
      const formData = new FormData(form);
      const formObject: Record<string, FormDataEntryValue> = {};

      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      if (Object.keys(formObject).length > 0) {
        data[`form-${index}`] = formObject;
      }
    });

    return Object.keys(data).length > 0 ? data : null;
  }

  private restoreApplicationState() {
    try {
      // Restore form data
      const formDataStr = sessionStorage.getItem('pending-form-data');
      if (formDataStr) {
        const formData = JSON.parse(formDataStr);
        this.restoreFormData(formData);
        sessionStorage.removeItem('pending-form-data');
      }

      // Restore scroll position
      const scrollStr = sessionStorage.getItem('scroll-position');
      if (scrollStr) {
        const { x, y } = JSON.parse(scrollStr);
        window.scrollTo(x, y);
        sessionStorage.removeItem('scroll-position');
      }

      // Process pending actions
      const pendingActionsStr = sessionStorage.getItem('pending-actions');
      if (pendingActionsStr) {
        const actionIds = JSON.parse(pendingActionsStr);
        this.processPendingActions(actionIds);
        sessionStorage.removeItem('pending-actions');
      }
    } catch (error) {
      console.error('Failed to restore application state:', error);
    }
  }

  private restoreFormData(
    data: Record<string, Record<string, FormDataEntryValue>>
  ) {
    // Implementation depends on your form structure
    console.log('Restoring form data:', data);
  }

  private async processPendingActions(actionIds: string[]) {
    for (const actionId of actionIds) {
      const action = this.pendingActions.get(actionId);
      if (action) {
        try {
          await action();
          this.pendingActions.delete(actionId);
        } catch (error) {
          console.error('Failed to process pending action:', actionId, error);
        }
      }
    }
  }

  private processErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    // Process errors
    errors.forEach(error => {
      console.log('Processing queued error:', error);
    });
  }

  private shouldAttemptRecovery(): boolean {
    const lastRecovery = localStorage.getItem(LAST_RECOVERY_KEY);
    if (lastRecovery) {
      const timeSinceLastRecovery = Date.now() - parseInt(lastRecovery, 10);
      if (timeSinceLastRecovery < RECOVERY_COOLDOWN) {
        return false;
      }
    }

    return this.getRecoveryAttempts() < MAX_RECOVERY_ATTEMPTS;
  }

  private getRecoveryAttempts(): number {
    const attempts = localStorage.getItem(RECOVERY_ATTEMPTS_KEY);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  private incrementRecoveryAttempts() {
    const attempts = this.getRecoveryAttempts() + 1;
    localStorage.setItem(RECOVERY_ATTEMPTS_KEY, attempts.toString());
    localStorage.setItem(LAST_RECOVERY_KEY, Date.now().toString());
  }

  private resetRecoveryAttempts() {
    localStorage.removeItem(RECOVERY_ATTEMPTS_KEY);
    localStorage.removeItem(LAST_RECOVERY_KEY);
  }

  private showUpdateInProgressMessage() {
    showToast('Updating application...', 'info', Infinity);
  }

  private showRecoveryFailedMessage() {
    showToast(
      'Unable to load updated application. Please refresh the page manually.',
      'error',
      Infinity
    );
  }

  private isChunkLoadError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const err = error as { name?: string; message?: string };
    return (
      err.name === 'ChunkLoadError' ||
      (err.message?.includes('Loading chunk') ?? false) ||
      (err.message?.includes('Failed to fetch dynamically imported module') ??
        false) ||
      (err.message?.includes('Unable to preload CSS') ?? false)
    );
  }

  private isAssetLoadError(event: ErrorEvent): boolean {
    return (
      event.filename?.includes('/_next/static/') ||
      event.message?.includes('Failed to load resource')
    );
  }

  private isServerActionRequest(url: unknown): boolean {
    if (typeof url !== 'string') return false;

    return (
      url.includes('/api/') ||
      url.includes('server-action') ||
      // Next.js server actions use specific headers
      url.includes('x-action')
    );
  }

  private isServerActionError(text: string): boolean {
    return (
      text.includes('Failed to find Server Action') ||
      text.includes('Cannot find module') ||
      text.includes('server action') ||
      text.includes('Invalid Server Action')
    );
  }

  private isNetworkError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const err = error as { name?: string; message?: string };
    return (
      err.name === 'NetworkError' ||
      (err.message?.includes('Failed to fetch') ?? false) ||
      (err.message?.includes('Network request failed') ?? false)
    );
  }

  private isRetriableError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const err = error as { code?: string };
    return (
      this.isNetworkError(error) ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT'
    );
  }

  private extractActionId(url: unknown): string | null {
    if (typeof url !== 'string') return null;

    // Extract action ID from URL or headers
    const match = url.match(/action=([^&]+)/);
    return match ? match[1] : null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API
  public initialize() {
    if (typeof window !== 'undefined') {
      this.restoreApplicationState();
      this.resetRecoveryAttempts();
    }
  }

  public async retryFailedAction(actionId: string): Promise<unknown> {
    const action = this.pendingActions.get(actionId);
    if (action) {
      try {
        const result = await action();
        this.pendingActions.delete(actionId);
        return result;
      } catch (error) {
        throw error;
      }
    }
    throw new Error('Action not found');
  }

  public resetStore() {
    console.log('Manual store reset requested');
    this.resetStoreState();
  }

  public isHydrationError(error: Error): boolean {
    const hydrationErrorPatterns = [
      'Cannot read properties of undefined',
      'Hydration failed',
      'Text content does not match',
      'Expected server HTML to contain',
      'Cannot read property',
    ];

    return hydrationErrorPatterns.some(pattern =>
      error.message?.includes(pattern)
    );
  }
}

// Export singleton instance
export const deploymentRecovery = new DeploymentRecoverySystem();

// Auto-initialize on load
if (typeof window !== 'undefined') {
  deploymentRecovery.initialize();
}
