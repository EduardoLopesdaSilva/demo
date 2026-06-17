package com.example.demo.controller;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.entity.CheckoutEntity;
import com.example.demo.service.CheckService;
import com.example.demo.repository.CheckoutRepository;

import jakarta.validation.Valid;
@RestController
@RequestMapping("/checkout")

public class CheckoutController {

    @Autowired
    private CheckService checkService;

    @Autowired
    private CheckoutRepository checkoutRepository;

    public CheckoutController(){
        super();
    }

    @PostMapping("/out")
    public ResponseEntity<CheckoutResponseDTO> checkout(@RequestBody @Valid CheckoutDTO dto){
        return ResponseEntity.ok(checkService.checkout(dto));
    }

    @GetMapping("/history")
    public ResponseEntity<List<CheckoutEntity>> getHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        final LocalDate dataBusca = (data != null) ? data : LocalDate.now();
        List<CheckoutEntity> checkouts = checkoutRepository.findAll().stream()
                .filter(c -> c.getCreatedAt().toLocalDate().equals(dataBusca))
                .toList();
        return ResponseEntity.ok(checkouts);
    }
}
