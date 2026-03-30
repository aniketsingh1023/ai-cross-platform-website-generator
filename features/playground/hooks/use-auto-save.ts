import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_INTERVAL = 30000; // 30 seconds

export function useAutoSave(
  isDirty: boolean,
  onSave: () => void,
  interval: number = DEFAULT_INTERVAL
) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);

  // Keep ref up to date to avoid stale closures
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const performSave = useCallback(async () => {
    setIsAutoSaving(true);
    try {
      onSaveRef.current();
      setLastSaved(new Date());
    } finally {
      setIsAutoSaving(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isDirty) {
      timerRef.current = setTimeout(() => {
        performSave();
      }, interval);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isDirty, interval, performSave]);

  return { isAutoSaving, lastSaved };
}
