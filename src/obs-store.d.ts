declare module 'obs-store' {
  class ObservableStore {
    constructor(initState?: any);
    getState(): any;
    putState(newState: any): void;
    updateState(partialState: any): void;
    subscribe(handler: (state: any) => void): void;
    unsubscribe(handler: (state: any) => void): void;
    on(event: string, handler: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    removeAllListeners(event?: string): this;
    removeListener(event: string, handler: (...args: any[]) => void): this;
  }

  export default ObservableStore;
}

declare module 'obs-store/lib/asStream' {
  import type ObservableStore from 'obs-store';
  function asStream(store: ObservableStore): NodeJS.ReadableStream;
  export default asStream;
}
