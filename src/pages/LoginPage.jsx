import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/apiConfig";
import "../styles/main.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorVisible("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setErrorVisible(data.detail || data.message || data.error || "Erro ao realizar login");
      }
    } catch (err) {
      console.error(err);
      setErrorVisible("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neo-theme" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative" }}>
      <div className="quantum-grid"></div>
      <div className="neon-cursor" id="neonCursor"></div>

      <style>{`
        .neo-login-container {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          background: rgba(20, 83, 45, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(200, 169, 81, 0.3);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(200, 169, 81, 0.1);
          text-align: center;
          animation: slideInUp 0.6s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .neo-logo-area {
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .neo-logo-area i {
          font-size: 3rem;
          background: linear-gradient(135deg, #14532D, #C8A951);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(200, 169, 81, 0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(200, 169, 81, 0.8)); }
        }

        .neo-logo-area h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #F0F0FF, #C8A951);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin: 0;
          letter-spacing: 2px;
        }

        .neo-logo-area p {
          color: #C8A951;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .neo-input-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .neo-input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #F0F0FF;
          margin-bottom: 8px;
          margin-left: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .neo-input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid rgba(200, 169, 81, 0.4);
          background: rgba(20, 83, 45, 0.3);
          color: #F0F0FF;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
          box-sizing: border-box;
          font-family: inherit;
        }

        .neo-input::placeholder {
          color: rgba(200, 169, 81, 0.5);
        }

        .neo-input:focus {
          border-color: #C8A951;
          box-shadow: 0 0 20px rgba(200, 169, 81, 0.3), inset 0 0 10px rgba(200, 169, 81, 0.1);
          background: rgba(20, 83, 45, 0.5);
        }

        .neo-btn-primary {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(200, 169, 81, 0.5);
          background: linear-gradient(135deg, #14532D, #1a6d3b);
          color: #F0F0FF;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 0 20px rgba(200, 169, 81, 0.2);
        }

        .neo-btn-primary:hover {
          background: linear-gradient(135deg, #1a6d3b, #14532D);
          box-shadow: 0 0 30px rgba(200, 169, 81, 0.5);
          transform: translateY(-2px);
          border-color: #C8A951;
        }

        .neo-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .neo-login-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(200, 169, 81, 0.3);
          font-size: 0.9rem;
          color: #C8A951;
        }

        .neo-login-footer a {
          color: #FFE074;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          position: relative;
        }

        .neo-login-footer a:hover {
          color: #C8A951;
          text-shadow: 0 0 10px rgba(200, 169, 81, 0.5);
        }

        .neo-error-banner {
          background: rgba(220, 53, 69, 0.15);
          color: #FFB3B3;
          padding: 14px;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          border: 1px solid rgba(220, 53, 69, 0.4);
          text-align: left;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="neo-login-container" onMouseMove={(e) => {
        const cursor = document.getElementById("neonCursor");
        if (cursor) {
          cursor.style.left = e.clientX + "px";
          cursor.style.top = e.clientY + "px";
        }
      }}>
        <div className="neo-logo-area">
          <i className="fas fa-layer-group"></i>
          <h1>Kutexa</h1>
          <p>Inicie sessão para gerir as suas finanças</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errorVisible && (
            <div className="neo-error-banner">
              <i className="fas fa-exclamation-circle"></i>
              {errorVisible}
            </div>
          )}
          <div className="neo-input-group">
            <label>Endereço de Email</label>
            <input
              type="email"
              className="neo-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="neo-input-group">
            <label>Palavra-passe</label>
            <input
              type="password"
              className="neo-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="neo-btn-primary" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar Sessão"}
          </button>
        </form>

        <div className="neo-login-footer">
          Não tem uma conta? <Link to="/signup">Criar ID Kutexa</Link>
        </div>
      </div>
    </div>
  );
}
