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

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        super(repository);
        this.usuarioRepository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UsuarioDTO create(UsuarioDTO dto) {
        String cpf = normalizarCpf(dto.getCpf());

        if (usuarioRepository.findByCpf(cpf).isPresent()) {
            throw new RuntimeException("Ja existe um usuario cadastrado com este CPF");
        }

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(dto.getNomeCompleto());
        usuario.setCpf(cpf);
        usuario.setSenha(passwordEncoder.encode(senhaInicialPorCpf(cpf)));
        usuario.setNivelAcesso(normalizarNivelAcesso(dto.getNivelAcesso()));
        usuario.setEmail(dto.getEmail());

        return toDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioDTO update(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();

        usuario.setNomeCompleto(dto.getNomeCompleto());

        if (dto.getCpf() != null && !normalizarCpf(dto.getCpf()).equals(usuario.getCpf())) {
            String cpf = normalizarCpf(dto.getCpf());
            if (usuarioRepository.findByCpf(cpf).isPresent()) {
                throw new RuntimeException("Ja existe um usuario cadastrado com este CPF");
            }
            usuario.setCpf(cpf);
            usuario.setSenha(passwordEncoder.encode(senhaInicialPorCpf(cpf)));
        }

        usuario.setEmail(dto.getEmail());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }
        if (dto.getNivelAcesso() != null) {
            usuario.setNivelAcesso(normalizarNivelAcesso(dto.getNivelAcesso()));
        }

        return toDto(usuarioRepository.save(usuario));
    }

    private NivelAcesso normalizarNivelAcesso(NivelAcesso nivelAcesso) {
        if (nivelAcesso == null || nivelAcesso == NivelAcesso.LIVRE || nivelAcesso == NivelAcesso.OCUPADO) {
            return NivelAcesso.GUARDA_VIDAS;
        }
        return nivelAcesso;
    }

    private String normalizarCpf(String cpf) {
        String cpfNormalizado = cpf == null ? "" : cpf.replaceAll("\\D", "");
        if (cpfNormalizado.length() != 11) {
            throw new RuntimeException("O CPF deve conter exatamente 11 numeros");
        }
        return cpfNormalizado;
    }

    private String senhaInicialPorCpf(String cpf) {
        return normalizarCpf(cpf).substring(0, 6);
    }
}
