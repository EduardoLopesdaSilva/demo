package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.entity.Arquivo;
import com.example.demo.entity.CheckinEntity;
import com.example.demo.entity.CheckoutEntity;
import com.example.demo.entity.PostoEntity;
import com.example.demo.repository.CheckinRepository;
import com.example.demo.repository.PostoRepository;

@Service
public class CheckService {

    @Autowired
    private ArquivoService arquivoService;
    
    @Autowired
    private PostoRepository postoRepository;

    @Autowired
    private CheckinRepository checkinRepository;

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

        return crd;
    }
    public CheckoutResponseDTO checkout(CheckoutResponseDTO dto){

        //ID sendo transfomrado em entidade
        PostoEntity posto = postoRepository.findById(dto.getPostoId()).orElseThrow();
        
        CheckoutEntity checkout = new CheckoutEntity();

        checkout.setPosto(posto);

        Arquivo arquivo = arquivoService.upload(dto.getFoto());

        checkout.setFoto(arquivo);

        CheckoutEntity checkoutSalvo = checkoutRepository.save(checkout);

        CheckoutResponseDTO crd = new CheckoutResponseDTO();

        crd.setPosto(posto.getNome());
        crd.setHorario(checkoutSalvo.getCreatedAt());

        return crd;

    }
}