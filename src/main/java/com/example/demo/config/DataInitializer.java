package com.example.demo.config;

import com.example.demo.entity.PostoEntity;
import com.example.demo.repository.PostoRepository;
import com.example.demo.enums.NivelAcesso;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.demo.entity.Usuario;
import com.example.demo.repository.UsuarioRepository;

@Configuration
public class DataInitializer {

    @Bean
public CommandLineRunner initPostos(PostoRepository repository){
    return args -> {

        if(repository.count() == 0){

            for(int i = 1; i <= 21; i++){
                PostoEntity posto = new PostoEntity();

                posto.setNome("Posto " + i);
                posto.setDescricao("Posto da praia " + i);
                posto.setStatus(NivelAcesso.LIVRE);

                repository.save(posto);
            }

            System.out.println("✅ 21 postos criados com sucesso!");
        } else {
            System.out.println("Postos já existem no banco!");
        }
    };
}
    
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(PasswordEncoder passwordEncoder){
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initDatabase(UsuarioRepository repository){
        return args -> {
            if(repository.count() <= 0){
                Usuario usuario = new Usuario();

                usuario.setEmail("admin@admin.com");
                usuario.setNivelAcesso(NivelAcesso.LIVRE);
                usuario.setSenha(passwordEncoder.encode("123456789"));

                repository.save(usuario);

                System.out.println("Usuário ADMIN criado com sucesso: admin@admin.com / 123456789");
            }else{
                System.out.println("Usuário ADMIN já existe no banco!");
            }
        };
    }
    

}
