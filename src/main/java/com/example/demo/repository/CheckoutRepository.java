package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.CheckoutEntity;

@Repository
public interface CheckoutRepository extends JpaRepository<CheckoutEntity, Long> {

}
