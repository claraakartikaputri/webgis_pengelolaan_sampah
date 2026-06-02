import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map from "../components/Map";

const s = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    padding: 25,
    color: "#fff",
    fontFamily: "Arial",
  },

  card: {
    background: "#1e293b",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    marginBottom: 20,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  btn: (c = "#2563eb") => ({
    background: c,
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
    marginRight: 8,
    fontWeight: "bold",
  }),

  tab: (a) => ({
    padding: "10px 18px",
    marginRight: 8,
    cursor: "pointer",
    background: a ? "#3b82f6" : "#334155",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: "bold",
  }),

  searchWrap: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },

  search: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    border: "1px solid #475569",
    background: "#0f172a",
    color: "#fff",
    outline: "none",
    fontSize: 15,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    overflow: "hidden",
    borderRadius: 15,
    background: "#1e293b",
  },

  th: {
    background: "#334155",
    padding: 14,
    textAlign: "left",
    color: "#fff",
  },

  td: {
    padding: 14,
    borderBottom: "1px solid #334155",
    color: "#e2e8f0",
  },
};

export default function Admin() {

  const [tab, setTab] = useState("peta");

  const [list, setList] = useState({
    warga: [],
    bayar: [],
    angkut: [],
  });

  const [selectedMarker, setSelectedMarker] =
    useState(null);

  const [filter, setFilter] =
    useState("semua");

  // INPUT SEARCH
  const [searchInput, setSearchInput] =
    useState("");

  // HASIL SEARCH
  const [search, setSearch] =
    useState("");

  // ================= FETCH DATA =================
  const fetchAll = async () => {

    const { data: w } =
      await supabase
        .from("warga")
        .select("*, pembayaran(status)");

    const { data: b } =
      await supabase
        .from("pembayaran")
        .select("*, warga(nama)");

    const { data: a } =
      await supabase
        .from("pengangkutan")
        .select(
          "*, warga(nama), profiles(nama)"
        );

    setList({
      warga: w || [],
      bayar: b || [],
      angkut: a || [],
    });
  };

  // ================= LOAD =================
  useEffect(() => {
    fetchAll();
  }, []);

  // ================= LOGOUT =================
  const logout = async () => {

    await supabase.auth.signOut();

    window.location.href = "/";
  };

  // ================= SEARCH =================
  const handleSearch = async () => {

    const keyword =
      searchInput
        .toLowerCase()
        .trim();

    // CEK DATA WARGA
    const cocokWarga =
      list.warga.some((w) => {

        const nama = String(
          w.nama || ""
        ).toLowerCase();

        const alamat = String(
          w.alamat || ""
        ).toLowerCase();

        return (
          nama.includes(keyword) ||
          alamat.includes(keyword)
        );
      });

    // JIKA COCOK WARGA
    if (cocokWarga) {

      setSearch(searchInput);

      // HAPUS MARKER LOKASI
      setSelectedMarker(null);

      return;
    }

    // JIKA BUKAN DATA WARGA
    setSearch("");

    // SEARCH LOKASI MAP
    try {

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`
      );

      const data = await res.json();

      if (data.length > 0) {

        const loc = data[0];

        setSelectedMarker({
          lat: parseFloat(loc.lat),
          lng: parseFloat(loc.lon),
        });

      } else {

        alert("Lokasi tidak ditemukan");

      }

    } catch (err) {

      console.log(err);

    }
  };

  // ENTER SEARCH
  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ================= FILTER DATA =================
  const filteredWarga =
    list.warga.filter((w) => {

      const keyword =
        search
          .toLowerCase()
          .trim();

      const nama = String(
        w.nama || ""
      ).toLowerCase();

      const alamat = String(
        w.alamat || ""
      ).toLowerCase();

      const cocokSearch =
        !keyword ||
        nama.includes(keyword) ||
        alamat.includes(keyword);

      if (filter === "semua") {
        return cocokSearch;
      }

      const isSudah =
        (w.pembayaran || []).some(
          (p) => p.status === "sudah"
        );

      if (filter === "sudah") {
        return cocokSearch && isSudah;
      }

      return cocokSearch && !isSudah;
    });

  return (
    <div style={s.page}>

      <div style={s.card}>

        {/* HEADER */}
        <div style={s.header}>

          <div>

            <div style={s.title}>
              Dashboard Admin
            </div>

            <div
              style={{
                color: "#94a3b8",
              }}
            >
              Sistem Pengangkutan Sampah
            </div>

          </div>

          <button
            onClick={logout}
            style={s.btn("#ef4444")}
          >
            Logout
          </button>

        </div>

        {/* TAB */}
        <div style={{ marginBottom: 20 }}>

          {[
            "peta",
            "warga",
            "pembayaran",
            "pengangkutan",
          ].map((t) => (

            <button
              key={t}
              onClick={() => setTab(t)}
              style={s.tab(tab === t)}
            >
              {t.toUpperCase()}
            </button>

          ))}

        </div>

        {/* PETA */}
        {tab === "peta" && (

          <div>

            {/* SEARCH */}
            <div style={s.searchWrap}>

              <input
                type="text"
                placeholder="Cari nama, alamat, atau lokasi..."
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(
                    e.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                style={s.search}
              />

              <button
                onClick={handleSearch}
                style={s.btn("#16a34a")}
              >
                Cari
              </button>

            </div>

            {/* FILTER */}
            <div
              style={{
                marginBottom: 15,
              }}
            >

              {[
                "semua",
                "sudah",
                "belum",
              ].map((f) => (

                <button
                  key={f}
                  onClick={() =>
                    setFilter(f)
                  }
                  style={s.tab(
                    filter === f
                  )}
                >
                  {f.toUpperCase()}
                </button>

              ))}

            </div>

            {/* MAP */}
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                border:
                  "2px solid #334155",
              }}
            >

              <Map
                data={filteredWarga}
                search={search}
                selectedMarker={
                  selectedMarker
                }
              />

            </div>

          </div>
        )}

      </div>

    </div>
  );
} 