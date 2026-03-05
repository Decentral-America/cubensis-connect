import * as React from 'react';
import { libs } from '@decentralchain/transactions';
import cn from 'classnames';
import * as styles from './attachment.module.css';

const { base58Encode } = libs.crypto;

export const Attachment: React.FunctionComponent<IAttachment> = ({
  attachment,
  className,
  ...otherProps
}) => {
  const myClassName = cn(styles.attachment, className);
  const text =
    typeof attachment !== 'string'
      ? `base58:${base58Encode(new Uint8Array(Object.values(attachment)))}`
      : attachment;

  return (
    <div className={myClassName} {...otherProps}>
      {text}
    </div>
  );
};

interface IAttachment {
  attachment: string | Array<number> | Uint8Array;
  className?: string;
}
