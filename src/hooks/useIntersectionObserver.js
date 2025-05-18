import { useRef, useEffect, useCallback } from "react";

export function useIntersectionObserver({ root = null, rootMargin = "0px", threshold = 0 } = {}) {
    const elementRef = useRef(null);
    const callbacksRef = useRef(new Set());

    const observe = useCallback((el) => {
        elementRef.current = el;
    }, []);

    const addCallback = useCallback((cb) => {
        callbacksRef.current.add(cb);
    }, []);

    const removeCallback = useCallback((cb) => {
        callbacksRef.current.delete(cb);
    }, []);

    useEffect(() => {
        if (!elementRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    callbacksRef.current.forEach((cb) => cb(entry));
                });
            },
            { root, rootMargin, threshold }
        );

        observer.observe(elementRef.current);

        return () => {
            observer.disconnect();
        };
    }, [root, rootMargin, threshold]);

    return { observe, addCallback, removeCallback };
}