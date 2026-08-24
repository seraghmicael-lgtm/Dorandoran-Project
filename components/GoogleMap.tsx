"use client";

import React, { useEffect, useRef, useState } from "react";
import PlaceholderBox from "./PlaceholderBox";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleMapProps {
  lat?: number;
  lng?: number;
  width?: string;
  height?: string;
  className?: string;
  /** 서버 컴포넌트가 런타임 env에서 읽어 내려주는 키. 빌드타임 인라인에 의존하지 않는다. */
  apiKey?: string;
}

let scriptPromise: Promise<void> | null = null;

function loadScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject("SSR");
  if (window.google && window.google.maps) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => {
      scriptPromise = null;
      reject(e);
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function GoogleMap({
  lat,
  lng,
  width = "w-full",
  height = "h-[298px]",
  className = "rounded",
  apiKey: apiKeyProp,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const apiKey = apiKeyProp || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || lat == null || lng == null) {
      return;
    }

    loadScript(apiKey)
      .then(() => {
        setIsLoaded(true);
      })
      .catch(() => {
        setMapError(true);
      });
  }, [apiKey, lat, lng]);

  useEffect(() => {
    if (!isLoaded || mapError || !mapRef.current || lat == null || lng == null) {
      return;
    }

    try {
      const location = { lat, lng };
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
      });

      new window.google.maps.Marker({
        position: location,
        map,
      });
    } catch {
      setMapError(true);
    }
  }, [isLoaded, mapError, lat, lng]);

  if (!apiKey || mapError || lat == null || lng == null) {
    return (
      <PlaceholderBox width={width} height={height} className={className}>
        map
      </PlaceholderBox>
    );
  }

  return (
    <div className={`relative overflow-hidden ${width} ${height} ${className}`}>
      {!isLoaded && (
        <PlaceholderBox width="w-full" height="h-full" className="absolute inset-0">
          map
        </PlaceholderBox>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
