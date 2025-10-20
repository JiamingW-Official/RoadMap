export {}

declare module 'react' {
  const React: any
  export = React
}

declare module 'react/jsx-runtime' {
  export const jsx: any
  export const jsxs: any
  export const Fragment: any
}

// Minimal JSX namespace so TS accepts JSX in this sandboxed env
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}


