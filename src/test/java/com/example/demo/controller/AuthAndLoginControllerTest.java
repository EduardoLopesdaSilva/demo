package com.example.demo.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.demo.config.JwtUtil;
import com.example.demo.dto.AuthDTO;
import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.dto.LoginDTO;
import com.example.demo.entity.Usuario;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.UsuarioRepository;

class AuthAndLoginControllerTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private AuthController authController;
    private LoginController loginController;

    @BeforeEach
    void setup() {
        usuarioRepository = org.mockito.Mockito.mock(UsuarioRepository.class);
        passwordEncoder = org.mockito.Mockito.mock(PasswordEncoder.class);
        jwtUtil = org.mockito.Mockito.mock(JwtUtil.class);

        authController = new AuthController();
        ReflectionTestUtils.setField(authController, "usuarioRepository", usuarioRepository);
        ReflectionTestUtils.setField(authController, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(authController, "jwtUtil", jwtUtil);

        loginController = new LoginController();
        ReflectionTestUtils.setField(loginController, "usuarioRepository", usuarioRepository);
        ReflectionTestUtils.setField(loginController, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(loginController, "jwtUtil", jwtUtil);
    }

    @Test
    @SuppressWarnings("unchecked")
    void authLoginRetornaTokenQuandoCredenciaisSaoValidas() {
        Usuario usuario = usuario("admin@admin.com", "hash", NivelAcesso.ADMIN);
        when(usuarioRepository.findByEmail("admin@admin.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123", "hash")).thenReturn(true);
        when(jwtUtil.generateToken("admin@admin.com", "ADMIN")).thenReturn("jwt");

        ResponseEntity<?> response = authController.login(new AuthDTO("admin@admin.com", null, "123"));

        assertEquals(200, response.getStatusCode().value());
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("jwt", body.get("token"));
        assertEquals("ADMIN", body.get("tipo"));
    }

    @Test
    void authLoginRetorna401QuandoCredenciaisSaoInvalidas() {
        Usuario usuario = usuario("admin@admin.com", "hash", NivelAcesso.ADMIN);
        when(usuarioRepository.findByEmail("admin@admin.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("errada", "hash")).thenReturn(false);

        ResponseEntity<?> response = authController.login(new AuthDTO("admin@admin.com", "errada", null));

        assertEquals(401, response.getStatusCode().value());
        assertEquals("Credenciais Inválidas!", response.getBody());
    }

    @Test
    void loginControllerRetornaTokenQuandoSenhaConfere() {
        LoginDTO dto = new LoginDTO();
        dto.setEmail("user@test.com");
        dto.setSenha("123");
        Usuario usuario = usuario("user@test.com", "hash", NivelAcesso.LIVRE);
        usuario.setId(10L);

        when(usuarioRepository.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123", "hash")).thenReturn(true);
        when(jwtUtil.generateToken("user@test.com", "LIVRE")).thenReturn("token");

        ResponseEntity<AuthResponseDTO> response = loginController.login(dto);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("token", response.getBody().getToken());
        assertEquals(10L, response.getBody().getId());
        assertEquals("user@test.com", response.getBody().getEmail());
        assertEquals(NivelAcesso.LIVRE, response.getBody().getNivelAcesso());
    }

    @Test
    void loginControllerFalhaQuandoUsuarioNaoExisteOuSenhaNaoConfere() {
        LoginDTO dto = new LoginDTO();
        dto.setEmail("naoexiste@test.com");
        dto.setSenha("123");

        when(usuarioRepository.findByEmail("naoexiste@test.com")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> loginController.login(dto));

        dto.setEmail("user@test.com");
        Usuario usuario = usuario("user@test.com", "hash", NivelAcesso.LIVRE);
        when(usuarioRepository.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("123", "hash")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> loginController.login(dto));
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
