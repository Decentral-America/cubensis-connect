import Dnode from 'dnode/browser';
import pump from 'pump';
import ObjectMultiplex from 'obj-multiplex';

type ApiObject = Record<string, unknown>;
type TransformFn = (fn: (...args: any[]) => any, context?: any) => (...args: any[]) => any;

export function setupDnode(
  connectionStream: NodeJS.ReadWriteStream,
  api: ApiObject,
  name: string,
): ReturnType<typeof Dnode> {
  const mux = new ObjectMultiplex();
  pump(connectionStream, mux, connectionStream);
  const apiStream = mux.createStream(name);
  const dnode = Dnode(transformMethods(promiseToCb, api));
  pump(apiStream, dnode, apiStream);
  return dnode;
}

export function transformMethods(
  transformation: TransformFn,
  obj: ApiObject,
  target: ApiObject = {},
): ApiObject {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      target[key] = {};
      transformMethods(transformation, obj[key] as ApiObject, target[key] as ApiObject);
    } else if (typeof obj[key] === 'function') {
      target[key] = transformation(obj[key] as (...args: unknown[]) => unknown, obj);
    } else {
      target[key] = obj[key];
    }
  });
  return target;
}

export function cbToPromise(
  fn: (...args: unknown[]) => void,
  context?: unknown,
): (...args: unknown[]) => Promise<unknown> {
  return (...args: unknown[]) => {
    return new Promise((resolve, reject) => {
      fn.call(context, ...args, (err: Error | null, val: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  };
}

export function promiseToCb(
  fn: (...args: unknown[]) => Promise<unknown>,
  context?: unknown,
): (...args: unknown[]) => void {
  const noop = () => {};

  return (...args: unknown[]) => {
    const lastArg = args[args.length - 1];
    const lastArgIsCallback = typeof lastArg === 'function';
    let callback: (...cbArgs: unknown[]) => void;
    if (lastArgIsCallback) {
      callback = lastArg as (...cbArgs: unknown[]) => void;
      args.pop();
    } else {
      callback = noop;
    }
    fn.apply(context, args)
      .then((result: unknown) => setImmediate(callback, null, result))
      .catch((error: Error) => setImmediate(callback, error));
  };
}
