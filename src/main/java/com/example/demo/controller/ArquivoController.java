package com.example.demo.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Public;
import com.example.demo.entity.Arquivo;
import com.example.demo.repository.ArquivoRepository;

@RestController
@RequestMapping("/arquivos")
public class ArquivoController {

    @Autowired
    private ArquivoRepository arquivoRepository;

    @GetMapping("/ver/{id}")
    @Public
    public ResponseEntity<byte[]> verArquivo(@PathVariable UUID id) {
        Arquivo arquivo = arquivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Arquivo nao encontrado"));

        try {
            Path path = Paths.get(arquivo.getCaminho());
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }
            byte[] bytes = Files.readAllBytes(path);
            MediaType mediaType = MediaType.parseMediaType(arquivo.getTipo());
            
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + arquivo.getNome() + "\"")
                    .body(bytes);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
