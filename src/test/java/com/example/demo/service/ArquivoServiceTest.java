package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.entity.Arquivo;
import com.example.demo.repository.ArquivoRepository;

@ExtendWith(MockitoExtension.class)
class ArquivoServiceTest {

    @Mock
    private ArquivoRepository arquivoRepository;

    @InjectMocks
    private ArquivoService service;

    @TempDir
    private Path tempDir;

    @Test
    void uploadCriaArquivoFisicoEPersisteMetadados() throws Exception {
        ReflectionTestUtils.setField(service, "path", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "foto", "foto.jpg", "image/jpeg", "conteudo".getBytes());

        when(arquivoRepository.save(any(Arquivo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Arquivo result = service.upload(file);

        assertEquals("foto.jpg", result.getNome());
        assertEquals("image/jpeg", result.getTipo());
        assertEquals(file.getSize(), result.getTamanho());
        assertTrue(Files.exists(Path.of(result.getCaminho())));

        ArgumentCaptor<Arquivo> captor = ArgumentCaptor.forClass(Arquivo.class);
        verify(arquivoRepository).save(captor.capture());
        assertEquals(result.getCaminho(), captor.getValue().getCaminho());
    }

    @Test
    void uploadConverteIOExceptionEmRuntimeException() throws Exception {
        ReflectionTestUtils.setField(service, "path", tempDir.toString());
        MultipartFile file = mock(MultipartFile.class);

        when(file.getInputStream()).thenThrow(new IOException("falha"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.upload(file));

        assertEquals("Erro ao salvar o arquivo", exception.getMessage());
        verify(arquivoRepository, never()).save(any());
    }
}
