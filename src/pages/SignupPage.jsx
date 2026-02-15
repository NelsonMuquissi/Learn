import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    company: "",
    acceptTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "success", "error", "warning"
  
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

  // Função para validar força da senha
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  // Validação dos campos
  const validateForm = () => {
    const newErrors = {};
    let hasError = false;
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
      hasError = true;
    } else if (formData.name.length < 3) {
      newErrors.name = "Nome muito curto (mínimo 3 caracteres)";
      hasError = true;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
      hasError = true;
    }
    
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
      hasError = true;
    } else if (formData.password.length < 8) {
      newErrors.password = "Senha deve ter no mínimo 8 caracteres";
      hasError = true;
    } else if (passwordStrength < 50) {
      newErrors.password = "Senha muito fraca. Use letras maiúsculas, números e símbolos.";
      hasError = true;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
      hasError = true;
    }
    
    if (formData.phone && !/^(\+244)?[9][1-9][0-9]{7}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Telefone inválido (ex: +244 923 456 789)";
      hasError = true;
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Deve aceitar os termos e condições";
      hasError = true;
    }
    
    if (hasError) {
      showNotification("Por favor, corrija os erros no formulário", "warning");
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('https://kutexa-api.onrender.com/api/v1/auth/register',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
        })
      });
      const data = await response.json();
      console.log("RESPOSTA DO CADASTRO:", data);
      
      if (response.ok) {
        if (data.token) {
          // Cadastro com login automático
          showNotification("Conta criada com sucesso! Redirecionando...", "success");
          localStorage.setItem('token', data.token);
          if (data.user) {
            
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
         
          showNotification("Conta criada com sucesso! Verifique seu email para ativar sua conta.", "success");
       
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            company: "",
            acceptTerms: false
          });
          setPasswordStrength(0);
        }
      } else {
      
        switch (response.status) {
          case 400:
            if (data.errors) {
              const fieldErrors = {};
              data.errors.forEach(error => {
                const fieldMap = {
                  'email': 'email',
                  'phone_number': 'phone',
                  'password': 'password',
                  'name': 'name',
                  'company': 'company'
                };
                
                if (fieldMap[error.field]) {
                  fieldErrors[fieldMap[error.field]] = error.message;
                }
              });
              setErrors(fieldErrors);
              showNotification("Erro de validação. Verifique os campos destacados.", "error");
            } else {
              showNotification(data.detail || 'Dados inválidos. Verifique as informações.', "error");
            }
            break;
            
          case 409:
            if (data.detail && data.detail.includes('email')) {
              setErrors({ email: 'Este email já está cadastrado.' });
              showNotification("Este email já está cadastrado.", "warning");
            } else if (data.detail && (data.detail.includes('telefone') || data.detail.includes('phone'))) {
              setErrors({ phone: 'Este número de telefone já está cadastrado.' });
              showNotification("Este número de telefone já está cadastrado.", "warning");
            } else {
              showNotification(data.detail || 'Usuário já cadastrado.', "warning");
            }
            break;
            
          case 422:
            showNotification(data.detail || "Erro de validação dos dados.", "error");
            break;
            
          case 429:
            showNotification("Muitas tentativas. Tente novamente em alguns minutos.", "warning");
            break;
            
          case 500:
            showNotification("Erro interno do servidor. Tente novamente mais tarde.", "error");
            break;
          default:
            showNotification(data.detail || `Erro ${response.status} no cadastro`, "error");
        }
      }
    } catch (error) {
      console.error('ERRO DE REDE:', error);
      showNotification("Erro de conexão com o servidor. Verifique sua internet.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Limpar alerta quando o usuário começa a digitar
    if (showAlert) {
      setShowAlert(false);
    }
    
    // Atualizar força da senha
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Validação em tempo real para confirmar senha
    if (name === 'confirmPassword' || name === 'password') {
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ 
          ...prev, 
          confirmPassword: "As senhas não coincidem" 
        }));
      } else if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  // Função para preencher com dados de teste
  const handleFillTestData = () => {
    const testData = {
      name: "kutexa",
      email: "teste@teste.com",
      password: "teste4123",
      confirmPassword: "teste4123",
      phone: "+244 923 456 789",
      company: "Tech Solutions",
      acceptTerms: true
    };
    setFormData(testData);
    setPasswordStrength(checkPasswordStrength(testData.password));
    showNotification("Dados de teste preenchidos! Revise e clique em Criar Conta.", "success");
  };

  // Estilos CSS inline
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
  --info: #3b82f6;
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

