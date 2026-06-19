package com.example.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.entity.Arquivo;
import com.example.demo.repository.ArquivoRepository;

@Service

public class ArquivoService {

    @Value("${arquivamento.path}")
    private String path;

    @Autowired
    private ArquivoRepository arquivoRepository;

    public Arquivo upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        Path root = Paths.get(path);

        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
            String nome = UUID.randomUUID().toString();

            Path destino = root.resolve(nome);

            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            Arquivo arquivo = new Arquivo();

            arquivo.setCaminho(destino.toString());
            arquivo.setNome(file.getOriginalFilename());
            arquivo.setTamanho(file.getSize());
            arquivo.setTipo(file.getContentType());

            return arquivoRepository.save(arquivo);

        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar o arquivo", e);
        }
    }

    public Arquivo registrarReferencia(String referencia) {
        if (referencia == null || referencia.isBlank()) {
            return null;
        }

        try {
            if (referencia.startsWith("data:") && referencia.contains(";base64,")) {
                String[] parts = referencia.split(",", 2);
                if (parts.length != 2) {
                    throw new RuntimeException("Formato da imagem inválido");
                }

                String meta = parts[0];
                String base64Data = parts[1].replaceAll("\\s", "");

                String mime = "application/octet-stream";
                if (meta.startsWith("data:") && meta.contains(";")) {
                    mime = meta.substring(5, meta.indexOf(';'));
                }

                byte[] bytes = Base64.getDecoder().decode(base64Data);

                // Limite por segurança: 5MB (5 * 1024 * 1024)
                long maxBytes = 5L * 1024L * 1024L;
                if (bytes.length > maxBytes) {
                    throw new RuntimeException("Arquivo muito grande. Máximo permitido: 5MB");
                }

                Path root = Paths.get(path);
                Files.createDirectories(root);

                String ext = extensionFromMime(mime);
                String nome = UUID.randomUUID().toString() + (ext.isEmpty() ? "" : "." + ext);
                Path destino = root.resolve(nome);

                Files.write(destino, bytes);

                Arquivo arquivo = new Arquivo();
                arquivo.setCaminho(destino.toString());
                arquivo.setNome(nome);
                arquivo.setTamanho((long) bytes.length);
                arquivo.setTipo(mime);

                return arquivoRepository.save(arquivo);
            } else {
                Arquivo arquivo = new Arquivo();
                arquivo.setNome(referencia);
                arquivo.setCaminho(referencia);
                arquivo.setTamanho(0L);
                arquivo.setTipo("text/plain");

                return arquivoRepository.save(arquivo);
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Imagem em base64 inválida", e);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível salvar a foto enviada", e);
        }
    }

    private static String extensionFromMime(String mime) {
        if (mime == null) return "";
        switch (mime) {
            case "image/png": return "png";
            case "image/jpeg": return "jpg";
            case "image/jpg": return "jpg";
            case "image/gif": return "gif";
            case "image/webp": return "webp";
            default: return "";
        }
    }
}
