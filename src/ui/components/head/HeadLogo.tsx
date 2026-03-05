import * as React from 'react';
import cn from 'classnames';
import './head.module.css';

export function HeadLogo({ className = '', children = null, ...props }) {
  const newClassName = cn(className, 'logo');
  return (
    <div className={newClassName} {...props}>
      {children}
    </div>
  );
}
