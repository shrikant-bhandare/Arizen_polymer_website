import type { ReactNode } from 'react';

/** Renders a headline line with its trailing full stop in the accent colour. */
export function accentStop(line: string): ReactNode {
  if (!line.endsWith('.')) return line;
  return (
    <>
      {line.slice(0, -1)}
      <span className="text-cyan">.</span>
    </>
  );
}
