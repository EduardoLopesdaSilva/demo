import React, { useState, useEffect } from "react";

export default function Configuracoes() {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("dark_theme") === "true"
    );
    const [fontSize, setFontSize] = useState(
        localStorage.getItem("font_size") || "normal"
    );
    const [conConexao, setConConexao] = useState(navigator.onLine);

    useEffect(() => {
        // Toggle Dark Mode
        if (darkMode) {
            document.body.classList.add("dark-theme");
            localStorage.setItem("dark_theme", "true");
        } else {
            document.body.classList.remove("dark-theme");
            localStorage.setItem("dark_theme", "false");
        }
    }, [darkMode]);

    useEffect(() => {
        // Handle Font Size
        document.body.classList.remove("font-large", "font-xl");
        if (fontSize === "large") {
            document.body.classList.add("font-large");
        } else if (fontSize === "xl") {
            document.body.classList.add("font-xl");
        }
        localStorage.setItem("font_size", fontSize);
    }, [fontSize]);

    useEffect(() => {
        const handleOnline = () => setConConexao(true);
        const handleOffline = () => setConConexao(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <main className="app-shell page">
            <header className="page-header">
                <div>
                    <p className="page-kicker">Customização</p>
                    <h1>Configurações do aplicativo</h1>
                    <p className="page-description">Gerencie as preferências visuais e acesse recursos do sistema.</p>
                </div>
            </header>

            <section className="content-grid">
                <div className="card span-6 form-grid">
                    <div className="section-title">
                        <h2>Acessibilidade e Aparência</h2>
                    </div>

                    {/* DARK MODE */}
                    <div className="field" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px" }}>Modo Escuro (Dark Mode)</label>
                            <small>Ideal para reduzir o brilho sob luz solar ou à noite.</small>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={darkMode}
                            onChange={(e) => setDarkMode(e.target.checked)}
                            style={{ width: "24px", height: "24px", cursor: "pointer" }}
                        />
                    </div>

                    {/* TAMANHO DA FONTE */}
                    <div className="field">
                        <label htmlFor="font-size-select">Tamanho da fonte</label>
                        <small>Aumente a legibilidade dos textos em campo.</small>
                        <select
                            id="font-size-select"
                            className="select"
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                            style={{ marginTop: "8px" }}
                        >
                            <option value="normal">Normal (16px)</option>
                            <option value="large">Grande (18px)</option>
                            <option value="xl">Extra Grande (20px)</option>
                        </select>
                    </div>

                    <div className="section-title" style={{ marginTop: "20px" }}>
                        <h2>Status de Conexão</h2>
                    </div>

                    {/* STATUS DE CONEXÃO */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: conConexao ? "#166534" : "#991b1b"
                        }} />
                        <strong>Dispositivo {conConexao ? "Conectado à Internet" : "Sem Conexão (Modo Offline)"}</strong>
                    </div>
                    <small style={{ color: "var(--text-muted)", display: "block" }}>
                        As ocorrências salvas localmente serão guardadas em seu dispositivo mesmo em áreas sem sinal de internet.
                    </small>
                </div>
            </section>
        </main>
    );
}
