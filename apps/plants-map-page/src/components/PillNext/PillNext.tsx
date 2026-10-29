/**
 * Vendored from Forma 36's alpha PillNext component (MIT).
 * https://github.com/contentful/forma-36/tree/main/packages/components/pill-next
 *
 * @contentful/f36-pill-next is private and not published to npm, so the
 * component is copied here and pinned to the installed Forma 36 version.
 * This is the subset of the API used by this app; the warning/negative
 * leading-icon tooltips and arbitrary div props are omitted.
 */

import { IconButton } from '@contentful/f36-components';
import { cx } from '@emotion/css';
import React from 'react';
import { getPillNextStyles } from './PillNext.styles';
import type { PillNextSize, PillNextVariant } from './PillNext.types';

export type PillNextProps = {
  label: string;
  variant?: PillNextVariant;
  isDisabled?: boolean;
  /** Content rendered between label and end action button. */
  children?: React.ReactNode;
  /** Icon element rendered as the end action button. */
  actionIcon?: React.ReactElement;
  /** Callback fired when the action button is clicked. */
  onAction?: () => void;
  /** Accessible label for the action button. */
  actionButtonLabel?: string;
  /** Additional className applied to the action button. */
  actionButtonClassName?: string;
  /** Determines the render size of the pill */
  size?: PillNextSize;
  /** CSS class applied to the pill root. */
  className?: string;
  /** data-test-id attribute. */
  testId?: string;
};

export const PillNext = React.forwardRef<HTMLDivElement, PillNextProps>(
  (props, ref) => {
    const {
      label,
      variant = 'secondary',
      isDisabled = false,
      children,
      actionIcon,
      onAction,
      actionButtonClassName,
      testId = 'cf-ui-pill-next',
      className,
      size = 'medium',
      actionButtonLabel = 'Action',
    } = props;

    const styles = getPillNextStyles(variant, Boolean(actionIcon), size);

    return (
      <div
        className={cx(styles.pill, className)}
        data-test-id={testId}
        ref={ref}
      >
        <span className={styles.label}>{label}</span>

        {children}

        {actionIcon && (
          <IconButton
            variant="transparent"
            size={size === 'small' ? 'small' : 'medium'}
            icon={actionIcon}
            aria-label={actionButtonLabel}
            onClick={onAction}
            isDisabled={isDisabled}
            className={cx(styles.endButton, actionButtonClassName)}
          />
        )}
      </div>
    );
  },
);

PillNext.displayName = 'PillNext';
