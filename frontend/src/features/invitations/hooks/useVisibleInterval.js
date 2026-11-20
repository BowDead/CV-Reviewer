import { useEffect, useRef } from "react";

export function useVisibleInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (document.visibilityState === "visible") {
        savedCallback.current();
      }
    }

    const timer = setInterval(tick, delay);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [delay]);
}
