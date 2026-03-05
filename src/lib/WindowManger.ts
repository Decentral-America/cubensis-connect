import extension from 'extensionizer';

const height = 622;
const width = 357;

interface ExtWindow {
  id: number;
  type: string;
}

export class WindowManager {
  _notificationWindowId: number | null = null;
  _inShowMode = false;

  async showWindow(): Promise<null | void> {
    if (this._inShowMode) {
      return null;
    }
    this._inShowMode = true;
    const notificationWindow = await this._getNotificationWindow();

    if (notificationWindow) {
      extension.windows.update(notificationWindow.id, { focused: true });
    } else {
      // create new notification popup
      await new Promise<void>((resolve) => {
        extension.windows.create(
          {
            url: 'notification.html',
            type: 'popup',
            width,
            height,
          },
          (window: ExtWindow) => {
            this._notificationWindowId = window.id;
            resolve();
          },
        );
      });
    }
    this._inShowMode = false;
  }

  async resizeWindow(w: number, h: number): Promise<void> {
    const notificationWindow = await this._getNotificationWindow();
    if (notificationWindow) {
      await extension.windows.update(notificationWindow.id, { width: w, height: h });
    }
  }

  async closeWindow(): Promise<void> {
    const notificationWindow = await this._getNotificationWindow();
    if (notificationWindow) extension.windows.remove(notificationWindow.id, console.error);
  }

  async _getNotificationWindow(): Promise<ExtWindow | undefined> {
    // get all extension windows
    const windows = await new Promise<ExtWindow[]>((resolve) =>
      extension.windows.getAll({}, (windows: ExtWindow[]) => {
        resolve(windows || []);
      }),
    );

    // find our ui window
    return windows.find(
      (window: ExtWindow) => window.type === 'popup' && window.id === this._notificationWindowId,
    );
  }
}
