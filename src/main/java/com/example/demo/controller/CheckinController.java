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

import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.entity.CheckinEntity;
import com.example.demo.service.CheckService;
import com.example.demo.repository.CheckinRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/check")
public class CheckinController {

    @Autowired
    private CheckService checkService;

    @Autowired
    private CheckinRepository checkinRepository;

    @PostMapping("/in")
    public ResponseEntity<CheckinResponseDTO> checkin(@RequestBody @Valid CheckinDTO dto){
        return ResponseEntity.ok(checkService.checkin(dto));
    }

    @GetMapping("/history")
    public ResponseEntity<List<CheckinEntity>> getHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        final LocalDate dataBusca = (data != null) ? data : LocalDate.now();
        List<CheckinEntity> checkins = checkinRepository.findAll().stream()
                .filter(c -> c.getCreatedAt().toLocalDate().equals(dataBusca))
                .toList();
        return ResponseEntity.ok(checkins);
    }
}
