package com.example.demo.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void autenticaUsuarioQuandoBearerTokenEhValido() throws Exception {
        JwtFilter filter = new JwtFilter(jwtUtil);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        request.addHeader("Authorization", "Bearer token-valido");

        when(jwtUtil.validateToken("token-valido")).thenReturn(true);
        when(jwtUtil.extractUsername("token-valido")).thenReturn("admin@admin.com");
        when(jwtUtil.extractRole("token-valido")).thenReturn("ADMIN");

        filter.doFilter(request, response, chain);

        assertEquals("admin@admin.com", SecurityContextHolder.getContext().getAuthentication().getName());
        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void continuaSemAutenticarQuandoHeaderNaoEhBearer() throws Exception {
        JwtFilter filter = new JwtFilter(jwtUtil);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtUtil, never()).validateToken("token-valido");
    }

    @Test
    void continuaSemAutenticarQuandoTokenEhInvalido() throws Exception {
        JwtFilter filter = new JwtFilter(jwtUtil);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addHeader("Authorization", "Bearer token-invalido");

        when(jwtUtil.validateToken("token-invalido")).thenReturn(false);

        filter.doFilter(request, response, new MockFilterChain());

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtUtil, never()).extractUsername("token-invalido");
    }
}
