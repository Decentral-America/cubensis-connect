import { Duplex } from 'readable-stream';

interface Port {
  onMessage: { addListener: (cb: (msg: unknown) => void) => void };
  onDisconnect: { addListener: (cb: () => void) => void };
  postMessage: (msg: unknown) => void;
}

/**
 * Creates a stream that's both readable and writable.
 * The stream supports arbitrary objects.
 */
export default class PortDuplexStream extends (Duplex as any) {
  _port: Port;

  constructor(port: Port) {
    super({ objectMode: true });
    this._port = port;
    port.onMessage.addListener(this._onMessage.bind(this));
    port.onDisconnect.addListener(this._onDisconnect.bind(this));
  }

  _onMessage(msg: unknown): void {
    if (Buffer.isBuffer(msg)) {
      delete (msg as any)._isBuffer;
      const data = Buffer.from(msg);
      this.push(data);
    } else {
      this.push(msg);
    }
  }

  _onDisconnect(): void {
    this.destroy();
  }

  _read(): void {}

  _write(msg: unknown, _encoding: string, cb: (err?: Error | null) => void): void {
    try {
      if (Buffer.isBuffer(msg)) {
        const data: Record<string, unknown> = msg.toJSON();
        data._isBuffer = true;
        this._port.postMessage(data);
      } else {
        this._port.postMessage(msg);
      }
    } catch (err) {
      return cb(new Error('PortDuplexStream - disconnected'));
    }
    cb();
  }
}
