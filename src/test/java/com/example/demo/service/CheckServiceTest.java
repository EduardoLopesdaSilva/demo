package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.entity.Arquivo;
import com.example.demo.entity.CheckinEntity;
import com.example.demo.entity.CheckoutEntity;
import com.example.demo.entity.PostoEntity;
import com.example.demo.enums.Turno;
import com.example.demo.enums.NivelAcesso;
import com.example.demo.repository.CheckinRepository;
import com.example.demo.repository.CheckoutRepository;
import com.example.demo.repository.PostoRepository;

@ExtendWith(MockitoExtension.class)
class CheckServiceTest {

    @Mock
    private ArquivoService arquivoService;

    @Mock
    private PostoRepository postoRepository;

    @Mock
    private CheckinRepository checkinRepository;

    @Mock
    private CheckoutRepository checkoutRepository;

    @InjectMocks
    private CheckService service;

    @Test
    void checkinSalvaRegistroQuandoNaoExisteTurnoAberto() {
        PostoEntity posto = posto("Guarita 1");
        CheckinDTO dto = checkinDto(1L);
        Arquivo arquivo = new Arquivo();

        when(postoRepository.findById(1L)).thenReturn(Optional.of(posto));
        when(checkinRepository.existsByPostoAndTurnoAndFimIsNull(any(), any())).thenReturn(false);
        when(arquivoService.registrarReferencia(dto.getFoto())).thenReturn(arquivo);
        when(checkinRepository.save(any(CheckinEntity.class))).thenAnswer(invocation -> {
            CheckinEntity entity = invocation.getArgument(0);
            entity.setCreatedAt(LocalDateTime.of(2026, 1, 1, 8, 0));
            return entity;
        });

        CheckinResponseDTO response = service.checkin(dto);

        assertEquals("Guarita 1", response.getPosto());
        assertEquals(LocalDateTime.of(2026, 1, 1, 8, 0), response.getHorario());
        verify(checkinRepository).save(any(CheckinEntity.class));
    }

    @Test
    void checkinBloqueiaQuandoJaExisteTurnoAberto() {
        PostoEntity posto = posto("Guarita 2");
        CheckinDTO dto = checkinDto(2L);

        when(postoRepository.findById(2L)).thenReturn(Optional.of(posto));
        when(checkinRepository.existsByPostoAndTurnoAndFimIsNull(any(), any())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.checkin(dto));

        assertEquals("Já existe um check-in aberto para esse posto nesse turno", exception.getMessage());
    }

    @Test
    void checkoutSalvaInformacoesEDevolveResposta() {
        PostoEntity posto = posto("Guarita 3");
        CheckoutDTO dto = new CheckoutDTO();
        dto.setPostoId(3L);
        dto.setFoto("saida.jpg");
        dto.setPrevencoes("ok");
        dto.setLesoes("nenhuma");
        dto.setQueimaduras("nenhuma");
        CheckinEntity checkinAberto = new CheckinEntity();

        when(postoRepository.findById(3L)).thenReturn(Optional.of(posto));
        when(checkinRepository.findByPostoAndTurnoAndFimIsNull(any(), any())).thenReturn(Optional.of(checkinAberto));
        when(arquivoService.registrarReferencia(dto.getFoto())).thenReturn(new Arquivo());
        when(checkoutRepository.save(any(CheckoutEntity.class))).thenAnswer(invocation -> {
            CheckoutEntity entity = invocation.getArgument(0);
            entity.setCreatedAt(LocalDateTime.of(2026, 1, 1, 17, 30));
            return entity;
        });

        CheckoutResponseDTO response = service.checkout(dto);

        assertEquals("Guarita 3", response.getPosto());
        assertEquals("ok", response.getPrevencoes());
        assertEquals("nenhuma", response.getLesoes());
        assertEquals("nenhuma", response.getQueimaduras());
        assertNotNull(response.getHorario());
        verify(checkoutRepository).save(any(CheckoutEntity.class));
    }

    private CheckinDTO checkinDto(Long postoId) {
        CheckinDTO dto = new CheckinDTO();
        dto.setPostoId(postoId);
        dto.setFoto("entrada.jpg");
        return dto;
    }

    private PostoEntity posto(String nome) {
        PostoEntity posto = new PostoEntity();
        posto.setNome(nome);
        posto.setStatus(NivelAcesso.LIVRE);
        return posto;
    }
}
