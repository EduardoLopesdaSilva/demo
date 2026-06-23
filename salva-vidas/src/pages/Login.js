import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cpfBasicoValido, limparCpf, useAuth } from "../context/AuthContext";

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [identificador, setIdentificador] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const fazerLogin = async (e) => {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const valorDigitado = identificador.trim();
            const cpfLimpo = limparCpf(valorDigitado);
            const loginNumerico = /^[\d.\-\s]+$/.test(valorDigitado);
            const loginEmail = valorDigitado.includes("@");

            if (loginNumerico && !cpfBasicoValido(cpfLimpo)) {
                setErro("CPF inválido. Use 11 dígitos.");
                setCarregando(false);
                return;
            }

            const loginData = { senha };

            if (loginNumerico) {
                loginData.cpf = cpfLimpo;
            } else if (loginEmail) {
                loginData.email = valorDigitado;
            } else {
                loginData.cpf = cpfLimpo;
                loginData.email = valorDigitado;
            }

            const usuarioLogado = await login(loginData);

            if (usuarioLogado.nivelAcesso === "ADMIN") {
                navigate("/supervisor");
            } else {
                navigate("/dashboard");
            }
        } catch (erro) {
            // Converte mensagens técnicas em mensagens curtas e diretas
            if (erro.message && (erro.message.includes("autenticação") || erro.message.includes("auth") || erro.message.includes("invalid"))) {
                setErro("CPF ou senha incorretos");
            } else {
                setErro("CPF ou senha incorretos");
            }
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="app-shell" style={{ paddingTop: 0 }}>
            <main className="login-page">
                <section className="login-visual" aria-label="Identidade institucional">
                    <span className="login-seal" aria-hidden="true"></span>
                    <p className="page-kicker">Acesso restrito</p>
                    <h1>Controle Operacional</h1>
                    <p>
                        Plataforma institucional do Corpo de Bombeiros Militar de Santa Catarina para gestão de postos e salvamentos.
                    </p>
                </section>

                <section className="login-panel-wrap">
                    <div className="card login-card">
                        <p className="page-kicker">Autenticação</p>
                        <h2>Entrar no sistema</h2>
                        <p className="page-description" style={{ marginBottom: "20px" }}>Use seu CPF e senha cadastrados.</p>

                        <form className="form-grid" onSubmit={fazerLogin}>
                            <div className="field">
                                <label htmlFor="identificador">CPF</label>
                                <input
                                    id="identificador"
                                    className="input"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Digite seu CPF (apenas números)"
                                    value={identificador}
                                    onChange={(e) => setIdentificador(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="senha">Senha</label>
                                <input
                                    id="senha"
                                    className="input"
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>

                            {erro && <div className="alert alert-error">{erro}</div>}

                            <button className="btn btn-primary btn-wide" type="submit" disabled={carregando} style={{ marginTop: "10px" }}>
                                {carregando ? "Entrando..." : "Entrar"}
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}
