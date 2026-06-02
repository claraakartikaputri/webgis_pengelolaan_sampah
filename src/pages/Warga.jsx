import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map from "../components/Map";

const s = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    padding: 30,
    fontFamily: "Arial, sans-serif",
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 25px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    marginBottom: 25,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    margin: 0,
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 25,
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 25,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#f8fafc",
  },

  input: {
    width: "100%",
    padding: 14,
    marginBottom: 14,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
  },

  btn: (bg) => ({
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: bg,
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: 12,
    transition: "0.3s",
    fontSize: 15,
    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
  }),

  logoutBtn: {
    background: "#ef4444",
    border: "none",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: "bold",
    cursor: "pointer",
  },

  historyCard: {
    background: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  historyTitle: {
    marginTop: 25,
    marginBottom: 12,
    fontSize: 18,
    color: "#e2e8f0",
  },
};

export default function Warga() {
  const [warga, setWarga] = useState(null);

  const [latlng, setLatlng] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    jenis: "",
    berat: "",
  });

  const [history, setHistory] = useState({
    sampah: [],
    bayar: [],
    angkut: [],
  });

  const refresh = async (id) => {
    const { data: sampah } = await supabase
      .from("sampah")
      .select("*")
      .eq("warga_id", id);

    const { data: bayar } = await supabase
      .from("pembayaran")
      .select("*")
      .eq("warga_id", id);

    const { data: angkut } = await supabase
      .from("pengangkutan")
      .select("*")
      .eq("warga_id", id);

    setHistory({
      sampah: sampah || [],
      bayar: bayar || [],
      angkut: angkut || [],
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("warga")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setWarga(data);

        setForm((prev) => ({
          ...prev,
          nama: data.nama || "",
          alamat: data.alamat || "",
        }));

        refresh(data.id);
      }
    };

    getUser();
  }, []);

  const saveProfile = async () => {
    try {
      if (!latlng) {
        alert("Pilih lokasi!");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const payload = {
        user_id: user.id,
        nama: form.nama,
        alamat: form.alamat,
        location: `POINT(${latlng.lng} ${latlng.lat})`,
      };

      let result;

      if (warga) {
        result = await supabase
          .from("warga")
          .update(payload)
          .eq("id", warga.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("warga")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        alert("Gagal menyimpan profil");
        return;
      }

      setWarga(result.data);

      alert("Profil berhasil disimpan!");

      refresh(result.data.id);

    } catch (err) {
      console.log(err);
    }
  };

  const addData = async (table, payload) => {
    try {
      if (!warga) {
        alert("Simpan profil dulu!");
        return;
      }

      const { error } = await supabase.from(table).insert({
        warga_id: warga.id,
        ...payload,
      });

      if (error) {
        alert("Gagal menyimpan data");
        return;
      }

      alert("Berhasil!");

      refresh(warga.id);

    } catch (err) {
      console.log(err);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <h1 style={s.title}>♻️ Dashboard Warga</h1>

        <button onClick={logout} style={s.logoutBtn}>
          Logout
        </button>
      </div>

      {/* LAYOUT */}
      <div style={s.layout}>
        {/* LEFT */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>
            📍 Profil & Lokasi
          </h2>

          <input
            style={s.input}
            placeholder="Nama"
            value={form.nama}
            onChange={(e) =>
              setForm({
                ...form,
                nama: e.target.value,
              })
            }
          />

          <input
            style={s.input}
            placeholder="Alamat"
            value={form.alamat}
            onChange={(e) =>
              setForm({
                ...form,
                alamat: e.target.value,
              })
            }
          />

          <Map
            setLatlng={setLatlng}
            selectedMarker={latlng}
          />

          <button
            onClick={saveProfile}
            style={s.btn("#2563eb")}
          >
            💾 Simpan Profil
          </button>

          <h2 style={s.sectionTitle}>
            🗑️ Input Sampah
          </h2>

          <input
            style={s.input}
            placeholder="Jenis Sampah"
            onChange={(e) =>
              setForm({
                ...form,
                jenis: e.target.value,
              })
            }
          />

          <input
            style={s.input}
            placeholder="Berat (kg)"
            type="number"
            onChange={(e) =>
              setForm({
                ...form,
                berat: e.target.value,
              })
            }
          />

          <button
            onClick={() =>
              addData("sampah", {
                jenis: form.jenis,
                berat: form.berat,
              })
            }
            style={s.btn("#10b981")}
          >
            ♻️ Kirim Data Sampah
          </button>

          <button
            onClick={() =>
              addData("pengangkutan", {
                status: "Menunggu",
              })
            }
            style={s.btn("#f59e0b")}
          >
            🚚 Request Pengangkutan
          </button>

          <button
            onClick={() =>
              addData("pembayaran", {
                status: "Sudah",
                tanggal: new Date(),
              })
            }
            style={s.btn("#8b5cf6")}
          >
            💳 Bayar Iuran
          </button>
        </div>

        {/* RIGHT */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>
            📊 Riwayat Aktivitas
          </h2>

          <h3 style={s.historyTitle}>
            🚚 Pengangkutan
          </h3>

          {history.angkut.length === 0 && (
            <p>Belum ada data</p>
          )}

          {history.angkut.map((a) => (
            <div key={a.id} style={s.historyCard}>
              <strong>Status:</strong> {a.status}
              <br />
              <strong>Petugas:</strong>{" "}
              {a.transporter_id
                ? "Sudah Ada"
                : "Menunggu"}
            </div>
          ))}

          <h3 style={s.historyTitle}>
            💳 Pembayaran
          </h3>

          {history.bayar.length === 0 && (
            <p>Belum ada pembayaran</p>
          )}

          {history.bayar.map((b) => (
            <div key={b.id} style={s.historyCard}>
              <strong>Tanggal:</strong>{" "}
              {new Date(
                b.tanggal
              ).toLocaleDateString()}
              <br />
              <strong>Status:</strong> {b.status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}