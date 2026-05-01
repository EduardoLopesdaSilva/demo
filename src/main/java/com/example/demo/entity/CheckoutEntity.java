package com.example.demo.entity;
//CheckoutEntity.java

import jakarta.persistence.Entity;
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
    private Arquivo foto;

  
    private String prevencoes;
    
    
    private String lesoes;


}
