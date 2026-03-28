import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/apiConfig";
import "../styles/main.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
        })
      });
      if (response.ok) {
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar a conta. Verifique os dados informados.');
      }
    } catch (error) {
      console.error(error);
      setError('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="neo-theme" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", position: "relative", padding: "2rem" }}>
      <div className="quantum-grid"></div>
      <div className="neon-cursor" id="neonCursor"></div>

      <style>{`
        .neo-signup-container {
          width: 100%;
          max-width: 550px;
          padding: 40px;
          background: rgba(20, 83, 45, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(200, 169, 81, 0.3);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(200, 169, 81, 0.1);
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

        .neo-signup-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .neo-signup-header h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #F0F0FF, #C8A951);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.5rem;
          letter-spacing: 1px;
        }

        .neo-signup-header p {
          color: #C8A951;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .neo-signup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 500px) {
          .neo-signup-grid {
            grid-template-columns: 1fr;
          }
        }

        .neo-input-group {
          margin-bottom: 1.2rem;
        }

        .neo-input-group.full {
          grid-column: 1 / -1;
        }

        .neo-input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #F0F0FF;
          margin-bottom: 6px;
          margin-left: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .neo-input {
          width: 100%;
          padding: 12px 16px;
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

        .neo-error-message {
          background: rgba(220, 53, 69, 0.15);
          color: #FFB3B3;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
          border: 1px solid rgba(220, 53, 69, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .neo-signup-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(200, 169, 81, 0.3);
          text-align: center;
          font-size: 0.9rem;
          color: #C8A951;
        }

        .neo-signup-footer a {
          color: #FFE074;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .neo-signup-footer a:hover {
          color: #C8A951;
          text-shadow: 0 0 10px rgba(200, 169, 81, 0.5);
        }
      `}</style>

      <div className="neo-signup-container" onMouseMove={(e) => {
        const cursor = document.getElementById("neonCursor");
        if (cursor) {
          cursor.style.left = e.clientX + "px";
          cursor.style.top = e.clientY + "px";
        }
      }}>
        <div className="neo-signup-header">
          <h1>Criar ID Kutexa</h1>
          <p>Uma única conta para gerir todas as suas finanças</p>
        </div>

        {error && (
          <div className="neo-error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="neo-signup-grid">
            <div className="neo-input-group full">
              <label>Nome Completo</label>
              <input 
                type="text" 
                name="name" 
                className="neo-input" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Seu nome completo"
                required 
              />
            </div>

            <div className="neo-input-group full">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                className="neo-input" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="seu@email.com"
                required 
              />
            </div>

            <div className="neo-input-group">
              <label>Telefone</label>
              <input 
                type="tel" 
                name="phone" 
                className="neo-input" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+244..."
              />
            </div>

            <div className="neo-input-group">
              <label>Palavra-passe</label>
              <input 
                type="password" 
                name="password" 
                className="neo-input" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button className="neo-btn-primary" type="submit" disabled={loading}>
            {loading ? "Criando Conta..." : "Criar ID Kutexa"}
          </button>
        </form>

        <div className="neo-signup-footer">
          Já tem um ID Kutexa? <Link to="/login">Inicie sessão aqui</Link>
        </div>
      </div>
    </div>
  );
}