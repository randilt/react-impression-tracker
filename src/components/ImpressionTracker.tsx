import React, { useCallback, useEffect, useMemo } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { StorageManager } from "../utils/storage";
import { APIManager } from "../utils/api";
import { ImpressionTrackerProps, ImpressionData } from "../types";

export const ImpressionTracker: React.FC<ImpressionTrackerProps> = ({
  elementId,
  children,
  onImpression,
  metadata = {},
  viewDuration = 5000,
  batchInterval = 10000,
  storage = { type: "sessionStorage" },
  api,
  disabled = false,
}) => {
  const storageManager = useMemo(() => new StorageManager(storage), [storage]);
  const apiManager = useMemo(() => (api ? new APIManager(api) : null), [api]);

  const handleImpression = useCallback(
    (data: ImpressionData) => {
      const impressions = storageManager.getItem("impressions") || [];

      // Check for duplicates
      if (!impressions.some((imp: any) => imp.elementId === data.elementId)) {
        impressions.push(data);
        storageManager.setItem("impressions", impressions);
        onImpression?.(data);
      }
    },
    [elementId, onImpression, storageManager]
  );

  const intersectionCallback = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (disabled || !entry.isIntersecting) return;

      let timeoutId: ReturnType<typeof setTimeout>;

      timeoutId = setTimeout(() => {
        const impressionData: ImpressionData = {
          elementId,
          timestamp: Date.now(),
          metadata,
        };
        handleImpression(impressionData);
      }, viewDuration);

      return () => clearTimeout(timeoutId);
    },
    [disabled, elementId, metadata, viewDuration, handleImpression]
  );

  const targetRef = useIntersectionObserver(intersectionCallback, {
    threshold: 0.5,
  });

  useEffect(() => {
    if (disabled || !apiManager) return;

    const intervalId = setInterval(() => {
      const impressions = storageManager.getItem("impressions") || [];
      if (impressions.length > 0) {
        apiManager
          .sendData(impressions)
          .then(() => {
            storageManager.setItem("impressions", []);
          })
          .catch(console.error);
      }
    }, batchInterval);

    return () => clearInterval(intervalId);
  }, [disabled, apiManager, storageManager, batchInterval]);

  return <div ref={targetRef}>{children}</div>;
};
