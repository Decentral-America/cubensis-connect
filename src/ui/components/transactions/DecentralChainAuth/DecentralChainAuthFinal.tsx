import * as React from 'react';
import { TxStatus } from '../BaseTransaction';
import { useTranslation } from 'react-i18next';

export function DecentralChainAuthFinal(props) {
  const { t } = useTranslation();

  return (
    <TxStatus
      {...props}
      messages={{
        send: t('sign.decentralChainAuthConfirmed'),
        approve: t('sign.decentralChainAuthConfirmed'),
        reject: t('sign.authRejected'),
      }}
    />
  );
}
