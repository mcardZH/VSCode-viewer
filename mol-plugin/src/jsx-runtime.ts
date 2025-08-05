// JSX runtime shim for environments where React is not available

export function jsx(type: any, props: any) {
  // Return a simple object that represents the JSX element
  return {
    type,
    props: props || {},
    key: props?.key || null,
    ref: props?.ref || null
  };
}

export function jsxs(type: any, props: any) {
  // Same as jsx for our purposes
  return jsx(type, props);
}

export { jsx as jsxDEV };