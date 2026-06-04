package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import com.example.demo.enums.Turno;
import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.entity.Arquivo;
import com.example.demo.entity.CheckinEntity;
import com.example.demo.entity.CheckoutEntity;
import com.example.demo.entity.PostoEntity;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.CheckinRepository;
import com.example.demo.repository.CheckoutRepository;
import com.example.demo.repository.PostoRepository;

import jakarta.transaction.Transactional;

@Service
public class CheckService {

    private Turno definirTurno() {
    LocalTime agora = LocalTime.now();
    return agora.isBefore(LocalTime.of(12, 0)) ? Turno.MANHA : Turno.TARDE;
}
    @Autowired
    private ArquivoService arquivoService;
    
    @Autowired
    private PostoRepository postoRepository;

    @Autowired
    private CheckinRepository checkinRepository;

    @Autowired
    private CheckoutRepository checkoutRepository;


   @Transactional
   public CheckinResponseDTO checkin(CheckinDTO dto){

    PostoEntity posto = postoRepository.findById(dto.getPostoId())
        .orElseThrow(() -> new RuntimeException("Posto não encontrado"));

    if (posto.getStatus() == NivelAcesso.OCUPADO) {
        throw new RuntimeException("Posto já está ocupado");
    }

    Turno turno = definirTurno();

    // 🚨 VERIFICA SE JÁ TEM TURNO ABERTO
    boolean existeAberto = checkinRepository
        .existsByPostoAndTurnoAndFimIsNull(posto, turno);

    if (existeAberto) {
        throw new RuntimeException("Já existe um check-in aberto para esse posto nesse turno");
    }

    CheckinEntity checkin = new CheckinEntity();
    checkin.setPosto(posto);
    checkin.setTurno(turno);

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
 public CheckoutResponseDTO checkout(CheckoutDTO dto){

    PostoEntity posto = postoRepository.findById(dto.getPostoId())
        .orElseThrow(() -> new RuntimeException("Posto não encontrado"));

    Turno turno = definirTurno();

    CheckinEntity checkinAberto = checkinRepository
        .findByPostoAndTurnoAndFimIsNull(posto, turno)
        .orElseThrow(() -> new RuntimeException("Não existe check-in aberto para este posto neste turno"));

    CheckoutEntity checkout = new CheckoutEntity();

    checkout.setPosto(posto);
    checkout.setCheckin(checkinAberto);
    checkout.setTurno(turno);

    Arquivo arquivo = arquivoService.registrarReferencia(dto.getFoto());
    checkout.setFoto(arquivo);

    checkout.setPrevencoes(dto.getPrevencoes());
    checkout.setLesoes(dto.getLesoes());
    checkout.setQueimaduras(dto.getQueimaduras());

    CheckoutEntity checkoutSalvo = checkoutRepository.save(checkout);

    checkinAberto.setFim(LocalDateTime.now());
    checkinRepository.save(checkinAberto);

    posto.setStatus(NivelAcesso.LIVRE);
    postoRepository.save(posto);

    CheckoutResponseDTO crd = new CheckoutResponseDTO();
    crd.setPosto(posto.getNome());
    crd.setHorario(checkoutSalvo.getCreatedAt());
    crd.setPrevencoes(checkoutSalvo.getPrevencoes());
    crd.setLesoes(checkoutSalvo.getLesoes());
    crd.setQueimaduras(checkoutSalvo.getQueimaduras());

    return crd;


    }
}
