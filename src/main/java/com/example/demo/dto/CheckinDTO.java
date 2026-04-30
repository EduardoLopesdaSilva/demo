package com.example.demo.dto;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CheckinDTO {


    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long idUsuario;

    @NotNull(message = "O id do posto é obrigatório.")
    private Long PostoId;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private MultipartFile foto;



}
