declare module 'node:assert/strict' {
  const assertFn: any;
  export default assertFn;
}
declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export default test;
}
