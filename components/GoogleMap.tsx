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
  /** 지금 계신 곳 — 있으면 파란 반경 원(내 위치)을 함께 그린다 */
  origin?: { lat: number; lng: number };
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
  origin,
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

      // 찾은 장소가 지금 계신 곳과 다르면 빨간 핀으로 짚어준다
      const isDestination =
        origin && (Math.abs(origin.lat - lat) > 1e-6 || Math.abs(origin.lng - lng) > 1e-6);
      if (isDestination) {
        new window.google.maps.Marker({ position: location, map });
      }

      // 지금 계신 곳 — 구글 지도의 "내 위치" 표시(파란 점 + 반경 원)
      if (origin) {
        new window.google.maps.Circle({
          center: origin,
          radius: 80,
          map,
          strokeColor: "#4285F4",
          strokeOpacity: 0.9,
          strokeWeight: 1,
          fillColor: "#4285F4",
          fillOpacity: 0.18,
        });
        new window.google.maps.Marker({
          position: origin,
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });
      }
    } catch {
      setMapError(true);
    }
  }, [isLoaded, mapError, lat, lng, origin]);

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
