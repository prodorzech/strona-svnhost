import { useSyncExternalStore } from 'react';
import { getState, subscribe } from './store';
import type { StoreState } from './types';

export function useStoreState(): StoreState {
  return useSyncExternalStore(subscribe, getState);
}
