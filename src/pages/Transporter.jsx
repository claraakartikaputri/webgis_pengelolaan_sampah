import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map, { parseLocation } from "../components/Map";

const s = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
    padding: 30,
    fontFamily: "Poppins, Arial, sans-serif",
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 28px",
    borderRadius: 24,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.12)",
    marginBottom: 28,
    boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    margin: 0,
    letterSpacing: 1,
    color: "#fff",
  },

  logoutBtn: {
    background:
      "linear-gradient(135deg, #ef4444, #dc2626)",
    border: "none",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
    boxShadow: "0 6px 18px rgba(239,68,68,0.4)",
    transition: "0.3s",
  },

  tabs: {
    display: "flex",
    gap: 12,
    marginBottom: 28,
    flexWrap: "wrap",
  },

  tab: (active) => ({
    padding: "12px 20px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
    background: active
      ? "linear-gradient(135deg, #2563eb, #3b82f6)"
      : "rgba(255,255,255,0.08)",
    color: "#fff",
    backdropFilter: "blur(10px)",
    boxShadow: active
      ? "0 8px 20px rgba(37,99,235,0.35)"
      : "none",
  }),

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    borderRadius: 24,
    padding: 28,
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
  },

  tableWrap: {
    overflowX: "auto",
    borderRadius: 18,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 18,
  },

  th: {
    padding: 18,
    textAlign: "left",
    background:
      "linear-gradient(135deg, rgba(37,99,235,0.8), rgba(59,130,246,0.8))",
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  td: {
    padding: 18,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    background: "rgba(255,255,255,0.03)",
    fontSize: 14,
  },

  btn: (bg) => ({
    background: bg,
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    marginRight: 8,
    fontWeight: "600",
    fontSize: 13,
    transition: "0.3s",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
  }),

  badge: (status) => ({
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    display: "inline-block",
    background:
      status === "selesai"
        ? "linear-gradient(135deg, #16a34a, #22c55e)"
        : "linear-gradient(135deg, #2563eb, #60a5fa)",
    color: "#fff",
    boxShadow:
      status === "selesai"
        ? "0 4px 12px rgba(34,197,94,0.4)"
        : "0 4px 12px rgba(59,130,246,0.4)",
  }),

  sectionTitle: {
    fontSize: 24,
    marginBottom: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
};

export default function Transporter() {

  const [tab, setTab] = useState("peta");

  const [data, setData] = useState({
    warga: [],
    tugas: [],
  });

  const [myId, setMyId] = useState(null);

  // ================= FETCH DATA =================
  const fetchAll = async (tid) => {

    const { data: w, error: errW } = await supabase
      .from("warga")
      .select("*, pembayaran(status)");

    const { data: t, error: errT } = await supabase
      .from("pengangkutan")
      .select("*, warga(*)")
      .eq("transporter_id", tid || myId);

    if (errW) console.log(errW);
    if (errT) console.log(errT);

    setData({
      warga: w || [],
      tugas: t || [],
    });
  };

  // ================= LOAD AWAL =================
  useEffect(() => {

    const getUser = async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setMyId(user.id);
        fetchAll(user.id);
      }
    };

    getUser();

  }, []);

  // ================= UPDATE STATUS =================
  const handleAction = async (id, status) => {

    const { error } = await supabase
      .from("pengangkutan")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.log(error);
      return;
    }

    fetchAll();
  };

  // ================= AMBIL TUGAS =================
  const ambilTugas = async (wargaId) => {

    const { error } = await supabase
      .from("pengangkutan")
      .insert({
        warga_id: wargaId,
        transporter_id: myId,
        status: "proses",
      });

    if (error) {
      console.log(error);
      return;
    }

    fetchAll();
  };

  // ================= OPEN ROUTE =================
  const openRoute = (loc) => {

    const p = parseLocation(loc);

    if (!p) {
      alert("Lokasi tidak ada");
      return;
    }

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
      "_blank"
    );
  };

  // ================= LOGOUT =================
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.header}>

        <div>
          <h1 style={s.title}>
            🚛 Dashboard Driver
          </h1>

          <p style={{ opacity: 0.8 }}>
            Kelola pengangkutan sampah warga
          </p>
        </div>

        <button
          onClick={logout}
          style={s.logoutBtn}
        >
          Logout
        </button>
      </div>

      {/* TABS */}
      <div style={s.tabs}>
        {["peta", "warga", "tugas"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={s.tab(tab === t)}
          >
            {t === "peta" && "🗺️ Peta"}
            {t === "warga" && "👨‍👩‍👧 Warga"}
            {t === "tugas" && "📦 Tugas"}
          </button>
        ))}
      </div>

      {/* PETA */}
      {tab === "peta" && (
        <div style={s.card}>
          <h2 style={s.sectionTitle}>
            🗺️ Lokasi Warga
          </h2>

          <Map
            key={data.warga.length}
            data={data.warga}
          />
        </div>
      )}

      {/* DATA WARGA */}
      {tab === "warga" && (
        <div style={s.card}>

          <h2 style={s.sectionTitle}>
            👨‍👩‍👧 Data Warga
          </h2>

          <div style={s.tableWrap}>
            <table style={s.table}>

              <thead>
                <tr>
                  <th style={s.th}>Nama</th>
                  <th style={s.th}>Alamat</th>
                  <th style={s.th}>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {data.warga.map((w) => (

                  <tr key={w.id}>

                    <td style={s.td}>
                      {w.nama}
                    </td>

                    <td style={s.td}>
                      {w.alamat}
                    </td>

                    <td style={s.td}>

                      <button
                        onClick={() =>
                          ambilTugas(w.id)
                        }
                        style={s.btn("#16a34a")}
                      >
                        Ambil
                      </button>

                      <button
                        onClick={() =>
                          openRoute(w.location)
                        }
                        style={s.btn("#3b82f6")}
                      >
                        Route
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          </div>

        </div>
      )}

      {/* TUGAS */}
      {tab === "tugas" && (
        <div style={s.card}>

          <h2 style={s.sectionTitle}>
            📦 Tugas Saya
          </h2>

          <div style={s.tableWrap}>
            <table style={s.table}>

              <thead>
                <tr>
                  <th style={s.th}>Warga</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {data.tugas.map((t) => (

                  <tr key={t.id}>

                    <td style={s.td}>
                      {t.warga?.nama}
                    </td>

                    <td style={s.td}>
                      <span style={s.badge(t.status)}>
                        {t.status}
                      </span>
                    </td>

                    <td style={s.td}>

                      {t.status === "proses" && (
                        <button
                          onClick={() =>
                            handleAction(
                              t.id,
                              "selesai"
                            )
                          }
                          style={s.btn("#16a34a")}
                        >
                          Selesai
                        </button>
                      )}

                      <button
                        onClick={() =>
                          openRoute(
                            t.warga?.location
                          )
                        }
                        style={s.btn("#3b82f6")}
                      >
                        Route
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          </div>

        </div>
      )}

    </div>
  );
}