/* Signup Container */
.signup-wrapper {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1f2933, var(--bg));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.signup-card {
  width: 100%;
  max-width: 690px;
  background: linear-gradient(145deg, #111827, #0b1220);
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.signup-header {
  text-align: center;
  margin-bottom: 32px;
}

.signup-title {
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

/* Form Styles */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
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

/* Password Strength Indicator */
.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #374151;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  background: var(--error);
  transition: width 0.3s ease, background 0.3s ease;
}

.strength-fill.weak { 
  width: 33%; 
  background: var(--error); 
}
.strength-fill.medium { 
  width: 66%; 
  background: var(--warning); 
}
.strength-fill.strong { 
  width: 100%; 
  background: var(--success); 
}

.strength-text {
  font-size: 11px;
  color: var(--muted);
  text-align: right;
}

/* Checkbox Terms */
.terms-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 10px 0;
  padding: 15px;
  background: rgba(2, 6, 23, 0.3);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.terms-group input[type="checkbox"] {
  margin-top: 2px;
  accent-color: var(--primary);
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}

.terms-group label {
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
  cursor: pointer;
}

.terms-group a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.terms-group a:hover {
  text-decoration: underline;
  color: #f5d76e;
}

/* Signup Button */
.signup-button {
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
  margin-top: 10px;
}

.signup-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(200, 169, 81, 0.4);
}

.signup-button:active:not(:disabled) {
  transform: translateY(0);
}

.signup-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.signup-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.signup-button:hover::after {
  left: 100%;
}

/* Spinner */
.loading-spinner {
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

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.test-data-button {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(59, 130, 246, 0.1);
  color: var(--info);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  flex: 1;
}

.test-data-button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--info);
  transform: translateY(-1px);
}

.clear-button {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  flex: 1;
}

.clear-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--error);
  transform: translateY(-1px);
}

.test-data-button:disabled,
.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.signup-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.signup-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.signup-footer a:hover {
  text-decoration: underline;
  color: #f5d76e;
}

/* Phone Format Hint */
.phone-hint {
  font-size: 11px;
  color: var(--muted);
  margin-top: 4px;
}

/* Responsive */
@media (max-width: 520px) {
  .signup-card {
    padding: 30px 24px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .alert-notification {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
  }
  
  .terms-group {
    padding: 12px;
  }
  
  .terms-group label {
    font-size: 13px;
  }
}
`;

  return (
    <div className="signup-wrapper">
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

      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">KUTEXA</h1>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                name="name"
                placeholder="João Silva"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                required
                disabled={loading}
              />
              {errors.name && (
                <div className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
                disabled={loading}
              />
              {errors.email && (
                <div className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.email}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Senha *</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                required
                disabled={loading}
              />
              {errors.password && (
                <div className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.password}
                </div>
              )}
              
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className={`strength-fill ${
                      passwordStrength < 50 ? 'weak' : 
                      passwordStrength < 75 ? 'medium' : 'strong'
                    }`}></div>
                  </div>
                  <div className="strength-text">
                    Força: {
                      passwordStrength < 50 ? 'Fraca' : 
                      passwordStrength < 75 ? 'Média' : 'Forte'
                    } ({passwordStrength}%)
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirmar Senha *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                required
                disabled={loading}
              />
              {errors.confirmPassword && (
                <div className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefone (Angola)</label>
              <input
                type="tel"
                name="phone"
                placeholder="+244 923 456 789"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                disabled={loading}
              />
              {errors.phone && (
                <div className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.phone}
                </div>
              )}
              <div className="phone-hint">
                Formato: +244 9XX XXX XXX
              </div>
            </div>
 
          </div>

          <div className="terms-group">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="acceptTerms">
              Concordo com os <a href="#" target="_blank">Termos de Uso</a> e <a href="#" target="_blank">Política de Privacidade</a> *
            </label>
          </div>
          {errors.acceptTerms && (
            <div className="field-error">
              <i className="fas fa-exclamation-circle"></i>
              {errors.acceptTerms}
            </div>
          )}

          <div className="action-buttons">
            <button 
              type="button" 
              className="test-data-button"
              onClick={handleFillTestData}
              disabled={loading}
            >
              Preencher com dados de teste
            </button>
     
          </div>

          <button 
            className="signup-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="signup-footer">
          Já tem uma conta?
          <Link to="/login">Faça login aqui</Link>
        </div>
      </div>
    </div>
  );
}