package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.service.CheckService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/check")
public class CheckinController {

    @Autowired
    private CheckService checkService;
    
    @PostMapping("/in")
    public ResponseEntity<CheckinResponseDTO> checkin(@RequestBody @Valid CheckinDTO dto){
        return ResponseEntity.ok(checkService.checkin(dto));
    }
}
