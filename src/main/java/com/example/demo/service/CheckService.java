package com.example.demo.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ActiveShiftDTO;
import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.entity.Arquivo;
import com.example.demo.entity.CheckinEntity;
import com.example.demo.entity.CheckoutEntity;
import com.example.demo.entity.PostoEntity;
import com.example.demo.entity.Usuario;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.enums.Turno;
import com.example.demo.repository.CheckinRepository;
import com.example.demo.repository.CheckoutRepository;
import com.example.demo.repository.PostoRepository;
import com.example.demo.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class CheckService {

    @Autowired
    private ArquivoService arquivoService;

    @Autowired
    private PostoRepository postoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CheckinRepository checkinRepository;

    @Autowired
    private CheckoutRepository checkoutRepository;

    @Transactional
    public CheckinResponseDTO checkin(CheckinDTO dto) {
        PostoEntity posto = postoRepository.findById(dto.getPostoId())
                .orElseThrow(() -> new RuntimeException("Posto nao encontrado"));

        if (posto.getStatus() == NivelAcesso.OCUPADO) {
            throw new RuntimeException("Posto ja esta ocupado");
        }

        if (checkinRepository.existsByPostoAndFimIsNull(posto)) {
            throw new RuntimeException("Ja existe um turno em aberto para este posto");
        }

        CheckinEntity checkin = new CheckinEntity();
        checkin.setPosto(posto);
        checkin.setUsuario(buscarUsuario(dto.getIdUsuario()).orElse(null));
        checkin.setTurno(definirTurno());

        Arquivo arquivo = arquivoService.registrarReferencia(dto.getFoto());
        checkin.setFoto(arquivo);

        posto.setStatus(NivelAcesso.OCUPADO);
        postoRepository.save(posto);

        CheckinEntity salvo = checkinRepository.save(checkin);

        CheckinResponseDTO response = new CheckinResponseDTO();
        response.setPosto(posto.getNome());
        response.setHorario(salvo.getCreatedAt());

        return response;
    }

    @Transactional
    public CheckoutResponseDTO checkout(CheckoutDTO dto) {
        PostoEntity posto = postoRepository.findById(dto.getPostoId())
                .orElseThrow(() -> new RuntimeException("Posto nao encontrado"));

        CheckinEntity checkinAberto = checkinRepository
                .findFirstByPostoAndFimIsNullOrderByCreatedAtDesc(posto)
                .orElseThrow(() -> new RuntimeException("Nao existe check-in aberto para este posto"));

        Turno turno = checkinAberto.getTurno() != null ? checkinAberto.getTurno() : definirTurno();

        if (dto.getPrevencoes() == null || dto.getPrevencoes().trim().isEmpty()) {
            throw new RuntimeException("Informe a quantidade de prevenções.");
        }
        if (dto.getLesoes() == null || dto.getLesoes().trim().isEmpty()) {
            throw new RuntimeException("Informe a quantidade de lesões.");
        }
        if (dto.getQueimaduras() == null || dto.getQueimaduras().trim().isEmpty()) {
            throw new RuntimeException("Informe a quantidade de queimaduras.");
        }

        CheckoutEntity checkout = new CheckoutEntity();
        checkout.setPosto(posto);
        checkout.setCheckin(checkinAberto);
        checkout.setTurno(turno);

        Arquivo arquivo = arquivoService.registrarReferencia(dto.getFoto());
        checkout.setFoto(arquivo);

        checkout.setPrevencoes(dto.getPrevencoes().trim());
        checkout.setLesoes(dto.getLesoes().trim());
        checkout.setQueimaduras(dto.getQueimaduras().trim());

        CheckoutEntity checkoutSalvo = checkoutRepository.save(checkout);

        checkinAberto.setFim(LocalDateTime.now());
        checkinRepository.save(checkinAberto);

        posto.setStatus(NivelAcesso.LIVRE);
        postoRepository.save(posto);

        CheckoutResponseDTO response = new CheckoutResponseDTO();
        response.setPosto(posto.getNome());
        response.setHorario(checkoutSalvo.getCreatedAt());
        response.setPrevencoes(checkoutSalvo.getPrevencoes());
        response.setLesoes(checkoutSalvo.getLesoes());
        response.setQueimaduras(checkoutSalvo.getQueimaduras());

        return response;
    }

    public Optional<ActiveShiftDTO> turnoAtivo(Long usuarioId) {
        return buscarUsuario(usuarioId)
                .flatMap(checkinRepository::findFirstByUsuarioAndFimIsNullOrderByCreatedAtDesc)
                .map(this::toActiveShiftDto);
    }

    private Optional<Usuario> buscarUsuario(Long usuarioId) {
        if (usuarioId == null) {
            return Optional.empty();
        }
        return usuarioRepository.findById(usuarioId);
    }

    private ActiveShiftDTO toActiveShiftDto(CheckinEntity checkin) {
        ActiveShiftDTO dto = new ActiveShiftDTO();
        dto.setCheckinId(checkin.getId());
        dto.setStartedAt(checkin.getCreatedAt());

        if (checkin.getPosto() != null) {
            dto.setPostoId(checkin.getPosto().getId());
            dto.setPostoNome(checkin.getPosto().getNome());
        }

        return dto;
    }

    private Turno definirTurno() {
        LocalTime agora = LocalTime.now();
        return agora.isBefore(LocalTime.of(12, 0)) ? Turno.MANHA : Turno.TARDE;
    }
}
