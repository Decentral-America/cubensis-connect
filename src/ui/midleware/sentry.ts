import * as Sentry from '@sentry/react';
import { ACTION } from '../actions/constants';
import { type Middleware } from 'redux';
import { type AppState } from 'ui/store';

export const sentryBreadcrumbs: Middleware<{}, AppState> = (store) => (next) => (action) => {
  switch (action.type) {
    case ACTION.CHANGE_TAB: {
      const fromTab = store.getState().tab;
      const toTab = action.payload;

      if (toTab !== fromTab) {
        Sentry.addBreadcrumb({
          type: 'navigation',
          category: 'navigation',
          level: 'info',
          data: {
            from: fromTab,
            to: toTab,
          },
        });
      }
      break;
    }
    case ACTION.UPDATE_CURRENT_NETWORK:
      Sentry.setTag('network', action.payload);

      Sentry.addBreadcrumb({
        type: 'user',
        category: 'network-change',
        level: 'info',
        message: `Change network to ${action.payload}`,
      });
      break;
    case ACTION.UPDATE_SELECTED_ACCOUNT:
      Sentry.addBreadcrumb({
        type: 'user',
        category: 'account-change',
        level: 'info',
        message: 'Change active account',
      });
      break;
  }

  return next(action);
};
