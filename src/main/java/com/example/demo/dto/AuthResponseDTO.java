package com.example.demo.dto;

import com.example.demo.enums.NivelAcesso;

public class AuthResponseDTO {

    private String token;
    private Long id;
    private String cpf;
    private String email;
    private NivelAcesso nivelAcesso;

    public AuthResponseDTO(String token, Long id, String cpf, String email, NivelAcesso nivelAcesso) {
        this.token = token;
        this.id = id;
        this.cpf = cpf;
        this.email = email;
        this.nivelAcesso = nivelAcesso;
    }

    public String getToken() {
        return token;
    }

    public Long getId() {
        return id;
    }

    public String getCpf() {
        return cpf;
    }

    public String getEmail() {
        return email;
    }

    public NivelAcesso getNivelAcesso() {
        return nivelAcesso;
    }
}
