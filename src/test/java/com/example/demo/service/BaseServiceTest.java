package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.demo.dto.PostoDTO;
import com.example.demo.entity.PostoEntity;
import com.example.demo.repository.BaseRepository;

class BaseServiceTest {

    private BaseRepository<PostoEntity, Long> repository;
    private TestPostoService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        repository = mock(BaseRepository.class);
        service = new TestPostoService(repository);
    }

    @Test
    void createConverteDtoSalvaEDevolveDto() {
        PostoDTO dto = postoDto("Posto A", "Descricao A");

        when(repository.save(any(PostoEntity.class))).thenAnswer(invocation -> {
            PostoEntity entity = invocation.getArgument(0);
            entity.setId(10L);
            return entity;
        });

        PostoDTO result = service.create(dto);

        assertEquals(10L, result.getId());
        assertEquals("Posto A", result.getNome());
        assertEquals("Descricao A", result.getDescricao());
    }

    @Test
    void updateDefineIdAntesDeSalvar() {
        PostoDTO dto = postoDto("Posto B", "Descricao B");

        when(repository.save(any(PostoEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PostoDTO result = service.update(22L, dto);

        assertEquals(22L, result.getId());
        assertEquals("Posto B", result.getNome());
    }

    @Test
    void readBuscaPorIdEConverteParaDto() {
        PostoEntity entity = postoEntity(5L, "Posto C", "Descricao C");
        when(repository.findById(5L)).thenReturn(Optional.of(entity));

        PostoDTO result = service.read(5L);

        assertEquals(5L, result.getId());
        assertEquals("Posto C", result.getNome());
    }

    @Test
    void readListaTodosConvertidosParaDto() {
        when(repository.findAll()).thenReturn(List.of(
                postoEntity(1L, "Posto 1", "Descricao 1"),
                postoEntity(2L, "Posto 2", "Descricao 2")));

        List<PostoDTO> result = service.read();

        assertEquals(2, result.size());
        assertEquals("Posto 1", result.get(0).getNome());
        assertEquals("Posto 2", result.get(1).getNome());
    }

    @Test
    void deleteEsoftDeleteDelegamParaRepositorio() {
        service.delete(7L);
        service.softDelete(8L);

        verify(repository).deleteById(7L);
        verify(repository).softDeleteById(8L);
    }

    private PostoDTO postoDto(String nome, String descricao) {
        PostoDTO dto = new PostoDTO();
        dto.setNome(nome);
        dto.setDescricao(descricao);
        return dto;
    }

    private PostoEntity postoEntity(Long id, String nome, String descricao) {
        PostoEntity entity = new PostoEntity();
        entity.setId(id);
        entity.setNome(nome);
        entity.setDescricao(descricao);
        return entity;
    }

    private static class TestPostoService extends BaseService<PostoEntity, PostoDTO> {
        TestPostoService(BaseRepository<PostoEntity, Long> repository) {
            super(repository);
        }
    }
}
