package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
import com.example.demo.repository.CheckinRepository;
import com.example.demo.repository.CheckoutRepository;
import com.example.demo.repository.PostoRepository;

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


   public CheckinResponseDTO checkin(CheckinDTO dto){

    PostoEntity posto = postoRepository.findById(dto.getPostoId()).orElseThrow();

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

    Arquivo arquivo = arquivoService.upload(dto.getFoto());
    checkin.setFoto(arquivo);

    CheckinEntity salvo = checkinRepository.save(checkin);

    CheckinResponseDTO response = new CheckinResponseDTO();
    response.setPosto(posto.getNome());
    response.setHorario(salvo.getCreatedAt());

    return response;
}
 public CheckoutResponseDTO checkout(CheckoutDTO dto){

    PostoEntity posto = postoRepository.findById(dto.getPostoId()).orElseThrow();

    LocalTime agora = LocalTime.now();

    Turno turno;
    if (agora.isBefore(LocalTime.of(12, 0))) {
        turno = Turno.MANHA;
    } else {
        turno = Turno.TARDE;
    }

    CheckoutEntity checkout = new CheckoutEntity();

    checkout.setPosto(posto);
    checkout.setTurno(turno); // ✅ ANTES DE SALVAR
    checkout.setTurno(definirTurno());

    Arquivo arquivo = arquivoService.upload(dto.getFoto());
    checkout.setFoto(arquivo);

    checkout.setPrevencoes(dto.getPrevencoes());
    checkout.setLesoes(dto.getLesoes());
    checkout.setQueimaduras(dto.getQueimaduras());

    CheckoutEntity checkoutSalvo = checkoutRepository.save(checkout);

    CheckoutResponseDTO crd = new CheckoutResponseDTO();
    crd.setPosto(posto.getNome());
    crd.setHorario(checkoutSalvo.getCreatedAt());
    crd.setPrevencoes(checkoutSalvo.getPrevencoes());
    crd.setLesoes(checkoutSalvo.getLesoes());
    crd.setQueimaduras(checkoutSalvo.getQueimaduras());

    return crd;


    }
}