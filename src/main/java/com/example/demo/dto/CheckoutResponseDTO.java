package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class CheckoutResponseDTO {
    private String posto;

    private LocalDateTime horario;

    private String prevencoes;

    private String lesoes;

    private String queimaduras;
}
