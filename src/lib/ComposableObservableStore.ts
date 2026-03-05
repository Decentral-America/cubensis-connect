import ObservableStore from 'obs-store';

/**
 * An ObservableStore that can composes a flat
 * structure of child stores based on configuration
 */
class ComposableObservableStore extends ObservableStore {
  config: Record<string, ObservableStore> = {};

  /**
   * Composes a new internal store subscription structure
   *
   * @param {Object} [config] - Map of internal state keys to child stores
   */
  updateStructure(config: Record<string, ObservableStore>): void {
    this.config = config;
    this.removeAllListeners();
    for (const key in config) {
      // set initial substore state
      const state = config[key].getState();
      this.updateState({ [key]: state });

      // subscribe to substore update
      config[key].subscribe((state: unknown) => {
        this.updateState({ [key]: state });
      });
    }
  }

  /**
   * Merges all child store state into a single object rather than
   * returning an object keyed by child store class name
   *
   * @returns {Object} - Object containing merged child store state
   */
  getFlatState(): Record<string, unknown> {
    let flatState: Record<string, unknown> = {};
    for (const key in this.config) {
      flatState = { ...flatState, ...this.config[key].getState() };
    }
    return flatState;
  }

  getKeys(): string[] {
    return Object.keys(this.config);
  }
}

export { ComposableObservableStore };
