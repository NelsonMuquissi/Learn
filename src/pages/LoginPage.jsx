import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");  

  const navigate = useNavigate();

  // Função para exibir alerta
  const showNotification = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    
    // Auto-esconder após 5 segundos
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  // Função para fechar alerta manualmente
  const closeAlert = () => {
    setShowAlert(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT INICIO");

    // Validação básica
    if (!email.trim()) {
      showNotification("Por favor, insira seu email", "warning");
      return;
    }
    
    if (!password.trim()) {
      showNotification("Por favor, insira sua senha", "warning");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("https://kutexa-api.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("RESPOSTA:", data);
      
      if (response.ok) {
        // Login bem-sucedido
        showNotification("Login realizado com sucesso!", "success");
        console.log("TOKEN:", data.access_token);
        console.log("USUÁRIO:", data.user);
        
        // Salvar token e dados do usuário
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Redirecionar após 1.5 segundos
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
        
      } else {
        // Tratar erros baseados no status code
        switch (response.status) {
          case 400:
            showNotification(data.message || "Dados inválidos. Verifique as informações.", "error");
            break;
            
          case 401:
            showNotification("Email ou senha incorretos. Tente novamente.", "error");
            break;
            
          case 403:
            if (data.message && data.message.includes("email")) {
              showNotification("Email não verificado. Verifique sua caixa de entrada.", "warning");
            } else {
              showNotification("Acesso não autorizado.", "error");
            }
            break;
            
          case 404:
            showNotification("Usuário não encontrado.", "error");
            break;
            
          case 422:
            // Erros de validação específicos
            if (data.errors) {
              const fieldErrors = {};
              data.errors.forEach(error => {
                if (error.field === 'email') {
                  setEmail("");
                  showNotification(error.message, "error");
                }
                if (error.field === 'password') {
                  setPassword("");
                  showNotification(error.message, "error");
                }
              });
            } else {
              showNotification(data.message || "Erro de validação.", "error");
            }
            break;
            
          case 429:
            showNotification("Muitas tentativas. Tente novamente em alguns minutos.", "warning");
            break;
            
          case 500:
            showNotification("Erro interno do servidor. Tente novamente mais tarde.", "error");
            break;
            
          default:
            showNotification(data.message || `Erro ${response.status}`, "error");
        }
      }
    } catch (error) {
      console.error("ERRO COMPLETO:", error);
      console.error("MENSAGEM:", error.message);
      console.log("ERRO DE REDE:", error);
      showNotification("Erro de conexão com o servidor. Verifique sua internet.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Função para login de demonstração (teste rápido)
  const handleDemoLogin = () => {
    setEmail("teste@teste.com");
    setPassword("teste4123");
    showNotification("Credenciais de teste preenchidas! Clique em Entrar.", "success");
  };

  // Função para limpar campos
  const handleClearFields = () => {
    setEmail("");
    setPassword("");
    setErrors({});
  };

  return (
    <div className="login-wrapper">
      <style>{css}</style>
      
      {/* Alert Notification */}
      {showAlert && (
        <div className={`alert-notification ${alertType}`}>
          <div className="alert-content">
            <span className="alert-icon">
              {alertType === "success" ? "✓" : 
               alertType === "warning" ? "⚠" : "✕"}
            </span>
            <span className="alert-message">{alertMessage}</span>
            <button className="alert-close" onClick={closeAlert}>×</button>
          </div>
          <div className="alert-progress"></div>
        </div>
      )}

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">KUTEXA</h1>
          <p className="login-subtitle">Acesso à plataforma</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Lembrar-me</span>
            </label>
            <Link className="forgot-link" >Esqueceu a senha?</Link>
  
          </div>

          <button 
            className="login-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Entrando...
              </>
            ) : "Entrar"}
          </button>

          <div className="divider">
            <span>ou</span>
          </div>

          {/* <div className="action-buttons">
            <button 
              type="button" 
              className="demo-button"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Usar credenciais de teste
            </button>
           
          </div> */}
        </form>

        <div className="login-footer">
          <span>Não tem uma conta?</span>
          <Link to="/signup" className="signup-link">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}

const css = `
:root {
  --primary: #c8a951;
  --primary-dark: #a88d42;
  --bg: #0b0e13;
  --card: #111827;
  --text: #e5e7eb;
  --muted: #9ca3af;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --border: #1f2937;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Alert Notification */
.alert-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  background: var(--card);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-left: 4px solid;
  overflow: hidden;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.alert-notification.success {
  border-left-color: var(--success);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), var(--card));
}

.alert-notification.error {
  border-left-color: var(--error);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--card));
}

.alert-notification.warning {
  border-left-color: var(--warning);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--card));
}

.alert-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.alert-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.success .alert-icon {
  background: var(--success);
  color: white;
}

.error .alert-icon {
  background: var(--error);
  color: white;
}

.warning .alert-icon {
  background: var(--warning);
  color: white;
}

.alert-message {
  flex: 1;
  font-size: 14px;
  color: var(--text);
  line-height: 1.4;
}

.alert-close {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.alert-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
}

.alert-progress {
  height: 3px;
  background: currentColor;
  animation: progress 5s linear;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

/* Login Container */
.login-wrapper {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1f2933, var(--bg));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(145deg, #111827, #0b1220);
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  letter-spacing: 3px;
  color: var(--primary);
  background: linear-gradient(135deg, var(--primary), #f5d76e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(200, 169, 81, 0.3);
}

.login-subtitle {
  color: var(--muted);
  margin: 0;
  font-size: 14px;
  font-weight: 400;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: var(--muted);
  font-weight: 500;
}

.form-group input {
  padding: 15px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(2, 6, 23, 0.8);
  color: var(--text);
  outline: none;
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(200, 169, 81, 0.15);
  transform: translateY(-1px);
}

.form-group input.error {
  border-color: var(--error);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-error {
  color: var(--error);
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--muted);
}

.checkbox-label input {
  accent-color: var(--primary);
  width: 16px;
  height: 16px;
}

.forgot-link {
  color: var(--primary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.forgot-link:hover {
  text-decoration: underline;
  color: #f5d76e;
}

/* Login Button */
.login-button {
  padding: 16px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, var(--primary), #f5d76e);
  color: #020617;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 5px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(200, 169, 81, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.login-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.login-button:hover::after {
  left: 100%;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #020617;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 10px 0;
  color: var(--muted);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}

.divider span {
  padding: 0 15px;
  opacity: 0.7;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-button, .clear-button {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.demo-button:hover:not(:disabled) {
  background: rgba(200, 169, 81, 0.1);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.clear-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--error);
  transform: translateY(-1px);
}

.demo-button:disabled, .clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.login-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.signup-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.signup-link:hover {
  text-decoration: underline;
  color: #f5d76e;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 24px;
  }
  
  .alert-notification {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
`;