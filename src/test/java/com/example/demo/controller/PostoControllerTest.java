package com.example.demo.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;


import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.example.demo.config.JwtUtil;
import com.example.demo.dto.PostoDTO;
import com.example.demo.entity.PostoEntity;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.PostoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;


@SpringBootTest
@ActiveProfiles("test")

public class PostoControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context; 

    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwt;

    private String token;

    @Autowired
    private PostoRepository pr;
    
    @BeforeEach
    public void setup() {

        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        this.objectMapper = new ObjectMapper();

        this.token = jwt.generateToken(
                "tantofaz@admin.com", NivelAcesso.ADMIN.toString());

           
        // Configuração do MockMvc ou outros objetos necessários para os testes
    }

    @Test
    @DisplayName("Deve buscar posto por ID")
    void buscarPorId() throws Exception {
        // Implementação do teste
        PostoEntity p = new PostoEntity();
        p.setNome("Posto 1");
        p.setDescricao("Descrição do posto 1");


        p = pr.save(p);

        mockMvc.perform(get("/postos/" + p .getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Posto 1"));
    }

    @Test
    @DisplayName("Deve ser criar um posto com sucesso")
    void criarPosto() throws Exception { 
        // Implementação do teste
        PostoDTO postoDTO = new PostoDTO();

        postoDTO.setNome("Posto para Buscar por ID");
        postoDTO.setDescricao("Posto buscavel por ID");

        String json = objectMapper.writeValueAsString(postoDTO);

        mockMvc.perform(
            post("/postos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nome").value("Posto 12"))
            .andExpect(jsonPath("$.id").exists());
        }
            //deve deletar

            @Test
            @DisplayName("Deve ser deletar um posto com sucesso")
            void deletarPosto() throws Exception {
                PostoEntity p = new PostoEntity();
                p.setNome("Posto para Deletar");
                p.setDescricao("Posto buscavel por ID");

                p = pr.save(p);

                mockMvc.perform(delete("/postos/" + p.getId())
                    .header("Authorization", "Bearer " + token))
                    .andExpect(status().isNoContent());
                }


        @Test
        @DisplayName("Deve ser listar os postos com sucesso")
        void listarPostos() throws Exception {
            mockMvc.perform(get("/postos")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())

                .andExpect(jsonPath("$[0].id").exists());      
    }

    //Deve dar badrequest ao criar um posto 

    @Test
    @DisplayName("Deve ser dar badrequest ao criar um posto")
    void criarPostoBadRequest() throws Exception {
        PostoDTO postoDTO = new PostoDTO();

        postoDTO.setDescricao("Descrição do posto 12");


        mockMvc.perform(
            post("/postos")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }
}