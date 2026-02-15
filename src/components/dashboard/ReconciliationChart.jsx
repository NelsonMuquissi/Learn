import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import "../../styles/reconciliation.css";

export default function Reconciliation() {
  const [bankStatementFile, setBankStatementFile] = useState(null);
  const [invoiceFiles, setInvoiceFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
const {showNotification} = useAlert();
  const extratosRef = useRef(null);
  const [companies, setCompanies] = useState([]);
  const faturasRef = useRef(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const processBtnRef = useRef(null);
 
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "fa-file-pdf";
    if (["xlsx", "xls", "csv"].includes(ext)) return "fa-file-excel";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "fa-file-image";
    return "fa-file";
  };


     useEffect(() => {
      const fetchCompanies = async () => {
        const token = localStorage.getItem("token");
  
        if (!token) {
          showNotification("Sessão expirada. Faça login novamente.","error");
        
          return;
        }
  
        try {
          const response = await fetch(
            "https://kutexa-api.onrender.com/api/v1/companies/",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              credentials: "include"
            }
          );
  
          if (response.status === 401) {
            showNotification("Token inválido ou expirado. Faça login novamente.","error");
            return;
          }
  
          if (!response.ok) {
            throw new Error("Erro ao buscar empresas");
          }
  
          const data = await response.json();
          setCompanies(data);
          console.log(data)
        } catch (err) {
          showNotification("Erro de conexão com o servidor","error");
        } finally {
         
        }
      };
  
      fetchCompanies();
    }, []);
  



  // Upload handlers
  const handleBankStatementChange = (e) => {
    const file = e.target.files[0];
    if (file) setBankStatementFile(file);
  };

  const handleInvoiceChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) setInvoiceFiles(files);
  };

  // Drag-and-drop
  const handleDrop = (e, type) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    if (type === "bank") {
      setBankStatementFile(files[0]);
      extratosRef.current.files = files;
    } else {
      setInvoiceFiles(files);
      faturasRef.current.files = files;
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  // Remove files
  const removeBankStatement = () => {
    setBankStatementFile(null);
    extratosRef.current.value = "";
  };

  const removeInvoice = (index) => {
    const updated = [...invoiceFiles];
    updated.splice(index, 1);
    setInvoiceFiles(updated);
  };

  // Process reconciliation
  
const processReconciliation = async () => {
  if (!bankStatementFile || invoiceFiles.length === 0) return;

  setProcessing(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Sessão expirada. Faça login novamente.", "error");
      setProcessing(false);
      return;
    }

    // Criar FormData
    const formData = new FormData();
    formData.append("companyId", selectedCompany);
    formData.append("periodStart", startDate);
    formData.append("periodEnd", endDate);

 
    formData.append("files", bankStatementFile);  
    invoiceFiles.forEach((file) => formData.append("files", file));  

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const response = await fetch(
      "https://kutexa-api.onrender.com/api/v1/reconciliation-jobs/upload",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },  
        body: formData,
      }
    );
    console.log("Status:", response.status);
    try {
      const data = await response.json();
      console.log("Resposta da API:", data);
    } catch {
      console.log("Resposta não retornou JSON");
    }

    if (response.ok) {
      showNotification("✅ Reconciliação concluída com sucesso!", "success");
      removeBankStatement();
      setInvoiceFiles([]);
    } else {
      showNotification("Erro ao processar reconciliação", "error");
    }
  } catch (err) {
    console.error(err);
    showNotification(err.message, "error");
  } finally {
    setProcessing(false);
  }
};



  // Listar empressa

 

  return (
    <div className="reconciliation-container">
      <div className="page-header">
        <h1>Processo de Reconciliação</h1>
        <p>Envie o extrato bancário e as faturas para reconciliação automática</p>
      </div>
 
        <div className="reconcilia-filters-container">
      <div className="reconcilia-field">
        <label htmlFor="company-select" className="reconcilia-label">Empresa:</label>
        <select
          id="company-select"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="reconcilia-select"
        >
          <option value="">Selecione uma empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

          <div className="reconcilia-field">
            <label htmlFor="start-date" className="reconcilia-label">Data de Início:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="reconcilia-date"
            />
          </div>

          <div className="reconcilia-field">
            <label htmlFor="end-date" className="reconcilia-label">Data de Finalização:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="reconcilia-date"
            />
          </div>
      </div>


      <div className="upload-section">
        {/* Extrato Bancário */}
        <div className="upload-card">
          <div className="upload-header">
            <div className="upload-icon">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <h3>Extrato Bancário</h3>
          </div>
          <div
            className="upload-area"
            onDrop={(e) => handleDrop(e, "bank")}
            onDragOver={handleDragOver}
          >
            <div className="upload-icon-large">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="upload-text">
              <h4>Upload do Extrato Bancário</h4>
              <p>Arraste ou clique para fazer upload</p>
            </div>
            <input
              type="file"
              ref={extratosRef}
              accept=".pdf,.xlsx,.csv"
              style={{ display: "none" }}
              onChange={handleBankStatementChange}
            />
            <button
              className="upload-btn"
              onClick={() => extratosRef.current.click()}
            >
              Selecionar Arquivo
            </button>
            {bankStatementFile && (
              <div className="files-list">
                <div className="file-item">
                  <div className="file-icon">
                    <i className={`fas ${getFileIcon(bankStatementFile.name)}`}></i>
                  </div>
                  <div className="file-info">
                    <div className="file-name">{bankStatementFile.name}</div>
                    <div className="file-size">{formatFileSize(bankStatementFile.size)}</div>
                  </div>
                  <div className="file-actions">
                    <button
                      className="file-action-btn"
                      onClick={removeBankStatement}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Faturas */}
        <div className="upload-card">
          <div className="upload-header">
            <div className="upload-icon">
              <i className="fas fa-receipt"></i>
            </div>
            <h3>Faturas</h3>
          </div>
          <div
            className="upload-area"
            onDrop={(e) => handleDrop(e, "invoice")}
            onDragOver={handleDragOver}
          >
            <div className="upload-icon-large">
              <i className="fas fa-file-upload"></i>
            </div>
            <div className="upload-text">
              <h4>Upload de Faturas de Extrato</h4>
              <p>Arraste ou clique para fazer upload (múltiplos)</p>
            </div>
            <input
              type="file"
              ref={faturasRef}
              multiple
              accept=".pdf,.xlsx,.csv"
              style={{ display: "none" }}
              onChange={handleInvoiceChange}
            />
            <button
              className="upload-btn"
              onClick={() => faturasRef.current.click()}
            >
              Selecionar Arquivos
            </button>
            {invoiceFiles.length > 0 && (
              <div className="files-list">
                {invoiceFiles.map((file, index) => (
                  <div className="file-item" key={index}>
                    <div className="file-icon">
                      <i className={`fas ${getFileIcon(file.name)}`}></i>
                    </div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                    <div className="file-actions">
                      <button
                        className="file-action-btn"
                        onClick={() => removeInvoice(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

  
      <div className="process-section">
        <button
          className="process-btn"
          onClick={processReconciliation}
          disabled={!bankStatementFile || invoiceFiles.length === 0 || processing}
        >
          {processing ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-sync-alt"></i>
          )}{" "}
          {processing ? "Processando..." : "Iniciar Reconciliação"}
        </button>
      </div>
    </div>
  );
}
