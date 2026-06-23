package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CheckoutDTO {

    @NotNull(message = "O id do posto é obrigatório.")
    private Long postoId;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String foto;

    @NotBlank(message = "Informe a quantidade de prevenções.")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String prevencoes;

    @NotBlank(message = "Informe a quantidade de lesões.")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String lesoes;

    @NotBlank(message = "Informe a quantidade de queimaduras.")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String queimaduras;



}
