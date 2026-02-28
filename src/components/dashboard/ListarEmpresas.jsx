import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ListarEmpresas() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const navigate = useNavigate()  
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
      } catch {
        setError("Erro ao buscar empresas");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading)
    return (
      <div className="container mt-3">
        <div className="alert alert-info py-2">
          🔄 Carregando...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container mt-3">
        <div className="alert alert-danger py-2">{error}</div>
      </div>
    );

  return (
    <div className="container mt-3">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Empresas</h5>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-3">

          {companies.length === 0 ? (
            <p className="text-muted mb-0">Nenhuma empresa encontrada.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nome</th>
                    <th>NIF</th>
                  
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>{company.name}</td>
                      <td>{company.nif}</td>
                     
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/${company.id}/cadastrarUSuarioEmpresa`)
                          }
                        >

                          
                          Gerir
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
  );
}