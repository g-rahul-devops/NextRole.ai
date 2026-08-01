import * as React from 'react';

export function Toaster(props: Record<string, unknown>) {
  return <div data-testid="toaster" {...props} />;
}
