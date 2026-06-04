package com.example.demo.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.service.CheckService;

class CheckControllerTest {

    private CheckService checkService;
    private CheckinController checkinController;
    private CheckoutController checkoutController;

    @BeforeEach
    void setup() {
        checkService = org.mockito.Mockito.mock(CheckService.class);

        checkinController = new CheckinController();
        ReflectionTestUtils.setField(checkinController, "checkService", checkService);

        checkoutController = new CheckoutController();
        ReflectionTestUtils.setField(checkoutController, "checkService", checkService);
    }

    @Test
    void checkinDevolveRespostaDoServico() {
        CheckinDTO dto = new CheckinDTO();
        dto.setPostoId(1L);
        CheckinResponseDTO response = new CheckinResponseDTO();
        response.setPosto("Posto 1");

        when(checkService.checkin(any(CheckinDTO.class))).thenReturn(response);

        ResponseEntity<CheckinResponseDTO> result = checkinController.checkin(dto);

        assertEquals("Posto 1", result.getBody().getPosto());
        verify(checkService).checkin(dto);
    }

    @Test
    void checkoutLiberaPostoEDevolveRespostaDoServico() {
        CheckoutDTO dto = new CheckoutDTO();
        dto.setPostoId(2L);
        CheckoutResponseDTO response = new CheckoutResponseDTO();
        response.setPosto("Posto 2");

        when(checkService.checkout(any(CheckoutDTO.class))).thenReturn(response);

        ResponseEntity<CheckoutResponseDTO> result = checkoutController.checkout(dto);

        assertEquals("Posto 2", result.getBody().getPosto());
        verify(checkService).checkout(dto);
    }
}
