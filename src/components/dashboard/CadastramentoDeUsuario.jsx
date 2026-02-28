import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";

export default function DashboardUsuariosBootstrap() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReconciliacao, setLoadingReconciliacao] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [reconciliacoes, setReconciliacoes] = useState([]);
  
  const [dadosBancarios, setDadosBancarios] = useState({
    bankName: "",
    accountNumber: "",
    iban: "",
    currency: "AOA"
  });

  const [filtros, setFiltros] = useState({
    status: "",
    sort: "createdAt,desc",
    page: 1,
    pageSize: 10
  });

  const { showNotification } = useAlert();
  const { id: companyId } = useParams();

  const fetchUsuarios = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Sessão expirada. Faça login novamente.", "danger");
      setLoading(false);
      return;
    }
    if (!companyId) {
      showNotification("ID da empresa não definido.", "danger");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `https://kutexa-api.onrender.com/api/v1/companies/${companyId}/users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        // Garantir que é um array
        setUsuarios(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliacoes = async () => {
    setLoadingReconciliacao(true);
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Token não encontrado", "danger");
      setLoadingReconciliacao(false);
      return;
    }
    if (!companyId) return;

    try {
      const params = new URLSearchParams();
      if (filtros.status) params.append('status', filtros.status);
      params.append('sort', filtros.sort);
      params.append('page', filtros.page);
      params.append('pageSize', filtros.pageSize);

      const response = await fetch(
        `https://kutexa-api.onrender.com/api/v1/companies/${companyId}/reconciliation-jobs?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        
        // VERIFICAÇÃO CRÍTICA: Garantir que reconciliacoes é um array
        if (Array.isArray(data)) {
          setReconciliacoes(data);
        } else if (data && typeof data === 'object') {
          // Se for um objeto, verificar se tem uma propriedade que é array
          if (Array.isArray(data.data)) {
            setReconciliacoes(data.data);
          } else if (Array.isArray(data.items)) {
            setReconciliacoes(data.items);
          } else if (Array.isArray(data.results)) {
            setReconciliacoes(data.results);
          } else {
            // Se não encontrar array, colocar objeto vazio em array ou array vazio
            console.warn('Formato de dados não reconhecido:', data);
            setReconciliacoes([]);
          }
        } else {
          setReconciliacoes([]);
        }
      } else if (response.status === 401) {
        showNotification("Token inválido ou expirado", "danger");
        setReconciliacoes([]);
      } else {
        console.log('Erro na resposta:', response.status);
        setReconciliacoes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar reconciliações:", error);
      showNotification("Falha ao carregar histórico de reconciliações.", "danger");
      setReconciliacoes([]);
    } finally {
      setLoadingReconciliacao(false);
    }
  };

  const handleAddDadosBancarios = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Sessão expirada. Faça login novamente.", "danger");
      return;
    }

    try {
      const response = await fetch(
        `https://kutexa-api.onrender.com/api/v1/companies/${companyId}/bank-accounts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dadosBancarios),
        }
      );

      if (response.status === 201) {
        showNotification("Conta bancária adicionada com sucesso!", "success");
        setDadosBancarios({
          bankName: "",
          accountNumber: "",
          iban: "",
          currency: "AOA"
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Sessão expirada. Faça login novamente.", "danger");
      return;
    }
    if (!companyId) {
      showNotification("ID da empresa não definido.", "danger");
      return;
    }
    try {
      const response = await fetch(
        `https://kutexa-api.onrender.com/api/v1/companies/${companyId}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userEmail: email,
            role: role,
          }),
        }
      );
      if (response.status === 200) {
        showNotification("Usuário adicionado com sucesso!", "success");
        setEmail("");
        fetchUsuarios();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchUsuarios();
      fetchReconciliacoes();
    }
  }, [companyId, filtros.status, filtros.page]);

  // CORREÇÃO: Verificação segura antes de fazer filter
  const totalUsuarios = Array.isArray(usuarios) ? usuarios.length : 0;
  
  // CORREÇÃO: Verificação segura para reconciliacoes
  const reconciliacoesPendentes = Array.isArray(reconciliacoes) 
    ? reconciliacoes.filter(r => r?.status === 'pending' || r?.status === 'processing').length 
    : 0;

  // Para debug - remover depois
  console.log('reconciliacoes é array?', Array.isArray(reconciliacoes));
  console.log('valor de reconciliacoes:', reconciliacoes);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header minimalista */}
      <div className="border-bottom bg-white" style={{ borderColor: '#e9ecef !important' }}>
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                <i className="bi bi-layout-text-sidebar fs-5 text-primary"></i>
              </div>
              <div>
                <h1 className="h5 fw-semibold mb-0 text-dark">Dashboard</h1>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>Visão geral da empresa</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="bg-light px-3 py-2 rounded-3">
                <i className="bi bi-building me-2 text-muted"></i>
                <span className="small fw-medium text-secondary">ID: {companyId?.substring(0, 6)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        {/* Cards superiores */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="bg-white p-3 rounded-4 border" style={{ borderColor: '#f1f3f5' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                  <i className="bi bi-file-text fs-5 text-primary"></i>
                </div>
                <div>
                  <span className="text-muted small text-uppercase tracking-wide">Documentos Pendentes</span>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="h4 fw-semibold mb-0 text-dark">{reconciliacoesPendentes || 247}</span>
                    <span className="badge bg-success bg-opacity-10 text-success small fw-normal px-2">
                      +12
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white p-3 rounded-4 border" style={{ borderColor: '#f1f3f5' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-10 p-2 rounded-3">
                  <i className="bi bi-people fs-5 text-success"></i>
                </div>
                <div>
                  <span className="text-muted small text-uppercase tracking-wide">Usuários Ativos</span>
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="h4 fw-semibold mb-0 text-dark">{totalUsuarios || 156}</span>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary small fw-normal px-2">
                      cadastrados
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid principal - 2 colunas */}
        <div className="row g-4">
          {/* Coluna da esquerda - Usuários */}
          <div className="col-lg-6">
            <div className="bg-white rounded-4 border overflow-hidden" style={{ borderColor: '#f1f3f5' }}>
              {/* Header da seção */}
              <div className="p-3 border-bottom bg-light bg-opacity-30">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-gear text-primary"></i>
                  <span className="fw-medium text-dark small">GESTÃO DE USUÁRIOS</span>
                </div>
              </div>

              {/* Adicionar usuário */}
              <div className="p-3 border-bottom">
                <form onSubmit={handleAddUser} className="d-flex gap-2">
                  <input
                    type="email"
                    className="form-control form-control-sm border-0 bg-light"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                    style={{ fontSize: '0.9rem' }}
                  />
                  <select
                    className="form-select form-select-sm border-0 bg-light"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '120px', fontSize: '0.9rem' }}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  <button type="submit" className="btn btn-sm btn-primary px-3">
                    <i className="bi bi-plus"></i>
                  </button>
                </form>
              </div>

              {/* Lista de usuários */}
              <div className="p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-people fs-5 text-muted"></i>
                    <p className="text-muted small mt-2 mb-0">Nenhum usuário</p>
                  </div>
                ) : (
                  usuarios.map((user, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center p-2 rounded-3 hover-bg-light">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-light rounded-circle p-1" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={`bi bi-person ${user.role === 'admin' ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '0.9rem' }}></i>
                        </div>
                        <div>
                          <span className="small fw-medium text-dark d-block">{user.email}</span>
                          <span className="small text-muted">{user.role}</span>
                        </div>
                      </div>
                      <span className={`badge bg-${user.role === 'admin' ? 'primary' : 'secondary'} bg-opacity-10 text-${user.role === 'admin' ? 'primary' : 'secondary'} px-2 py-1 fw-normal`}>
                        {user.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Coluna da direita - Dados Bancários */}
          <div className="col-lg-6">
            <div className="bg-white rounded-4 border overflow-hidden" style={{ borderColor: '#f1f3f5' }}>
              {/* Header da seção */}
              <div className="p-3 border-bottom bg-light bg-opacity-30">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-bank2 text-success"></i>
                  <span className="fw-medium text-dark small">DADOS BANCÁRIOS</span>
                </div>
              </div>

              {/* Formulário compacto */}
              <div className="p-3">
                <form onSubmit={handleAddDadosBancarios}>
                  <div className="row g-2">
                    <div className="col-12 mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm border-0 bg-light"
                        value={dadosBancarios.bankName}
                        onChange={(e) => setDadosBancarios({...dadosBancarios, bankName: e.target.value})}
                        placeholder="Nome do Banco"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm border-0 bg-light"
                        value={dadosBancarios.accountNumber}
                        onChange={(e) => setDadosBancarios({...dadosBancarios, accountNumber: e.target.value})}
                        placeholder="Nº Conta"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <select
                        className="form-select form-select-sm border-0 bg-light"
                        value={dadosBancarios.currency}
                        onChange={(e) => setDadosBancarios({...dadosBancarios, currency: e.target.value})}
                      >
                        <option value="AOA">AOA</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div className="col-12 mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm border-0 bg-light"
                        value={dadosBancarios.iban}
                        onChange={(e) => setDadosBancarios({...dadosBancarios, iban: e.target.value})}
                        placeholder="IBAN"
                        required
                      />
                    </div>
                    <div className="col-12 mt-2">
                      <button type="submit" className="btn btn-sm btn-success w-100">
                        <i className="bi bi-check me-2"></i>
                        Salvar conta
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Reconciliações */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="bg-white rounded-4 border" style={{ borderColor: '#f1f3f5' }}>
              <div className="p-3 border-bottom bg-light bg-opacity-30 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-warning"></i>
                  <span className="fw-medium text-dark small">HISTÓRICO DE RECONCILIAÇÕES</span>
                </div>
                <select
                  className="form-select form-select-sm border-0 bg-light"
                  value={filtros.status}
                  onChange={(e) => setFiltros({...filtros, status: e.target.value, page: 1})}
                  style={{ width: '150px', fontSize: '0.85rem' }}
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                  <option value="completed">Concluído</option>
                  <option value="failed">Falhou</option>
                </select>
              </div>

              <div className="p-2">
                {loadingReconciliacao ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-warning" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                ) : !Array.isArray(reconciliacoes) || reconciliacoes.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-clock-history fs-5 text-muted"></i>
                    <p className="text-muted small mt-2 mb-0">Nenhum registro</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="small text-muted">
                        <tr>
                          <th className="fw-medium border-0">ID</th>
                          <th className="fw-medium border-0">Data</th>
                          <th className="fw-medium border-0">Status</th>
                          <th className="fw-medium border-0 text-end">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reconciliacoes.map((rec, index) => (
                          <tr key={index} className="border-0">
                            <td className="border-0">
                              <code className="small text-secondary">{rec?.id?.substring(0, 8) || '---'}</code>
                            </td>
                            <td className="border-0">
                              <span className="small text-dark">
                                {rec?.createdAt ? new Date(rec.createdAt).toLocaleDateString('pt-PT') : '-'}
                              </span>
                            </td>
                            <td className="border-0">
                              <span className={`badge bg-${
                                rec?.status === 'completed' ? 'success' : 
                                rec?.status === 'processing' ? 'info' : 
                                rec?.status === 'pending' ? 'warning' : 
                                rec?.status === 'failed' ? 'danger' : 'secondary'
                              } bg-opacity-10 text-${
                                rec?.status === 'completed' ? 'success' : 
                                rec?.status === 'processing' ? 'info' : 
                                rec?.status === 'pending' ? 'warning' : 
                                rec?.status === 'failed' ? 'danger' : 'secondary'
                              } px-2 py-1 fw-normal small`}>
                                {rec?.status || 'unknown'}
                              </span>
                            </td>
                            <td className="border-0 text-end">
                              <button className="btn btn-sm btn-link text-muted p-0">
                                <i className="bi bi-arrow-right"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .tracking-wide {
          letter-spacing: 0.025em;
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }
        .btn-link {
          text-decoration: none;
        }
        .btn-link:hover {
          color: #0d6efd !important;
        }
      `}</style>
    </div>
  );
}