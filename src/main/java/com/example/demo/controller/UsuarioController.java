package com.example.demo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Admin;
import com.example.demo.dto.UsuarioDTO;
import com.example.demo.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
@Admin
public class UsuarioController extends BaseController<UsuarioDTO> {

    public UsuarioController(UsuarioService service){
        super(service);
    }

    @Override
    @PostMapping
    public UsuarioDTO create(@RequestBody @Valid UsuarioDTO dto) {
        return super.create(dto);
    }

}
