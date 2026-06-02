/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-underscore-dangle */

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

// ================= FIX ICON =================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ================= PARSE LOCATION =================
export const parseLocation = (loc) => {

  if (!loc) return null;

  // ================= HANDLE HEX / WKB =================
  if (
    typeof loc === "string" &&
    /^[0-9A-F]+$/i.test(loc)
  ) {

    try {

      const bytes = new Uint8Array(
        loc.match(/.{1,2}/g).map((b) =>
          parseInt(b, 16)
        )
      );

      const view = new DataView(
        bytes.buffer
      );

      const offset =
        loc.startsWith("0101000020")
          ? 9
          : 5;

      return {
        lng: view.getFloat64(
          offset,
          true
        ),

        lat: view.getFloat64(
          offset + 8,
          true
        ),
      };

    } catch (err) {

      console.log(err);
      return null;

    }
  }

  // ================= HANDLE POINT =================
  if (typeof loc === "string") {

    const m = loc.match(
      /POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i
    );

    if (m) {

      return {
        lat: parseFloat(m[2]),
        lng: parseFloat(m[1]),
      };
    }
  }

  // ================= HANDLE GEOJSON =================
  if (typeof loc === "object") {

    // GEOJSON
    if (loc.coordinates) {

      return {
        lat: loc.coordinates[1],
        lng: loc.coordinates[0],
      };
    }

    // NORMAL OBJECT
    if (
      typeof loc.lat === "number" &&
      typeof loc.lng === "number"
    ) {

      return {
        lat: loc.lat,
        lng: loc.lng,
      };
    }
  }

  return null;
};

// ================= AUTO MOVE MAP =================
function ChangeView({
  center,
}) {

  const map = useMap();

  useEffect(() => {

    if (!center) return;

    map.flyTo(
      [center.lat, center.lng],
      15,
      {
        animate: true,
        duration: 1.5,
      }
    );

  }, [center, map]);

  return null;
}

// ================= AUTO OPEN POPUP =================
function OpenPopup({
  filteredData,
  markerRefs,
}) {

  const map = useMap();

  useEffect(() => {

    if (
      filteredData.length === 1
    ) {

      const item =
        filteredData[0];

      const marker =
        markerRefs.current[item.id];

      if (marker) {

        marker.openPopup();

        const pos =
          marker.getLatLng();

        map.flyTo(pos, 16, {
          animate: true,
        });
      }
    }

  }, [
    filteredData,
    map,
    markerRefs,
  ]);

  return null;
}

// ================= MAP EVENTS =================
function MapEvents({
  setLatlng,
}) {

  useMapEvents({

    click(e) {

      if (setLatlng) {

        setLatlng({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      }
    },

  });

  return null;
}

// ================= MAIN COMPONENT =================
export default function Map({
  data = [],
  setLatlng,
  selectedMarker,
  search = "",
}) {

  const markerRefs =
    useRef({});

  // ================= FILTER DATA =================
  const filteredData = useMemo(() => {

    const keyword =
      search
        .toLowerCase()
        .trim();

    // JIKA TIDAK ADA SEARCH
    if (!keyword) {
      return data;
    }

    return data.filter((item) => {

      const nama = String(
        item.nama || ""
      ).toLowerCase();

      const alamat = String(
        item.alamat || ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        alamat.includes(keyword)
      );
    });

  }, [data, search]);

  // ================= CENTER MAP =================
  const center = useMemo(() => {

    // PRIORITAS SEARCH LOCATION
    if (selectedMarker) {
      return selectedMarker;
    }

    // PRIORITAS DATA FILTER
    if (
      filteredData.length > 0
    ) {

      const first =
        parseLocation(
          filteredData[0]
            ?.location
        );

      if (first) {
        return first;
      }
    }

    // DEFAULT JOGJA
    return {
      lat: -7.7956,
      lng: 110.3695,
    };

  }, [
    filteredData,
    selectedMarker,
  ]);

  return (
    <MapContainer
      center={[
        center.lat,
        center.lng,
      ]}
      zoom={13}
      scrollWheelZoom={true}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: 20,
      }}
    >

      {/* TILE */}
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* AUTO MOVE */}
      <ChangeView
        center={center}
      />

      {/* AUTO POPUP */}
      <OpenPopup
        filteredData={
          filteredData
        }
        markerRefs={
          markerRefs
        }
      />

      {/* CLICK MAP */}
      <MapEvents
        setLatlng={
          setLatlng
        }
      />

      {/* MARKERS */}
      {filteredData.map(
        (item, i) => {

          const pos =
            parseLocation(
              item.location
            );

          if (!pos) {
            return null;
          }

          return (
            <Marker
              key={
                item.id || i
              }
              position={[
                pos.lat,
                pos.lng,
              ]}
              ref={(ref) => {

                if (
                  ref &&
                  item.id
                ) {

                  markerRefs.current[
                    item.id
                  ] = ref;
                }
              }}
            >

              <Popup>

                <div
                  style={{
                    minWidth: 180,
                  }}
                >

                  <h3
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      color:
                        "#0f172a",
                    }}
                  >
                    {item.nama}
                  </h3>

                  <div
                    style={{
                      fontSize: 14,
                      marginBottom: 6,
                    }}
                  >
                    📍 {item.alamat}
                  </div>

                  <div
                    style={{
                      fontWeight:
                        "bold",

                      color:
                        item
                          ?.pembayaran?.[0]
                          ?.status ===
                        "sudah"
                          ? "green"
                          : "red",
                    }}
                  >
                    Status:{" "}
                    {item
                      ?.pembayaran?.[0]
                      ?.status ||
                      "Belum Bayar"}
                  </div>

                </div>

              </Popup>

            </Marker>
          );
        }
      )}

      {/* SEARCH LOCATION MARKER */}
      {selectedMarker && (

        <Marker
          position={[
            selectedMarker.lat,
            selectedMarker.lng,
          ]}
        >

          <Popup>
            Lokasi hasil pencarian
          </Popup>

        </Marker>
      )}

    </MapContainer>
  );
}