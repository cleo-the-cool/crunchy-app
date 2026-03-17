import { useState, useEffect, useRef } from "react";
import * as Network from "expo-network";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    async function check() {
      try {
        const state = await Network.getNetworkStateAsync();
        setIsConnected(state.isInternetReachable ?? state.isConnected ?? true);
      } catch {
        setIsConnected(true);
      } finally {
        setIsChecking(false);
      }
    }

    check();
    intervalRef.current = setInterval(check, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isConnected, isChecking };
}
