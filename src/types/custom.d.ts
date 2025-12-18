declare module 'node-fetch';
declare module 'cors';

// Allow importing json service account file as string in env if needed
declare module '*.json' {
  const value: any;
  export default value;
}
