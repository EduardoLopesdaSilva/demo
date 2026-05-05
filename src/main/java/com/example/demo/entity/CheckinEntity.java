package com.example.demo.entity;

import java.time.LocalDateTime;

import com.example.demo.enums.Turno;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "checkins")
@EqualsAndHashCode(callSuper = false)
public class CheckinEntity extends BaseEntity {

    @ManyToOne
    private PostoEntity posto;

    private Integer prevencoes;

    private String lesoes;
    
    private String queimaduras;

    @ManyToOne
    private Arquivo foto;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    private LocalDateTime fim; // 👈 fechamento do turno
}