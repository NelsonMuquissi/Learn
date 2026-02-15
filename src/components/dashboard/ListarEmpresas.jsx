
import { useEffect, useState, } from "react";
import "../../styles/reconciliation.css";

export default function ListarEmpresas() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            credentials: "include"
          }
        );

        if (response.status === 401) {
          setError("Token inválido ou expirado. Faça login novamente.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Erro ao buscar empresas");
        }

        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError("Erro de conexão com o servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>🔄 Carregando empresas...</p>;
  }

  if (error) {
    return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  }

  return (
    <div className="reconciliation-container-empresa">
      <div className="page-header-empresa">
        <h1>Empresas Cadastradas</h1>
        <p>Lista de empresas registadas no sistema</p>
      </div>

      <div className="register-card-empresa">
        {companies.length === 0 ? (
          <p>Nenhuma empresa encontrada.</p>
        ) : (
          <table className="empresa-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Nome</th>
                <th style={th}>NIF</th>
                <th style={th}>Moeda</th>
                <th style={th}>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td style={td}>{company.name}</td>
                  <td style={td}>{company.nif}</td>
                  <td style={td}>{company.defaultCurrency}</td>
                  <td style={td}>
                    {company.createdAt
                      ? new Date(company.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* estilos simples inline (podes mover para CSS) */
const th = {
  padding: "12px",
  borderBottom: "1px solid #ccc",
  textAlign: "left"
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};
