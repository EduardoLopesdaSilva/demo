import { Link } from "react-router-dom";

export function Publico() {
    return (
        <main className="app-shell page public-page">
            <section className="card login-card" style={{ margin: "48px auto" }}>
                <p className="page-kicker">Acesso publico</p>
                <h1>Bem-vindo</h1>
                <p className="page-description">Para usar o sistema, entre com CPF e senha fornecidos pela supervisao.</p>
                <div className="button-row" style={{ marginTop: 20 }}>
                    <Link className="btn btn-primary btn-wide" to="/login">Entrar</Link>
                </div>
            </section>
        </main>
    )
}
