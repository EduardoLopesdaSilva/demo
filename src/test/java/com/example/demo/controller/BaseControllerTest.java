package com.example.demo.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.demo.dto.PostoDTO;
import com.example.demo.service.BaseService;

class BaseControllerTest {

    private BaseService<?, PostoDTO> service;
    private TestBaseController controller;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        service = mock(BaseService.class);
        controller = new TestBaseController(service);
    }

    @Test
    void createReadUpdateDeleteDelegamParaService() {
        PostoDTO dto = postoDto("Posto");
        PostoDTO atualizado = postoDto("Atualizado");

        when(service.create(dto)).thenReturn(dto);
        when(service.read(1L)).thenReturn(dto);
        when(service.read()).thenReturn(List.of(dto));
        when(service.update(1L, atualizado)).thenReturn(atualizado);

        assertEquals(dto, controller.create(dto));
        assertEquals(dto, controller.read(1L));
        assertEquals(List.of(dto), controller.read());
        assertEquals(atualizado, controller.update(1L, atualizado));

        controller.delete(1L);
        verify(service).softDelete(1L);
    }

    private PostoDTO postoDto(String nome) {
        PostoDTO dto = new PostoDTO();
        dto.setNome(nome);
        return dto;
    }

    private static class TestBaseController extends BaseController<PostoDTO> {
        TestBaseController(BaseService<?, PostoDTO> service) {
            super(service);
        }
    }
}
