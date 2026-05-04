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

    @Autowired
    private ArquivoService arquivoService;
    
    @Autowired
    private PostoRepository postoRepository;

    @Autowired
    private CheckinRepository checkinRepository;

    @Autowired
    private CheckoutRepository checkoutRepository;

    public CheckinResponseDTO checkin(CheckinDTO dto){

          //ID sendo transfomrado em entidade
        PostoEntity posto = postoRepository.findById(dto.getPostoId()).orElseThrow();

        CheckinEntity checkin = new CheckinEntity();

        checkin.setPosto(posto);

        Arquivo arquivo = arquivoService.upload(dto.getFoto());

        checkin.setFoto(arquivo);

        CheckinEntity checkinSalvo = checkinRepository.save(checkin);


        CheckinResponseDTO crd = new CheckinResponseDTO();

        crd.setPosto(posto.getNome());
        crd.setHorario(checkinSalvo.getCreatedAt());

        LocalTime agora = LocalTime.now();


        Turno turno;

        if (agora.isBefore(LocalTime.of(12, 0))) {
            turno = Turno.MANHA;
        } else {
            turno = Turno.TARDE;
        }

        checkin.setTurno(turno);

        return crd;
    }
    public CheckoutResponseDTO checkout(CheckoutDTO dto){

        //ID sendo transfomrado em entidade
        PostoEntity posto = postoRepository.findById(dto.getPostoId()).orElseThrow();
        
        CheckoutEntity checkout = new CheckoutEntity();

        checkout.setPosto(posto);

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

        LocalTime agora = LocalTime.now();

        Turno turno;

        if (agora.isBefore(LocalTime.of(12, 0))) {
            turno = Turno.MANHA;
        } else {
            turno = Turno.TARDE;
        }

        checkout.setTurno(turno);

        return crd;

    }
}