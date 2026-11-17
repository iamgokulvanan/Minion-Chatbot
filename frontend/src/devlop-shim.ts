export function unreachable(message?: string): never {
  throw new Error(message || 'Unreachable');
}
export function ok(value: unknown, message?: string): asserts value {
  if (!value) throw new Error(message || 'Assertion failed');
}
export default { unreachable, ok };
