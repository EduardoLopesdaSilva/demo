package com.example.demo.entity;

import com.example.demo.enums.NivelAcesso;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "posto")
@EqualsAndHashCode(callSuper = false)
public class PostoEntity extends BaseEntity{
    
    @Column
    private String nome;
    

    @Column
    private String descricao;   


    @Enumerated(EnumType.STRING)
    @Column
    private NivelAcesso status;
}
