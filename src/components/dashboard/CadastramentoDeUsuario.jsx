import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
  
export default function CadastramentoDeUsuario() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin"); // Pode mudar se quiser permitir escolha
  const { showNotification } = useAlert();

 
    const { id } = useParams();

    const  companyId = id;
  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    showNotification("Sessão expirada. Faça login novamente.", "error");
    return;
  }

  if (!companyId) {
    showNotification("ID da empresa não definido.", "error");
    return;
  }

  try {
    const response = await fetch(
      `https://kutexa-api.onrender.com/api/v1/companies/${companyId}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
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
    } else if (response.status === 403) {
      showNotification("Apenas administradores podem adicionar usuários.", "error");
    } else if (response.status === 404) {
      showNotification("Usuário com o e-mail fornecido não foi encontrado.", "warning");
    } else {
      showNotification("Erro desconhecido ao adicionar usuário.", "error");
    }
  } catch (error) {
    console.error(error);
    showNotification("Falha na comunicação com o servidor.", "error");
  }
};

  return (
    <div>
      <div className="card-whiteSmoke">
        <h2>Adicionar Usuário</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="emailInput" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="emailInput"
            aria-describedby="emailHelp"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div id="emailHelp" className="form-text">
            Nunca compartilharemos seu email com ninguém.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="roleSelect" className="form-label">Função</label>
          <select
            id="roleSelect"
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Administrador</option>
            <option value="user">Usuário</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Adicionar
        </button>
      </form>
    </div>
  );
}