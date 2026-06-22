package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.CheckinEntity;
import com.example.demo.entity.PostoEntity;
import com.example.demo.entity.Usuario;
import com.example.demo.enums.Turno;

@Repository
public interface CheckinRepository extends JpaRepository<CheckinEntity, Long>{

    boolean existsByPostoAndTurnoAndFimIsNull(PostoEntity posto, Turno turno);

    boolean existsByPostoAndFimIsNull(PostoEntity posto);

    Optional<CheckinEntity> findByPostoAndTurnoAndFimIsNull(PostoEntity posto, Turno turno);

    Optional<CheckinEntity> findFirstByPostoAndFimIsNullOrderByCreatedAtDesc(PostoEntity posto);

    Optional<CheckinEntity> findFirstByUsuarioAndFimIsNullOrderByCreatedAtDesc(Usuario usuario);

}
