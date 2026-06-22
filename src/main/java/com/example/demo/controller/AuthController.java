package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Public;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/ping")
    @Public
    public void pong() {
    }
}
