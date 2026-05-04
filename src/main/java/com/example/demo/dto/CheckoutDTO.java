package com.example.demo.dto;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CheckoutDTO {

    @NotNull(message = "O id do posto é obrigatório.")
    private Long postoId;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private MultipartFile foto;
    // Outros campos relevantes para o checkout, como prevenções e lesões

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String prevencoes;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String lesoes;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String queimaduras;



}