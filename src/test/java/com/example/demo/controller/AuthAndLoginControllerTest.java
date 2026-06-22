package com.example.demo.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.demo.config.JwtUtil;
import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.dto.LoginDTO;
import com.example.demo.entity.Usuario;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.exception.InvalidCredentialsException;
import com.example.demo.repository.UsuarioRepository;

class AuthAndLoginControllerTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private LoginController loginController;
    private AuthController authController;

    @BeforeEach
    void setup() {
        usuarioRepository = org.mockito.Mockito.mock(UsuarioRepository.class);
        passwordEncoder = org.mockito.Mockito.mock(PasswordEncoder.class);
        jwtUtil = org.mockito.Mockito.mock(JwtUtil.class);

        loginController = new LoginController();
        ReflectionTestUtils.setField(loginController, "usuarioRepository", usuarioRepository);
        ReflectionTestUtils.setField(loginController, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(loginController, "jwtUtil", jwtUtil);

        authController = new AuthController();
    }

    @SuppressWarnings("null")
    @Test
    void loginControllerRetornaRespostaCompletaQuandoSenhaConfere() {
        LoginDTO dto = new LoginDTO();
        dto.setEmail("user@test.com");
        dto.setSenha("123456");
        Usuario usuario = usuario("user@test.com", "hash", NivelAcesso.GUARDA_VIDAS);
        usuario.setId(10L);
        usuario.setCpf("12345678901");
        usuario.setNomeCompleto("Guarda Vidas");

        when(usuarioRepository.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123456", "hash")).thenReturn(true);
        when(jwtUtil.generateToken("12345678901", "GUARDA_VIDAS")).thenReturn("token");

        ResponseEntity<AuthResponseDTO> response = loginController.login(dto);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("token", response.getBody().getToken());
        assertEquals(10L, response.getBody().getId());
        assertEquals("Guarda Vidas", response.getBody().getNomeCompleto());
        assertEquals("12345678901", response.getBody().getCpf());
        assertEquals(NivelAcesso.GUARDA_VIDAS, response.getBody().getNivelAcesso());
    }

    @Test
    void loginControllerFalhaComCredenciaisInvalidas() {
        LoginDTO dto = new LoginDTO();
        dto.setEmail("naoexiste@test.com");
        dto.setSenha("123456");

        when(usuarioRepository.findByEmail("naoexiste@test.com")).thenReturn(Optional.empty());
        assertThrows(InvalidCredentialsException.class, () -> loginController.login(dto));

        dto.setEmail("user@test.com");
        Usuario usuario = usuario("user@test.com", "hash", NivelAcesso.GUARDA_VIDAS);
        when(usuarioRepository.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123456", "hash")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> loginController.login(dto));
    }

    @Test
    void pingNaoLancaExcecao() {
        authController.pong();
    }

    private Usuario usuario(String email, String senha, NivelAcesso nivelAcesso) {
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setSenha(senha);
        usuario.setNivelAcesso(nivelAcesso);
        return usuario;
    }
}
