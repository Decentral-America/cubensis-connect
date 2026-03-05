import './initProtobuf';
import './ui/styles/app.module.css';
import './ui/styles/icons.module.css';
import './ui/i18n';

import * as Sentry from '@sentry/react';
import * as extension from 'extensionizer';
import log from 'loglevel';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { CubensisConnect_DEBUG } from './constants';
import { cbToPromise, setupDnode, transformMethods } from './lib/dnode-util';
import PortStream from './lib/port-stream';
import { setLangs } from './ui/actions';
import { createUpdateState } from './ui/actions/updateState';
import { Root } from './ui/components/Root';
import { LANGS } from './ui/i18n';
import { type BackgroundApi } from './ui/services/Background';
import backgroundService from './ui/services/Background';
import { createUiStore } from './ui/store';
import { type UpdateStateInput } from './ui/actions/updateState';

const isNotificationWindow = window.location.pathname === '/notification.html';

Sentry.init({
  dsn: __SENTRY_DSN__,
  environment: __SENTRY_ENVIRONMENT__,
  release: __SENTRY_RELEASE__,
  debug: CubensisConnect_DEBUG,
  initialScope: {
    tags: {
      source: 'popup',
    },
  },
  integrations: [Sentry.breadcrumbsIntegration({ dom: false })],
  beforeSend: async (event, hint) => {
    const message =
      hint.originalException &&
      typeof hint.originalException === 'object' &&
      'message' in hint.originalException &&
      typeof hint.originalException.message === 'string' &&
      hint.originalException.message
        ? hint.originalException.message
        : String(hint.originalException);

    const shouldIgnore = await backgroundService.shouldIgnoreError('beforeSendPopup', message);

    if (shouldIgnore) {
      return null;
    }

    return event;
  },
});

log.setDefaultLevel(CubensisConnect_DEBUG ? 'debug' : 'warn');

startUi();

async function startUi() {
  const store = createUiStore();

  store.dispatch(setLangs(LANGS));

  const container = document.getElementById('app-content');
  if (!container) throw new Error('Root element #app-content not found');

  createRoot(container).render(
    <Provider store={store}>
      <div className="app">
        <Root />
      </div>
    </Provider>,
  );

  const updateState = createUpdateState(store);

  const port = extension.runtime.connect({ name: 'ui' });
  const connectionStream = new PortStream(port);

  const emitterApi = {
    sendUpdate: async (state) => updateState(state),
    // This method is used in Microsoft Edge browser
    closeEdgeNotificationWindow: async () => {
      if (isNotificationWindow) {
        window.close();
      }
    },
  };

  const dnode = setupDnode(connectionStream as any, emitterApi, 'api');
  const background = await new Promise<BackgroundApi>((resolve) => {
    dnode.once('remote', (background) => {
      resolve(transformMethods(cbToPromise, background) as any);
    });
  });

  // global access to service on debug
  if (CubensisConnect_DEBUG) {
    Object.assign(globalThis, { background });
  }

  // If popup is opened close notification window
  if (extension.extension.getViews({ type: 'popup' }).length > 0) {
    await background.closeNotificationWindow();
  }

  if (isNotificationWindow) {
    background.resizeNotificationWindow(
      357 + window.outerWidth - window.innerWidth,
      600 + window.outerHeight - window.innerHeight,
    );
  }

  const [state, networks] = await Promise.all([background.getState(), background.getNetworks()]);

  state.networks = networks;
  updateState(state as UpdateStateInput);

  Sentry.setUser({ id: state.userId });
  Sentry.setTag('network', state.currentNetwork);

  backgroundService.init(background);
  document.addEventListener('mousemove', () => backgroundService.updateIdle());
  document.addEventListener('keyup', () => backgroundService.updateIdle());
  document.addEventListener('mousedown', () => backgroundService.updateIdle());
  document.addEventListener('focus', () => backgroundService.updateIdle());
}
