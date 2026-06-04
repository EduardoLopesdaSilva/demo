package com.example.demo.controller;
import java.util.Optional;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.annotations.Public;
import com.example.demo.config.JwtUtil;
import com.example.demo.dto.AuthDTO;
import com.example.demo.entity.Usuario;
import com.example.demo.repository.UsuarioRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/auth/login")
    @Public
    public ResponseEntity<?> login(@RequestBody @Valid AuthDTO dto) {
        String cpf = dto.getCpf();
        String email = dto.getEmail();
        String senha = dto.getSenha(); // TEXTO PURO

        Optional<Usuario> usuarioOpt = Optional.empty();

        // Tenta buscar por CPF primeiro (para guarda-vidas)
        if (cpf != null && !cpf.isBlank()) {
            if (cpf.contains("@")) {
                usuarioOpt = usuarioRepository.findByEmail(cpf);
            } else {
                usuarioOpt = usuarioRepository.findByCpf(cpf);
            }
        }

        // Se não encontrar por CPF, tenta por email (para sargento/admin)
        if (usuarioOpt.isEmpty() && email != null && !email.isBlank()) {
            usuarioOpt = usuarioRepository.findByEmail(email);
        }

        if (usuarioOpt.isPresent() && passwordEncoder.matches(senha, usuarioOpt.get().getSenha())) {
            Usuario usuario = usuarioOpt.get();
            String nivelAcesso = usuario.getNivelAcesso().toString();
            String identificador = usuario.getEmail() != null && !usuario.getEmail().isBlank()
                    ? usuario.getEmail()
                    : usuario.getCpf();

            String token = jwtUtil.generateToken(identificador, nivelAcesso);

            return ResponseEntity.ok(Map.of(
                "token", token, "tipo", nivelAcesso
            ));
        }

        return ResponseEntity.status(401).body("Credenciais Inválidas!");
    }

    @GetMapping("/ping")    
    public void pong(){

    }

}
