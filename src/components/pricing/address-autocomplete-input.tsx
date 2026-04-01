"use client";

import { useEffect, useRef } from "react";

export type ParsedPlace = {
  streetLine: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  county: string;
};

type AddressAutocompleteInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: ParsedPlace) => void;
  disabled?: boolean;
};

let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMapsPlaces(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (mapsLoadPromise) return mapsLoadPromise;

  mapsLoadPromise = new Promise((resolve, reject) => {
    const id = "google-maps-places-js";
    if (document.getElementById(id)) {
      const check = () =>
        window.google?.maps?.places ? resolve() : requestAnimationFrame(check);
      check();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    s.onload = () => resolve();
    s.onerror = () => {
      mapsLoadPromise = null;
      reject(new Error("Could not load Google Maps JavaScript API"));
    };
    document.head.appendChild(s);
  });
  return mapsLoadPromise;
}

function parseComponents(
  components: google.maps.GeocoderAddressComponent[] | undefined,
): ParsedPlace {
  let streetNumber = "";
  let route = "";
  let subpremise = "";
  let city = "";
  let state = "";
  let zip = "";
  let county = "";

  if (!components) {
    return { streetLine: "", unit: "", city: "", state: "", zip: "", county: "" };
  }

  for (const c of components) {
    const t = c.types;
    if (t.includes("street_number")) streetNumber = c.long_name;
    if (t.includes("route")) route = c.long_name;
    if (t.includes("subpremise")) subpremise = c.long_name;
    if (t.includes("locality")) city = c.long_name;
    if (t.includes("sublocality") && !city) city = c.long_name;
    if (t.includes("administrative_area_level_1")) state = c.short_name;
    if (t.includes("postal_code")) zip = c.long_name;
    if (t.includes("administrative_area_level_2")) county = c.long_name.replace(/\s+County$/i, "").trim();
  }

  const streetLine = [streetNumber, route].filter(Boolean).join(" ").trim();
  return {
    streetLine,
    unit: subpremise,
    city,
    state,
    zip,
    county,
  };
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20";

/**
 * Street-line suggestions via Google Places Autocomplete.
 * Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Maps JavaScript API + Places API enabled in Google Cloud).
 */
export function AddressAutocompleteInput({
  label,
  value,
  onChange,
  onPlaceSelected,
  disabled,
}: AddressAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  useEffect(() => {
    if (!apiKey) return;

    let cancelled = false;

    loadGoogleMapsPlaces(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current) return;

        if (listenerRef.current) {
          listenerRef.current.remove();
          listenerRef.current = null;
        }
        acRef.current = null;

        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["address_components", "formatted_address"],
          componentRestrictions: { country: ["us"] },
          types: ["address"],
        });
        acRef.current = ac;

        listenerRef.current = ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const parsed = parseComponents(place.address_components);
          const line =
            parsed.streetLine ||
            (place.formatted_address ? place.formatted_address.split(",")[0]?.trim() ?? "" : "");
          onChangeRef.current(line);
          onPlaceSelectedRef.current?.({
            ...parsed,
            streetLine: line,
          });
        });
      })
      .catch(() => {
        /* plain text field still works */
      });

    return () => {
      cancelled = true;
      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
      acRef.current = null;
    };
  }, [apiKey]);

  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold tracking-widest text-white/60">{label.toUpperCase()}</span>
      <input
        ref={inputRef}
        type="text"
        autoComplete="street-address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputClass}
      />
    </label>
  );
}
