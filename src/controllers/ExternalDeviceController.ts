import { getAdapterByType } from '@decentralchain/signature-adapter';

export class ExternalDeviceController {
  static async getUserList(adapterType: any, from: any, to: any) {
    const adapter = await getAdapterByType(adapterType);

    if (!adapter) throw new Error(`Unknown adapter type: ${adapterType}`);

    return (adapter as any).getUserList(from, to);
  }
}
