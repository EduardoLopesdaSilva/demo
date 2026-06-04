package com.example.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.UsuarioDTO;
import com.example.demo.entity.Usuario;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService extends BaseService<Usuario, UsuarioDTO> {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder){
        super(repository);
        this.usuarioRepository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UsuarioDTO create(UsuarioDTO dto) {
        // Validar CPF único
        if (usuarioRepository.findByCpf(dto.getCpf()).isPresent()) {
            throw new RuntimeException("Já existe um usuário cadastrado com este CPF");
        }

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(dto.getNomeCompleto());
        usuario.setCpf(dto.getCpf());
        
        // Gerar senha automaticamente usando os 3 primeiros dígitos do CPF
        String senhaInicial = dto.getCpf().substring(0, 3);
        usuario.setSenha(passwordEncoder.encode(senhaInicial));
        
        usuario.setNivelAcesso(dto.getNivelAcesso() != null ? dto.getNivelAcesso() : NivelAcesso.OCUPADO);
        usuario.setEmail(dto.getEmail()); // Campo mantido para compatibilidade

        return toDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioDTO update(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();

        usuario.setNomeCompleto(dto.getNomeCompleto());
        
        // Se CPF for alterado, validar unicidade
        if (dto.getCpf() != null && !dto.getCpf().equals(usuario.getCpf())) {
            if (usuarioRepository.findByCpf(dto.getCpf()).isPresent()) {
                throw new RuntimeException("Já existe um usuário cadastrado com este CPF");
            }
            usuario.setCpf(dto.getCpf());
            // Ao alterar CPF, regerar senha com os 3 primeiros dígitos
            String novaSenha = dto.getCpf().substring(0, 3);
            usuario.setSenha(passwordEncoder.encode(novaSenha));
        }
        
        usuario.setEmail(dto.getEmail());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }
        if (dto.getNivelAcesso() != null) {
            usuario.setNivelAcesso(dto.getNivelAcesso());
        }

        return toDto(usuarioRepository.save(usuario));
    }

}
