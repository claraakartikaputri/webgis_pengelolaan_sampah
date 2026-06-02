import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else window.location.href = "/";
  };

  return (
    <div
      style={{
        height: "100vh",
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
          width: "350px",
          padding: "35px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          Welcome Back
        </h1>

        <p
          style={{
            marginBottom: "30px",
            color: "#cbd5e1",
            fontSize: "14px",
          }}
        >
          Silakan login untuk melanjutkan
        </p>

        <input
          type="email"
          placeholder="Masukkan Email"
          onChange={(e) => setEmail(e.target.value)}
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
          placeholder="Masukkan Password"
          onChange={(e) => setPassword(e.target.value)}
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
        />

        <button
          onClick={Login}
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
          Login
        </button>

        <p
          style={{
            marginTop: "20px",
            fontSize: "14px",
            color: "#cbd5e1",
          }}
        >
          Belum punya akun?{" "}
          <Link
            to="/register"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}