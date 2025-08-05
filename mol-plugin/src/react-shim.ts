// React shim for environments where React is not available
// This provides minimal functionality to prevent runtime errors

const useRef = (initial: any) => ({ current: initial });
const useEffect = (effect: () => void | (() => void), deps?: any[]) => {
  // In a non-React environment, we need a no-op effect system
  return;
};

// Create a minimal React-like object that matches the expected interface
const React = {
  useRef,
  useEffect,
  createElement: (type: any, props: any, ...children: any[]) => {
    // Return a simple object that represents the element
    return {
      type,
      props: { ...props, children },
      key: props?.key || null,
      ref: props?.ref || null
    };
  }
};

export { useRef, useEffect };
export default React;