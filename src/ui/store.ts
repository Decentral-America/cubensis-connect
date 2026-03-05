import { useSelector, type TypedUseSelectorHook, useDispatch } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import * as reducers from './reducers/updateState';
import * as middleware from './midleware';
import * as extension from 'extensionizer';
import { CubensisConnect_DEBUG } from './appConfig';

if (CubensisConnect_DEBUG) {
  // SECURITY: Redact sensitive action payloads to prevent credential leaks in console
  const SENSITIVE_ACTIONS = ['SET_PASSWORD', 'CHANGE_PASSWORD', 'SET_SEED', 'BACKUP_SEED'];
  middleware['logMW'] = (_store) => (next) => (action) => {
    if (SENSITIVE_ACTIONS.some((s) => action.type?.includes?.(s))) {
      console.log('-->', action.type, '[REDACTED]');
    } else {
      console.log('-->', action.type, action.payload, action.meta);
    }
    return next(action);
  };
}

const reducer = combineReducers(reducers);

export type AppState = ReturnType<typeof reducer>;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export function createUiStore() {
  return createStore(
    reducer,
    { version: extension.runtime.getManifest().version },
    applyMiddleware(...Object.values(middleware)),
  );
}

export type UiStore = ReturnType<typeof createUiStore>;

export const useAppDispatch = () => useDispatch<UiStore['dispatch']>();
