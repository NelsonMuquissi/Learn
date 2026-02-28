import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";

export default function ListarUsuariosEmpresa() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useAlert();
  const { id: companyId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Sessão expirada. Faça login novamente.", "error");
      setLoading(false);
      return;
    }

    if (!companyId) {
      showNotification("ID da empresa não definido.", "error");
      setLoading(false);
      return;
    }

    const fetchUsuarios = async () => {
      try {
        const response = await fetch(
          `https://kutexa-api.onrender.com/api/v1/companies/${companyId}/users`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          setUsuarios(data);  
        } else if (response.status === 403) {
          showNotification("Acesso não permitido.", "error");
        } else if (response.status === 401) {
          showNotification("Sessão inválida. Faça login novamente.", "error");
        } else if (response.status === 404) {
          showNotification("Nenhum usuário encontrado.", "warning");
        } else {
          showNotification("Erro desconhecido ao buscar usuários.", "error");
        }
      } catch (error) {
        console.error(error);
        showNotification("Falha na comunicação com o servidor.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [companyId, showNotification]);
  if (loading) return <p>Carregando usuários...</p>;
  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Lista de Usuários</h2>

      {usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Função</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}