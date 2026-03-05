interface ErrorData {
  msg: string;
  name: string;
}

const ERRORS_DATA: Record<number, ErrorData> = {
  8: { msg: 'Invalid data format', name: 'INVALID_FORMAT' },
  9: { msg: 'Invalid request data', name: 'REQUEST_ERROR' },
  10: { msg: 'User denied message', name: 'USER_DENIED' },
  11: { msg: 'Unknown error', name: 'UNKNOWN' },
  12: { msg: 'Api rejected by user', name: 'API_DENIED' },
  13: { msg: 'Init Cubensis Connect and add account', name: 'INIT_KEEPER' },
  14: { msg: 'Add Cubensis Connect account', name: 'EMPTY_KEEPER' },
  15: { msg: 'Filed request', name: 'FAILED_MSG' },
  16: { msg: 'Unknown transaction data', name: 'UNKNOWN_TX' },
  17: { msg: 'Invalid idle type', name: 'UNKNOWN_IDLE' },
  18: { msg: "Can't sent notification", name: 'NOTIFICATION_ERROR' },
  19: { msg: 'Incorrect notification data', name: 'NOTIFICATION_DATA_ERROR' },
};

const DEF_CODE = 11;
const DEF_ERR = ERRORS_DATA[DEF_CODE].msg;

export class KeeperError extends Error {
  data: unknown;
  code: number | string;

  constructor(text: string = DEF_ERR, code: number | string = DEF_CODE, data: unknown = null) {
    super(text);
    this.data = data;
    this.code = code;
  }
}

export const ERRORS: Record<string, (e?: unknown) => KeeperError> = Object.entries(
  ERRORS_DATA,
).reduce((acc: Record<string, (e?: unknown) => KeeperError>, [code, data]) => {
  const { msg, name } = data;
  acc[name] = (e?: unknown) => new KeeperError(msg, code, e);
  return acc;
}, Object.create(null));
