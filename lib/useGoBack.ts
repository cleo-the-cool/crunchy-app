import { useRef, useCallback } from "react";
import { useRouter } from "expo-router";

/**
 * Returns a debounced `goBack` function that prevents multi-press navigation issues.
 * Ignores subsequent calls within 500ms of the first press.
 */
export function useGoBack() {
  const router = useRouter();
  const navigatingRef = useRef(false);

  const goBack = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    router.back();
    setTimeout(() => {
      navigatingRef.current = false;
    }, 500);
  }, [router]);

  return goBack;
}
