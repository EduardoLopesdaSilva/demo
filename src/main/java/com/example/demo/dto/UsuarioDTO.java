package com.example.demo.dto;

import com.example.demo.enums.NivelAcesso;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private boolean ativo;

    // Campo mantido para compatibilidade, mas não é mais usado como login
    private String email;

    @NotBlank(message = "O nome completo deve ser preenchido.")
    private String nomeCompleto;

    @NotBlank(message = "O CPF deve ser preenchido.")
    @Pattern(regexp = "\\d{11}", message = "O CPF deve conter exatamente 11 números.")
    private String cpf;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    private NivelAcesso nivelAcesso;
}
