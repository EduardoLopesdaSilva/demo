package com.example.demo.repository;

import java.util.List;

import com.example.demo.entity.PostoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PostoRepository extends JpaRepository<PostoEntity, Long> {

    @Query("""
                SELECT p FROM PostoEntity p
                WHERE p.ativo = TRUE
            """)

    List<PostoEntity> findAllActive();
}
