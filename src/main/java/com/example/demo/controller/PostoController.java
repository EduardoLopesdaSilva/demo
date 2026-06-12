package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Admin;
import com.example.demo.annotations.Public;
import com.example.demo.entity.PostoEntity;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.PostoRepository;

@RestController
@RequestMapping("/postos")
public class PostoController {

    @Autowired
    private PostoRepository repository;

    @GetMapping
    @Public
    public List<PostoEntity> listar() {
        return repository.findAllActive();
    }

    @GetMapping("/{id}")
    @Public
    public ResponseEntity<PostoEntity> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Admin
    public PostoEntity criar(@RequestBody PostoEntity posto) {
        posto.setStatus(NivelAcesso.LIVRE);
        return repository.save(posto);
    }

    @DeleteMapping("/{id}")
    @Admin
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
