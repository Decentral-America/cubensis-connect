import { DecentralChainAuth } from './DecentralChainAuth';
import { DecentralChainAuthCard } from './DecentralChainAuthCard';
import { DecentralChainAuthFinal } from './DecentralChainAuthFinal';
import * as utils from './parseTx';

const decentralChainAuth = {
  type: utils.messageType,
  message: DecentralChainAuth,
  card: DecentralChainAuthCard,
  final: DecentralChainAuthFinal,
  ...utils,
};

export default decentralChainAuth;
