import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "warga",
  });

  const navigate = useNavigate();

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) return alert(error.message);

    const { error: pError } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          nama: form.nama,
          role: form.role,
        },
      ]);

    if (pError) return alert("Gagal simpan profil");

    alert("Berhasil! Silakan Login.");
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "35px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          color: "white",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "30px",
            fontWeight: "bold",
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#cbd5e1",
            fontSize: "14px",
          }}
        >
          Daftar akun baru untuk melanjutkan
        </p>

        <input
          placeholder="Nama Lengkap"
          onChange={(e) =>
            setForm({
              ...form,
              nama: e.target.value,
            })
          }
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "18px",
            borderRadius: "12px",
            border: "none",
            outline: "none",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            fontSize: "15px",
          }}
        />

        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "18px",
            borderRadius: "12px",
            border: "none",
            outline: "none",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            fontSize: "15px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "18px",
            borderRadius: "12px",
            border: "none",
            outline: "none",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            fontSize: "15px",
          }}
        />

        <select
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value,
            })
          }
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "25px",
            borderRadius: "12px",
            border: "none",
            outline: "none",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            fontSize: "15px",
          }}
        >
          <option value="warga" style={{ color: "black" }}>
            Warga
          </option>
          <option value="transporter" style={{ color: "black" }}>
            Transporter
          </option>
          <option value="admin" style={{ color: "black" }}>
            Admin
          </option>
        </select>

        <button
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseOver={(e) =>
            (e.target.style.background =
              "linear-gradient(135deg, #2563eb, #1d4ed8)")
          }
          onMouseOut={(e) =>
            (e.target.style.background =
              "linear-gradient(135deg, #3b82f6, #2563eb)")
          }
        >
          Daftar
        </button>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "14px",
            color: "#cbd5e1",
          }}
        >
          Sudah punya akun?{" "}
          <Link
            to="/login"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}