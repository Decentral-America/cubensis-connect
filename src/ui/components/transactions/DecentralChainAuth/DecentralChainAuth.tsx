import * as styles from './decentralChainAuth.module.css';
import * as React from 'react';

import { DecentralChainAuthCard } from './DecentralChainAuthCard';
import { DecentralChainAuthInfo } from './DecentralChainAuthInfo';
import { TxFooter, TxHeader } from '../BaseTransaction';

export function DecentralChainAuth(props) {
  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.decentralChainAuthTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <DecentralChainAuthCard {...props} />
        </div>

        <DecentralChainAuthInfo message={message} assets={assets} />
      </div>

      <TxFooter {...props} />
    </div>
  );
}
