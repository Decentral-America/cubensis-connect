import * as styles from './styles/info.module.css';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { BigLogo } from '../head';

export class Info extends React.Component {
  render() {
    return (
      <div className={`${styles.content} body1`}>
        <BigLogo className={`${styles.logoLeft} margin-main`} noTitle={true} />

        <div className="margin-main basic500">
          <Trans i18nKey="info.keepUp">
            Cubensis Connect — is the safest way to interact with third-party web resources with
            DCC-integrated functionality or DApps. Using Cubensis Connect, you can sign transactions
            and remain safe from malicious sites.
          </Trans>
        </div>

        <a
          rel="noopener noreferrer"
          className="link black"
          target="_blank"
          href="https://decentralchain.io/blog"
        >
          DecentralChain
        </a>

        <div className={`${styles.social} margin-main`}>
          <div className="margin-main basic500">
            <Trans i18nKey="info.joinUs">Join the DCC Community</Trans>
          </div>
          <ul>
            <li className={styles.github}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://github.com/Decentral-America"
              ></a>
            </li>
            <li className={styles.telegram}>
              <a rel="noopener noreferrer" target="_blank" href="https://t.me/decentralchain"></a>
            </li>
            <li className={styles.twitter}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://twitter.com/decentralchain"
              ></a>
            </li>
          </ul>
        </div>

        <div className="basic500">&copy; DecentralChain</div>
      </div>
    );
  }
}
