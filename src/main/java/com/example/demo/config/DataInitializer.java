package com.example.demo.config;

import com.example.demo.entity.PostoEntity;
import com.example.demo.repository.PostoRepository;
import com.example.demo.enums.NivelAcesso;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
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
    @Order(2)
    public CommandLineRunner initDatabase(UsuarioRepository repository){
        return args -> {
            var adminExistente = repository.findByCpf("00000000000")
                    .or(() -> repository.findByEmail("admin@admin.com"));

            if(adminExistente.isEmpty()){
                Usuario usuario = new Usuario();

                usuario.setNomeCompleto("Sargento Administrador");
                usuario.setCpf("00000000000");
                usuario.setEmail("admin@admin.com");
                usuario.setNivelAcesso(NivelAcesso.ADMIN);
                usuario.setSenha(passwordEncoder.encode("000000"));

                repository.save(usuario);

                System.out.println("✅ Usuário ADMIN criado com sucesso!");
                System.out.println("   CPF: 00000000000");
                System.out.println("   Senha: 000000");
            }else{
                Usuario usuario = adminExistente.get();
                usuario.setNomeCompleto("Sargento Administrador");
                usuario.setCpf("00000000000");
                usuario.setEmail("admin@admin.com");
                usuario.setNivelAcesso(NivelAcesso.ADMIN);

                if (usuario.getSenha() == null || usuario.getSenha().isBlank()
                        || passwordEncoder.matches("000", usuario.getSenha())) {
                    usuario.setSenha(passwordEncoder.encode("000000"));
                    System.out.println("Senha inicial do ADMIN atualizada para 000000.");
                }

                repository.save(usuario);
                System.out.println("Usuário ADMIN já existe no banco!");
            }
        };
    }

    @Bean
    @Order(1)
    public CommandLineRunner alignLegacySchema() {
        return args -> {
            if (datasourceUrl == null || !datasourceUrl.startsWith("jdbc:mysql")) {
                return;
            }

            executeIgnoringErrors("ALTER TABLE checkouts DROP CHECK checkouts_chk_1");
            executeIgnoringErrors("ALTER TABLE checkouts DROP CONSTRAINT checkouts_chk_1");
            executeIgnoringErrors("ALTER TABLE checkouts MODIFY COLUMN turno ENUM('MANHA','TARDE')");
            executeIgnoringErrors("ALTER TABLE usuario DROP CHECK usuario_chk_1");
            executeIgnoringErrors("ALTER TABLE usuario DROP CONSTRAINT usuario_chk_1");
            executeIgnoringErrors("ALTER TABLE usuario MODIFY COLUMN nivel_acesso VARCHAR(30) NOT NULL");
            executeIgnoringErrors("""
                    UPDATE usuario
                    SET nivel_acesso = CASE
                        WHEN nivel_acesso = '0' THEN 'GUARDA_VIDAS'
                        WHEN nivel_acesso = '1' THEN 'GUARDA_VIDAS'
                        WHEN nivel_acesso = '2' THEN 'ADMIN'
                        WHEN nivel_acesso = 'LIVRE' THEN 'GUARDA_VIDAS'
                        WHEN nivel_acesso = 'OCUPADO' THEN 'GUARDA_VIDAS'
                        ELSE nivel_acesso
                    END
                    """);
            executeIgnoringErrors("""
                    UPDATE usuario
                    SET cpf = '00000000000',
                        email = 'admin@admin.com',
                        nome_completo = 'Sargento Administrador',
                        nivel_acesso = 'ADMIN'
                    WHERE email = 'admin@admin.com' OR cpf = '00000000000'
                    """);
            executeIgnoringErrors("ALTER TABLE usuario MODIFY COLUMN nivel_acesso ENUM('LIVRE','OCUPADO','GUARDA_VIDAS','ADMIN') NOT NULL");
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
