declare const useRef: (initial: any) => {
    current: any;
};
declare const useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
declare const React: {
    useRef: (initial: any) => {
        current: any;
    };
    useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
    createElement: (type: any, props: any, ...children: any[]) => {
        type: any;
        props: any;
        key: any;
        ref: any;
    };
};
export { useRef, useEffect };
export default React;
