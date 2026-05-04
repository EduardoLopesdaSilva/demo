package com.example.demo.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.repository.PostoRepository;

import com.example.demo.annotations.Public;
import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.entity.PostoEntity;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.service.CheckService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/checkout")

public class CheckoutController {

    @Autowired
    private CheckService checkService;
    
    @Autowired
    private PostoRepository postoRepository;

    public CheckoutController(){
        super();
    }
    @PostMapping("/out")
    @Public
    public CheckoutResponseDTO checkout(@ModelAttribute @Valid CheckoutDTO dto){
        
            PostoEntity posto = postoRepository.findById(dto.getPostoId()).get();

            posto.setStatus(NivelAcesso.LIVRE);

            postoRepository.save(posto);
        
        return checkService.checkout(dto);
        

    }
}
