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
import com.example.demo.exception.InvalidCredentialsException;
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
        if (dto == null || dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new InvalidCredentialsException();
        }

        Usuario user = buscarUsuario(dto);

        if (user == null || !passwordEncoder.matches(dto.getSenha(), user.getSenha())) {
            throw new InvalidCredentialsException();
        }

        String identificador = user.getCpf() != null ? user.getCpf() : user.getEmail();
        String token = jwtUtil.generateToken(identificador, user.getNivelAcesso().name());

        return ResponseEntity.ok(new AuthResponseDTO(
                token,
                user.getId(),
                user.getNomeCompleto(),
                user.getCpf(),
                user.getEmail(),
                user.getNivelAcesso()));
    }

    private Usuario buscarUsuario(LoginDTO dto) {
        if (dto.getCpf() != null && !dto.getCpf().isBlank()) {
            return usuarioRepository.findByCpf(dto.getCpf()).orElse(null);
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            return usuarioRepository.findByEmail(dto.getEmail()).orElse(null);
        }

        return null;
    }
}
