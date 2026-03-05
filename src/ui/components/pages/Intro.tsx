import * as styles from './styles/intro.module.css';
import * as React from 'react';
import { BigLogo } from '../head';

export class Intro extends React.Component {
  render() {
    return (
      <div className={styles.intro}>
        <BigLogo />
        <div className={styles.loader}></div>
      </div>
    );
  }
}
