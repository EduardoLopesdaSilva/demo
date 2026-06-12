package com.example.demo.dto;


import jakarta.validation.constraints.NotBlank;

public class AuthDTO {

    // Aceita CPF ou email para login
    private String cpf;
    private String email;

    @NotBlank(message = "A senha deve ser preenchido.")
    private String senha;

    public AuthDTO() {
    }

    public AuthDTO(String identificador, String senhaOuEmail, String senhaOuCpf) {
        String senhaInformada = senhaOuCpf != null ? senhaOuCpf : senhaOuEmail;
        setIdentificador(identificador);
        this.senha = senhaInformada;
    }

    public void setIdentificador(String identificador) {
        if (identificador == null || identificador.isBlank()) {
            return;
        }

        if (identificador.contains("@")) {
            this.email = identificador;
        } else {
            this.cpf = identificador;
        }
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}
