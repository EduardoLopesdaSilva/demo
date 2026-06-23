package com.example.demo.entity;

import com.example.demo.enums.Turno;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "checkouts")
@EqualsAndHashCode(callSuper = false)
public class CheckoutEntity extends BaseEntity {

    @ManyToOne
    private PostoEntity posto;

    @ManyToOne
    private CheckinEntity checkin; // 🔥 CONEXÃO IMPORTANTE

    @ManyToOne
    private Arquivo foto;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    @Column(nullable = false)
    private String prevencoes;

    @Column(nullable = false)
    private String lesoes;

    @Column(nullable = false)
    private String queimaduras;
}
