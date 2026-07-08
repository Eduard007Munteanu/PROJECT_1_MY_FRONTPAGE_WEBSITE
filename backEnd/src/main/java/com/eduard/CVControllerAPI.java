package com.eduard;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/cv")
public class CVControllerAPI {

    @Value("${cv.pdf-path}")
    private String cvPdfPath;

    @GetMapping("/pdf")
    public ResponseEntity<Resource> getCvPdf() throws Exception {
        Path cvPath = Paths.get(cvPdfPath);
        Resource resource = new FileSystemResource(cvPath);

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"Eduard_CV.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @GetMapping("/pdf/download")
    public ResponseEntity<Resource> downloadCvPdf() throws Exception {
        Path cvPath = Paths.get(cvPdfPath);
        Resource resource = new FileSystemResource(cvPath);

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"Eduard_CV.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
