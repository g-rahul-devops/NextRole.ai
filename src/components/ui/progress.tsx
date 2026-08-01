import * as React from 'react';

export function Progress({ value = 0, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  return (
    <div {...props} style={{ width: '100%', background: '#334155', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: 8, background: '#38bdf8' }} />
    </div>
  );
}
