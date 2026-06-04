package com.example.demo.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.annotations.Public;
import com.example.demo.config.JwtUtil;
import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.dto.LoginDTO;
import com.example.demo.entity.Usuario;
import com.example.demo.repository.UsuarioRepository;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    @Public
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginDTO dto) {

        Usuario user = null;

        // Tenta buscar por CPF primeiro (para guarda-vidas)
        if (dto.getCpf() != null && !dto.getCpf().isBlank()) {
            var userOpt = usuarioRepository.findByCpf(dto.getCpf());
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        }

        // Se não encontrar por CPF, tenta por email (para sargento/admin)
        if (user == null && dto.getEmail() != null && !dto.getEmail().isBlank()) {
            var userOpt = usuarioRepository.findByEmail(dto.getEmail());
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        }

        if (user == null) {
            throw new RuntimeException("Usuário não encontrado");
        }

        if (!passwordEncoder.matches(dto.getSenha(), user.getSenha())) {
            throw new RuntimeException("Senha inválida");
        }

        String identificador = user.getCpf() != null ? user.getCpf() : user.getEmail();
        String token = jwtUtil.generateToken(identificador, user.getNivelAcesso().name());

        return ResponseEntity.ok(new AuthResponseDTO(
                token,
                user.getId(),
                user.getCpf(),
                user.getEmail(),
                user.getNivelAcesso()));
    }
}
