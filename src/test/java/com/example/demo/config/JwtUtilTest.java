package com.example.demo.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.demo.enums.NivelAcesso;


public class JwtUtilTest {

    private JwtUtil jwt;

    @BeforeEach
    void configurar(){
 
        jwt = new JwtUtil();

        ReflectionTestUtils.setField(jwt, "secret", "chave-secreta-de-teste-com-pelo-menos-32-caracteres-aqui!!");

        jwt.init();
    }

    @Test
    @DisplayName("O Teste de verificar se o token retorna o e-mail corretamente")
    void deveExtrairEmailDoToken() {
        //ARRANGE - ORGANIZAR
        String email = "email@teste.com";
        String token = jwt.generateToken(email, NivelAcesso.LIVRE.toString());

        // ACT - AGIR
        String emailExtraido = jwt.extractUsername(token);

        //ASSERT - AFIRMAR
        assertEquals(email, emailExtraido, "O email extraído deve identico ao email usado");
    }
    @Test
    @DisplayName("O teste deve retornar se o nivel de acesso está correto")
    void deveExtrairNivelDoToken(){
        
        //ARRANGE - ORGANIZAR
        String token = jwt.generateToken("teste@teste", NivelAcesso.LIVRE.toString());

        // ACT - AGIR
         String role = jwt.extractRole(token);

        //ASSERT - AFIRMA
        assertEquals(NivelAcesso.LIVRE.toString(), role);
    }
    @Test
    @DisplayName("Validar token adulterado")
    void validarAdulterado(){
        String token = jwt.generateToken("usuario@teste.com", NivelAcesso.LIVRE.toString()
    );

    String tokenAdulterado = token + "xxxmalioso";

    boolean valido = jwt.validateToken(tokenAdulterado);

    assertFalse(valido);
    }
    @Test
    @DisplayName("Deve verificar se está enviando uma String vazia retorna false")
    void verificarVazio(){
        String token =  "";
        
        boolean valido = jwt.validateToken(token);
        assertFalse(valido);
    }
}
