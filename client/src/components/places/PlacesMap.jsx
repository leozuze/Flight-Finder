import { useEffect, useMemo, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// FIX: this used to be conditionally assigned per-marker
// (icon={place.id === activeId ? activeIcon : undefined}), which meant
// every hover change swapped the `icon` prop reference on whichever
// markers were entering/leaving the active state. react-leaflet reacts
// to that by calling the underlying Leaflet marker's setIcon(), which
// tears down and rebuilds the icon DOM node. That's extra churn on top
// of the real problem (see Places.jsx fix) and was worth removing
// regardless. Every marker now gets the exact same stable icon
// instance, so its `icon` prop reference never changes across renders
// — setIcon is never called after initial mount.
const defaultIcon = new L.Icon.Default()

function RecenterOnChange({ lat, lon }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lon != null) map.flyTo([lat, lon], map.getZoom(), { duration: 0.8 })
  }, [lat, lon, map])
  return null
}

function InvalidateSizeOnResize() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    map.invalidateSize()

    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])
  return null
}

export default function PlacesMap({ center, places, activeId, onMarkerHover }) {
  const mapRef = useRef(null)

  // The active place is now rendered as a separate highlight layer
  // (a CircleMarker) drawn on top, instead of swapping the real
  // Marker's icon. The underlying place Marker never re-mounts or
  // re-icons when hover changes — only this lightweight overlay does.
  const activePlace = useMemo(
    () => places.find((p) => p.id === activeId && p.lat != null && p.lon != null),
    [places, activeId]
  )

  if (!center) {
    return (
      <div
        className="w-full h-full rounded-2xl flex items-center justify-center text-sm"
        style={{ border: "1px solid var(--nuvex-border)", background: "#F6F5FC", color: "var(--nuvex-slate)" }}
      >
        Waiting for location...
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden" style={{ border: "1px solid var(--nuvex-border)" }}>
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={14}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange lat={center.lat} lon={center.lon} />
        <InvalidateSizeOnResize />

        {places.map((place) =>
          place.lat == null || place.lon == null ? null : (
            <Marker
              key={place.id}
              position={[place.lat, place.lon]}
              icon={defaultIcon}
              eventHandlers={{
                mouseover: () => onMarkerHover?.(place.id),
                mouseout: () => onMarkerHover?.(null),
              }}
            >
              <Popup>
                <strong>{place.name}</strong>
                {place.address && <div style={{ fontSize: 12, marginTop: 4 }}>{place.address}</div>}
              </Popup>
            </Marker>
          )
        )}

        {activePlace && (
          <CircleMarker
            center={[activePlace.lat, activePlace.lon]}
            radius={16}
            pathOptions={{
              color: "var(--nuvex-accent)",
              weight: 3,
              fillColor: "var(--nuvex-accent)",
              fillOpacity: 0.15,
            }}
            interactive={false}
          />
        )}
      </MapContainer>
    </div>
  )
}
