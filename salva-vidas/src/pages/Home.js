import { Link } from "react-router-dom";

export function Home() {
    return (
        <main className="app-shell page public-page">
            <section className="login-page">
                <div className="login-visual">
                    <span className="login-seal" aria-hidden="true"></span>
                    <p className="page-kicker">Sistema institucional</p>
                    <h1>Gestao para Salva-Vidas</h1>
                    <p>Ambiente oficial para controle de turnos, postos e informacoes operacionais.</p>
                </div>

                <div className="login-panel-wrap">
                    <div className="card login-card">
                        <p className="page-kicker">Acesso</p>
                        <h2>Entre para continuar</h2>
                        <p className="page-description">
                            O cadastro do Guarda-Vidas e realizado pela supervisao. Use seu CPF e senha para acessar.
                        </p>
                        <div className="button-row" style={{ marginTop: 20 }}>
                            <Link className="btn btn-primary btn-wide" to="/login">Acessar sistema</Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
