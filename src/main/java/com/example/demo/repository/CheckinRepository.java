package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.CheckinEntity;

@Repository
public interface CheckinRepository extends JpaRepository<CheckinEntity, Long>{

}
