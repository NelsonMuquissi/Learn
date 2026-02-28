import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ListarEmpresas() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroNif, setFiltroNif] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Sessão expirada. Faça login novamente.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://kutexa-api.onrender.com/api/v1/companies/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error();

        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch {
        setError("Erro ao buscar empresas");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Função de pesquisa
  useEffect(() => {
    let resultados = companies;

    if (searchTerm) {
      resultados = resultados.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroNif) {
      resultados = resultados.filter(company =>
        company.nif?.includes(filtroNif)
      );
    }

    setFilteredCompanies(resultados);
  }, [searchTerm, filtroNif, companies]);

  const limparFiltros = () => {
    setSearchTerm("");
    setFiltroNif("");
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-muted small">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="text-center">
          <div className="bg-danger bg-opacity-10 p-4 rounded-4 mb-3">
            <i className="bi bi-exclamation-triangle fs-1 text-danger"></i>
          </div>
          <h5 className="text-dark mb-2">Ops! Algo deu errado</h5>
          <p className="text-muted small mb-3">{error}</p>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div className="border-bottom bg-white" style={{ borderColor: '#e9ecef' }}>
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                <i className="bi bi-building fs-5 text-primary"></i>
              </div>
              <div>
                <h1 className="h5 fw-semibold mb-0 text-dark">Empresas</h1>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="bg-light px-3 py-2 rounded-3">
                <i className="bi bi-grid-3x3 me-2 text-muted"></i>
                <span className="small fw-medium text-secondary">Total: {companies.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        {/* Card de Filtros */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-white rounded-4 border p-3" style={{ borderColor: '#f1f3f5' }}>
              <div className="row g-3">
                <div className="col-md-5">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-light rounded-3 p-2">
                      <i className="bi bi-search text-muted"></i>
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm border-0 bg-light"
                      placeholder="Pesquisar por nome da empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-light rounded-3 p-2">
                      <i className="bi bi-upc-scan text-muted"></i>
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm border-0 bg-light"
                      placeholder="Filtrar por NIF..."
                      value={filtroNif}
                      onChange={(e) => setFiltroNif(e.target.value)}
                      style={{ fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <button 
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={limparFiltros}
                    disabled={!searchTerm && !filtroNif}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="row">
          <div className="col-12">
            <div className="bg-white rounded-4 border overflow-hidden" style={{ borderColor: '#f1f3f5' }}>
              {/* Header da tabela */}
              <div className="p-3 border-bottom bg-light bg-opacity-30">
                <div className="row align-items-center">
                  <div className="col-6">
                    <span className="fw-medium text-dark small">
                      <i className="bi bi-building me-2"></i>
                      NOME DA EMPRESA
                    </span>
                  </div>
                  <div className="col-3">
                    <span className="fw-medium text-dark small">
                      <i className="bi bi-upc-scan me-2"></i>
                      NIF
                    </span>
                  </div>
                  <div className="col-3 text-end">
                    <span className="fw-medium text-dark small">
                      AÇÕES
                    </span>
                  </div>
                </div>
              </div>

              {/* Corpo da tabela */}
              <div className="p-2">
                {filteredCompanies.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="bg-light d-inline-block p-4 rounded-4 mb-3">
                      <i className="bi bi-building fs-1 text-muted"></i>
                    </div>
                    <h6 className="text-dark mb-2">Nenhuma empresa encontrada</h6>
                    <p className="text-muted small mb-3">
                      {searchTerm || filtroNif 
                        ? 'Tente ajustar os filtros de pesquisa' 
                        : 'Nenhuma empresa cadastrada no sistema'}
                    </p>
                    {(searchTerm || filtroNif) && (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={limparFiltros}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Limpar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <tbody>
                        {filteredCompanies.map((company) => (
                          <tr key={company.id} className="border-0">
                            <td className="border-0 py-3" style={{ width: '60%' }}>
                              <div className="d-flex align-items-center gap-3">
                                <div className="bg-light bg-opacity-50 rounded-3 p-2">
                                  <i className="bi bi-building text-primary"></i>
                                </div>
                                <div>
                                  <span className="fw-medium text-dark d-block">
                                    {company.name}
                                  </span>
                                  <small className="text-muted">
                                    ID: {company.id?.substring(0, 8)}...
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="border-0" style={{ width: '20%' }}>
                              <span className="badge bg-light text-dark fw-normal px-3 py-2">
                                {company.nif || '---'}
                              </span>
                            </td>
                            <td className="border-0 text-end" style={{ width: '20%' }}>
                              <button
                                className="btn btn-sm btn-primary px-4"
                                onClick={() => navigate(`/${company.id}/cadastrarUSuarioEmpresa`)}
                              >
                                <i className="bi bi-arrow-right me-2"></i>
                                Acessar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer com paginação (placeholder) */}
              {filteredCompanies.length > 0 && (
                <div className="p-3 border-top bg-light bg-opacity-30">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Mostrando {filteredCompanies.length} de {companies.length} empresas
                    </small>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-light" disabled>
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <span className="btn btn-sm btn-primary">1</span>
                      <button className="btn btn-sm btn-light" disabled>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }
      `}</style>
    </div>
  );
}