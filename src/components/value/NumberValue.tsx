export type NumberValueProps = {
  children: React.ReactNode;
};

export function NumberValue({ children }: NumberValueProps) {
  return <span style={{ fontFamily: 'monospace' }}>{children}</span>;
}
