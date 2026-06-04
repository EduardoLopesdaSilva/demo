package com.example.demo.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.service.CheckService;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/checkout")

public class CheckoutController {

    @Autowired
    private CheckService checkService;

    public CheckoutController(){
        super();
    }

    @PostMapping("/out")
    public ResponseEntity<CheckoutResponseDTO> checkout(@RequestBody @Valid CheckoutDTO dto){
        return ResponseEntity.ok(checkService.checkout(dto));
    }
}
