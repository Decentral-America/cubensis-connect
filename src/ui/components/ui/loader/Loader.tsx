import * as React from 'react';
import * as styles from './loader.module.css';
import cn from 'classnames';

export function Loader(props) {
  if (props.hide) {
    return null;
  }

  return <div className={cn(styles.loader, 'skeleton-glow')} />;
}
