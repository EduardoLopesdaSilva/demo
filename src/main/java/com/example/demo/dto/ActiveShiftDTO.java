package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ActiveShiftDTO {

    private Long checkinId;
    private Long postoId;
    private String postoNome;
    private LocalDateTime startedAt;
    private Integer prevencoes = 0;
    private Integer lesoes = 0;
    private Integer queimaduras = 0;
}
