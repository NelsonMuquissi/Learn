import { useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import "../../styles/reconciliation.css";
export default function Cadastroempresas() {
  const [companyData, setCompanyData] = useState({
    name: "",
    nif: "",
    defaultCurrency: "AOA"
  });

    const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

 
const {showNotification} = useAlert();

  const validateCompanyForm = () => {
    const newErrors = {};

    if (!companyData.name.trim()) {
      newErrors.name = "Nome da empresa é obrigatório";
    } else if (companyData.name.length < 3) {
      newErrors.name = "Nome muito curto (mínimo 3 caracteres)";
    }

    if (!companyData.nif.trim()) {
      newErrors.nif = "NIF é obrigatório";
    } else if (!/^[0-9]{9,14}$/.test(companyData.nif)) {
      newErrors.nif = "NIF inválido (apenas números)";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateCompanyForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Sessão expirada. Faça login novamente.");
      return;
    }
    setProcessing(true);
    try {
      const response = await fetch(
        "https://kutexa-api.onrender.com/api/v1/companies/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({
            name: companyData.name,
            nif: companyData.nif,
            defaultCurrency: companyData.defaultCurrency,
          
          })
        }
      );
      const data = await response.json();

      if (response.status === 409) {
        showNotification("Empresa já cadastrada com este NIF","error");
        return;
      }

      if (response.status === 401) {
        showNotification("Não autorizado. Faça login novamente.");
        return;
      }

      if (!response.ok) {
        showNotification(data.error || "Erro ao cadastrar empresa");
        return;
      }

      showNotification(`Empresa "${data.name || companyData.name}" cadastrada com sucesso!` ,"success");

      // Reset form
      setCompanyData({
        name: "",
        nif: "",
        defaultCurrency: "AOA"
      });
      setErrors({});
    } catch (error) {
      showNotification("Erro de conexão com o servidor");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="reconciliation-container-empresa">
      <div className="page-header-empresa">
        <h1>Cadastrar Nova Empresa</h1>
        <p>Preencha os dados da empresa</p>
      </div>

      <div className="register-card-empresa">
        <div className="logo-empresa">
          <div className="upload-header-empresa">
            <div className="upload-icon-empresa">
              <i className="fas fa-building"></i>
            </div>
            <h2>Kutexa</h2>
          </div>
          <p className="logo-subtitle-empresa">Cadastrar Nova Empresa</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="upload-section-empresa">
            {/* Informações da Empresa */}
            <div className="upload-card-empresa">
              <div className="upload-header-empresa">
                <div className="upload-icon-empresa">
                  <i className="fas fa-info-circle"></i>
                </div>
                <h3>Informações da Empresa</h3>
              </div>

              <div className="upload-area-empresa" style={{ padding: "20px" }}>
                <div className="form-grid-empresa">
                  <div className="form-group-empresa">
                    <label htmlFor="companyName">
                      <i className="fas fa-building"></i> Nome da Empresa
                    </label>
                    <div className="input-with-icon-empresa">
                      <input
                        type="text"
                        id="companyName"
                        name="name"
                        placeholder="Nome da empresa"
                        value={companyData.name}
                        onChange={handleCompanyChange}
                        required
                        className={errors.name ? "error-input" : ""}
                      />
                      {errors.name && (
                        <div className="error-message" style={{ color: "red", fontSize: "0.9em", marginTop: "5px" }}>
                          {errors.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group-empresa">
                    <label htmlFor="companyNIF">
                      <i className="fas fa-id-card"></i> NIF
                    </label>
                    <div className="input-with-icon-empresa">
                      <input
                        type="text"
                        id="companyNIF"
                        name="nif"
                        placeholder="Número de identificação fiscal"
                        value={companyData.nif}
                        onChange={handleCompanyChange}
                        required
                        className={errors.nif ? "error-input" : ""}
                      />
                      {errors.nif && (
                        <div className="error-message" style={{ color: "red", fontSize: "0.9em", marginTop: "5px" }}>
                          {errors.nif}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Cadastro */}
          <div className="process-section-empresa">
            <button
              type="submit"
              className="process-btn-empresa"
              disabled={processing}
            >
              {processing ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-check-circle"></i>
              )}{" "}
              {processing ? "Cadastrando..." : "Cadastrar Empresa"}
            </button>
          </div>
        </form>

        <div className="security-notice-empresa">
          <i className="fas fa-shield-alt"></i>
          Dados protegidos com criptografia avançada
        </div>
      </div>
    </div>
  );
}