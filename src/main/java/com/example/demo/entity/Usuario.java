package com.example.demo.entity;

import com.example.demo.enums.NivelAcesso;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuario")
@EqualsAndHashCode(callSuper = false)
public class Usuario extends BaseEntity {

    // Campo mantido para compatibilidade, mas não é mais usado como login
    @Column(name = "email")
    private String email;

    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(name = "cpf", nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(name = "senha", nullable = false)
    private String senha;

    @Column(name = "nivel_acesso", nullable = false)
    private NivelAcesso nivelAcesso = NivelAcesso.OCUPADO;
}
