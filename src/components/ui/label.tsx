import * as React from 'react';

export function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={['auth-label', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </label>
  );
}
