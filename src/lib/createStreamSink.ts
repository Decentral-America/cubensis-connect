import { Writable as WritableStream } from 'readable-stream';

export function createStreamSink(
  asyncWriteFn: (chunk: unknown, encoding?: string) => Promise<unknown>,
  _opts?: Record<string, unknown>,
): AsyncWritableStream {
  return new AsyncWritableStream(asyncWriteFn, _opts);
}

class AsyncWritableStream extends WritableStream {
  _asyncWriteFn: (chunk: unknown, encoding?: string) => Promise<unknown>;

  constructor(
    asyncWriteFn: (chunk: unknown, encoding?: string) => Promise<unknown>,
    _opts?: Record<string, unknown>,
  ) {
    const opts = Object.assign({ objectMode: true }, _opts);
    super(opts);
    this._asyncWriteFn = asyncWriteFn;
  }

  // write from incomming stream to state
  _write(chunk: unknown, encoding: string, callback: (err?: Error | null) => void): void {
    promiseToCallback(this._asyncWriteFn(chunk, encoding))(callback);
  }
}

function promiseToCallback(
  promise: Promise<unknown>,
): (cb: (err?: Error | null, data?: unknown) => void) => void {
  if (!(typeof promise.then === 'function')) {
    throw new TypeError('Expected a promise');
  }

  return function (cb: (err?: Error | null, data?: unknown) => void) {
    promise.then(
      function (data: unknown) {
        setImmediate(cb, null, data);
      },
      function (err: Error) {
        setImmediate(cb, err);
      },
    );
  };
}
