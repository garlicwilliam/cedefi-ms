export function parseErrorMessage(err: any): string {
  return (err as any)['shortMessage'] || err.message;
}
