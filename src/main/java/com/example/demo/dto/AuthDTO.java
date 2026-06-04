package com.example.demo.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthDTO {

    // Aceita CPF ou email para login
    private String cpf;
    private String email;

    @NotBlank(message = "A senha deve ser preenchido.")
    private String senha;

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
}
