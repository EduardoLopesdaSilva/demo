package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PostoDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
        private Long id;
     
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)   
        private String nome;
        
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        private String descricao;
}
