import * as React from 'react';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} style={{ background: '#334155', borderRadius: 8, minHeight: 16 }} {...props} />;
}
