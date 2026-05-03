// src/pages/OAuthCallback.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { setToken } from "../api/axios";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) return navigate("/login?error=oauth");
    // Decode user from JWT
    const payload = JSON.parse(atob(token.split(".")[1]));
    login(token, { id: payload.id, role: payload.role, name: payload.name });
    navigate(payload.role === "admin" ? "/admin" : "/");
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A1628",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 15,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Completing sign in…
      </div>
    </div>
  );
}
