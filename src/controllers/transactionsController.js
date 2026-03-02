import {
  customData,
  verifyCustomData,
  wavesAuth as decentralChainAuth,
} from '@decentralchain/transactions';

export const decentralChain = {
  parseDecentralChainAuth: (message) => {
    if (!message || message.type !== 'decentralChainAuth') {
      throw new Error('Incorrect data for sign decentralChainAuth data');
    }

    const { data } = message;
    const { hash } = decentralChainAuth(data, 'fake user');
    return {
      id: hash,
    };
  },

  signDecentralChainAuth: async (data, user) => {
    return decentralChainAuth(data, user.seed);
  },

  parseCustomData: (message) => {
    if (!message || message.type !== 'customData') {
      throw new Error('Incorrect data for sign custom data');
    }

    const { data } = message;
    const { hash } = customData(data, 'fake user');
    return {
      id: hash,
    };
  },

  verifyCustomData: async (data) => {
    return verifyCustomData(data);
  },

  signCustomData: async (data, user) => {
    return customData(data, user.seed);
  },
};
