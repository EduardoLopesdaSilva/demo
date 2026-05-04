package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Public;
import com.example.demo.entity.PostoEntity;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.PostoRepository;

@RestController
@Public
@RequestMapping("/postos")
public class PostoController {

    @Autowired
    private PostoRepository repository;

    @GetMapping
    public List<PostoEntity> listar() {

        return repository.findAllActive(); // ou findAll()
    }

    @PostMapping
    public PostoEntity criar(@RequestBody PostoEntity posto) {

    posto.setStatus(NivelAcesso.LIVRE); // 🔥 AQUI

    return repository.save(posto);
    }
}