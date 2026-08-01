import * as React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'lg';
};

export function Button({
  children,
  asChild = false,
  variant = 'default',
  size,
  className,
  style,
  ...props
}: ButtonProps) {
  const classes = ['button', `button-${variant}`, size ? `button-${size}` : '', className]
    .filter(Boolean)
    .join(' ');

  const sharedProps = {
    className: classes,
    style,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, sharedProps);
  }

  return (
    <button {...props} {...sharedProps}>
      {children}
    </button>
  );
}
