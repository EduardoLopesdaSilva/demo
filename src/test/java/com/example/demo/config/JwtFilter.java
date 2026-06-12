package com.example.demo.config;

import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

public class JwtFilter {

    public void doFilter(MockHttpServletRequest request, MockHttpServletResponse response,
            MockFilterChain mockFilterChain) throws Exception {
        String authHeader = request.getHeader("Authorization"); 
        if (authHeader != null && authHeader.startsWith("Bearer "));
        }
}
          
