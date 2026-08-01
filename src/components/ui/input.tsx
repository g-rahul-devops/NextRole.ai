import * as React from 'react';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={['auth-input', className].filter(Boolean).join(' ')} {...props} />;
}
