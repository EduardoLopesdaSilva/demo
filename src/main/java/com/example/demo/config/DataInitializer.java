package com.example.demo.config;

import com.example.demo.entity.PostoEntity;
import com.example.demo.repository.PostoRepository;
import com.example.demo.enums.NivelAcesso;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.demo.entity.Usuario;
import com.example.demo.repository.UsuarioRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initPostos(PostoRepository repository){
        return args -> {

            if(repository.count() <= 0){

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
    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    public DataInitializer(PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate){
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Bean
    public CommandLineRunner initDatabase(UsuarioRepository repository){
        return args -> {
            if(repository.count() <= 0){
                Usuario usuario = new Usuario();

                usuario.setNomeCompleto("Sargento Administrador");
                usuario.setCpf("00000000000");
                usuario.setEmail("admin@admin.com");
                usuario.setNivelAcesso(NivelAcesso.ADMIN);
                usuario.setSenha(passwordEncoder.encode("000"));

                repository.save(usuario);

                System.out.println("✅ Usuário ADMIN criado com sucesso!");
                System.out.println("   CPF: 00000000000");
                System.out.println("   Senha: 000");
            }else{
                System.out.println("Usuário ADMIN já existe no banco!");
            }
        };
    }

    @Bean
    public CommandLineRunner alignLegacySchema() {
        return args -> {
            if (datasourceUrl == null || !datasourceUrl.startsWith("jdbc:mysql")) {
                return;
            }

            executeIgnoringErrors("ALTER TABLE checkouts DROP CHECK checkouts_chk_1");
            executeIgnoringErrors("ALTER TABLE checkouts DROP CONSTRAINT checkouts_chk_1");
            executeIgnoringErrors("ALTER TABLE checkouts MODIFY COLUMN turno ENUM('MANHA','TARDE')");
        };
    }

    private void executeIgnoringErrors(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ignored) {
            // O schema já pode estar alinhado; nesse caso não precisamos interromper a aplicação.
        }
    }

}
