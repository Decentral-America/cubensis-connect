import * as styles from './decentralChainAuth.styl';
import * as React from 'react';
import cn from 'classnames';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';

interface IProps {
  className: string;
  collapsed: boolean;

  message: any;
}

export class DecentralChainAuthCard extends React.PureComponent<IProps> {
  render() {
    const { message, collapsed } = this.props;
    const { origin } = message;
    const className = cn(styles.decentralChainAuthTransactionCard, this.props.className, {
      [styles.decentralChainAuthCard_collapsed]: this.props.collapsed,
    });

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          {collapsed ? (
            <React.Fragment>
              <div className={styles.smallCardContent}>
                <div className={styles.decentralChainAuthTxIconSmall}>
                  <TxIcon txType={'authOrigin'} small={true} />
                </div>
                <div>
                  <div className="basic500 body3 margin-min origin-ellipsis">{origin}</div>
                  <h1 className="headline1">
                    <Trans i18nKey="transactions.signRequestDecentralChainAuth" />
                  </h1>
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div className={styles.decentralChainAuthTxIcon}>
              <TxIcon txType={'authOrigin'} />
            </div>
          )}
        </div>
        {collapsed ? null : (
          <div className={styles.cardContent}>
            <div className={styles.decentralChainAuthOriginAddress}>{origin}</div>
            <div className={styles.decentralChainAuthOriginDescription}>
              <Trans i18nKey="transactions.originWarning" />
            </div>
          </div>
        )}
      </div>
    );
  }
}
