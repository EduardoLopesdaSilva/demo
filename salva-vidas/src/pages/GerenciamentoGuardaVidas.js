import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { limparCpf, cpfBasicoValido } from "../context/AuthContext";

export default function GerenciamentoGuardaVidas() {
    const [usuarios, setUsuarios] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editando, setEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        nomeCompleto: "",
        cpf: "",
        nivelAcesso: "GUARDA_VIDAS"
    });

    const carregarUsuarios = async () => {
        setCarregando(true);
        setErro("");
        try {
            const data = await apiRequest("/usuarios");
            setUsuarios(data);
        } catch (error) {
            setErro(error.message || "Erro ao carregar usuários");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const handleChange = (e) => {
        const valor = e.target.name === "cpf" ? limparCpf(e.target.value) : e.target.value;
        setFormulario({ ...formulario, [e.target.name]: valor });
    };

    const salvarUsuario = async (e) => {
        e.preventDefault();
        setErro("");

        if (!formulario.nomeCompleto.trim() || !formulario.cpf) {
            setErro("Preencha nome completo e CPF");
            return;
        }

        if (!cpfBasicoValido(formulario.cpf)) {
            setErro("CPF inválido. Deve ter 11 números.");
            return;
        }

        try {
            setCarregando(true);
            if (editando) {
                await apiRequest(`/usuarios/${editando.id}`, {
                    method: "PUT",
                    body: formulario
                });
            } else {
                await apiRequest("/usuarios", {
                    method: "POST",
                    body: formulario
                });
            }
            setMostrarFormulario(false);
            setEditando(null);
            setFormulario({ nomeCompleto: "", cpf: "", nivelAcesso: "GUARDA_VIDAS" });
            carregarUsuarios();
        } catch (error) {
            setErro(error.message || "Erro ao salvar usuário");
        } finally {
            setCarregando(false);
        }
    };

    const editarUsuario = (usuario) => {
        setEditando(usuario);
        setFormulario({
            nomeCompleto: usuario.nomeCompleto,
            cpf: usuario.cpf,
            nivelAcesso: usuario.nivelAcesso
        });
        setMostrarFormulario(true);
    };

    const desativarUsuario = async (id) => {
        if (!window.confirm("Tem certeza que deseja desativar este usuário?")) {
            return;
        }
        try {
            setCarregando(true);
            await apiRequest(`/usuarios/${id}`, {
                method: "DELETE"
            });
            carregarUsuarios();
        } catch (error) {
            setErro(error.message || "Erro ao desativar usuário");
        } finally {
            setCarregando(false);
        }
    };

    const cancelarEdicao = () => {
        setMostrarFormulario(false);
        setEditando(null);
        setFormulario({ nomeCompleto: "", cpf: "", nivelAcesso: "GUARDA_VIDAS" });
        setErro("");
    };

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Administração</p>
                    <h1>Guarda-Vidas</h1>
                    <p className="page-description">
                        Cadastre, edite e acompanhe os profissionais autorizados a acessar o sistema. A senha inicial usa os 6 primeiros digitos do CPF.
                    </p>
                </div>

                {/* botão movido para a parte inferior da página para melhor visibilidade em mobile */}
            </header>

            <section className="content-grid">
                {erro && <div className="alert alert-error span-12">{erro}</div>}

                {!mostrarFormulario ? (
                    <section className="card span-12">
                        <div className="section-title">
                            <h2>Lista de profissionais</h2>
                        </div>

                        {carregando ? (
                            <div className="alert alert-info">Carregando Guarda-Vidas...</div>
                        ) : usuarios.length === 0 ? (
                            <div className="empty-state">Nenhum Guarda-Vida cadastrado.</div>
                        ) : (
                            <>
                                {/* TABELA: VISÍVEL NO DESKTOP */}
                                <div className="table-wrap">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Nome completo</th>
                                                <th>CPF</th>
                                                <th>Nível de acesso</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuarios.map((usuario) => (
                                                <tr key={usuario.id}>
                                                    <td style={{ fontWeight: "bold" }}>{usuario.nomeCompleto}</td>
                                                    <td>{usuario.cpf}</td>
                                                    <td>
                                                        <span className={`badge ${usuario.nivelAcesso === "ADMIN" ? "badge-admin" : "badge-free"}`}>
                                                            {usuario.nivelAcesso}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${usuario.ativo ? "badge-active" : "badge-inactive"}`}>
                                                            {usuario.ativo ? "Ativo" : "Inativo"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="button-row">
                                                            <button className="btn btn-secondary" style={{ minHeight: "38px", padding: "8px 14px", fontSize: "0.85rem" }} onClick={() => editarUsuario(usuario)}>
                                                                Editar
                                                            </button>
                                                            {usuario.ativo && (
                                                                <button className="btn btn-danger" style={{ minHeight: "38px", padding: "8px 14px", fontSize: "0.85rem" }} onClick={() => desativarUsuario(usuario.id)}>
                                                                    Desativar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* LISTA DE CARTÕES: VISÍVEL NO MOBILE */}
                                <div className="responsive-cards-container">
                                    {usuarios.map((usuario) => (
                                        <div className="user-mobile-card" key={usuario.id}>
                                            <div className="user-card-header">
                                                <span className="user-card-name">{usuario.nomeCompleto}</span>
                                                <span className={`badge ${usuario.nivelAcesso === "ADMIN" ? "badge-admin" : "badge-free"}`}>
                                                    {usuario.nivelAcesso}
                                                </span>
                                            </div>
                                            <div className="user-card-details">
                                                <div><strong>CPF:</strong> {usuario.cpf}</div>
                                                <div>
                                                    <strong>Status:</strong>{" "}
                                                    <span className={`badge ${usuario.ativo ? "badge-active" : "badge-inactive"}`} style={{ padding: "2px 6px", fontSize: "0.7rem" }}>
                                                        {usuario.ativo ? "Ativo" : "Inativo"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="user-card-actions">
                                                <button className="btn btn-secondary" style={{ flex: 1, minHeight: "44px", padding: "8px" }} onClick={() => editarUsuario(usuario)}>
                                                    Editar
                                                </button>
                                                {usuario.ativo && (
                                                    <button className="btn btn-danger" style={{ flex: 1, minHeight: "44px", padding: "8px" }} onClick={() => desativarUsuario(usuario.id)}>
                                                        Desativar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                ) : (
                    <section className="card span-7">
                        <div className="section-title">
                            <h2>{editando ? "Editar Guarda-Vida" : "Novo Guarda-Vida"}</h2>
                        </div>

                        <form className="form-grid" onSubmit={salvarUsuario}>
                            <div className="field">
                                <label htmlFor="nomeCompleto">Nome completo</label>
                                <input
                                    id="nomeCompleto"
                                    className="input"
                                    type="text"
                                    name="nomeCompleto"
                                    value={formulario.nomeCompleto}
                                    onChange={handleChange}
                                    required
                                    disabled={carregando}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="cpf">CPF</label>
                                <input
                                    id="cpf"
                                    className="input"
                                    type="text"
                                    name="cpf"
                                    inputMode="numeric"
                                    maxLength="11"
                                    value={formulario.cpf}
                                    onChange={handleChange}
                                    required
                                    disabled={!!editando || carregando}
                                    placeholder="Apenas os 11 números"
                                />
                                {editando && <small>O CPF não pode ser alterado após o cadastro.</small>}
                            </div>

                            <div className="field">
                                <label htmlFor="nivelAcesso">Nível de acesso</label>
                                <select
                                    id="nivelAcesso"
                                    className="select"
                                    name="nivelAcesso"
                                    value={formulario.nivelAcesso}
                                    onChange={handleChange}
                                    disabled={carregando}
                                >
                                    <option value="GUARDA_VIDAS">Guarda-Vidas</option>
                                    <option value="ADMIN">Administrador (Sargento)</option>
                                </select>
                            </div>

                            <div className="button-row" style={{ marginTop: "10px" }}>
                                <button className="btn btn-primary" type="submit" disabled={carregando} style={{ flex: 1 }}>
                                    {carregando ? "Salvando..." : "Salvar"}
                                </button>
                                <button className="btn btn-secondary" type="button" onClick={cancelarEdicao} disabled={carregando} style={{ flex: 1 }}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </section>

            <div
                style={{
                    position: "fixed",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1000,
                    width: "calc(100% - 40px)",
                    maxWidth: 480,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                {!mostrarFormulario && (
                    <button
                        className="btn btn-primary btn-wide"
                        style={{
                            width: "100%",
                            padding: "14px 18px",
                            fontSize: "16px",
                            boxShadow: "0 6px 18px rgba(13, 110, 253, 0.2)",
                            borderRadius: "10px"
                        }}
                        onClick={() => setMostrarFormulario(true)}
                        aria-label="Adicionar novo guarda-vida"
                    >
                        + Novo Guarda-Vida
                    </button>
                )}
            </div>
        </main>
    );
}
