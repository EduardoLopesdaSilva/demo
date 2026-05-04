package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PostoDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
        private Long id;
    
        private String nome;
    
        private String descricao;
}
