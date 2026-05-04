package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Public;
import com.example.demo.dto.CheckinDTO;
import com.example.demo.entity.PostoEntity;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.PostoRepository;
import com.example.demo.service.CheckService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/check")
public class CheckinController {

    @Autowired
    private CheckService checkService;

    @Autowired
    private PostoRepository postoRepository;
    

        @PostMapping("/in")
        @Public
    public void checkin(@ModelAttribute @Valid CheckinDTO dto){

    PostoEntity posto = postoRepository.findById(dto.getPostoId())
        .orElseThrow(() -> new RuntimeException("Posto não encontrado"));

    // 🚨 BLOQUEIO
    if (posto.getStatus() == NivelAcesso.OCUPADO) {
        throw new RuntimeException("Posto já está ocupado!");
    }

    // ✔ ocupa o posto
    posto.setStatus(NivelAcesso.OCUPADO);
    postoRepository.save(posto);

    checkService.checkin(dto);
    }
}
