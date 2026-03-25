package com.eduard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/cv")
public class CVControllerAPI {

    @Value("${file.upload-dir}")
    private String folderPath;
    
    @Autowired
    private CVRepository cvRepository;

    // Get: Retrieve the CV:
    @GetMapping()
    public ResponseEntity<Resource> getCV(){
        List<CV> oneElemList = cvRepository.findAll();

        if(oneElemList.isEmpty()){
            return ResponseEntity.notFound().build();
        } 

        CV onlyCVElem = oneElemList.getFirst();

        String fileName = onlyCVElem.getFileName();

        Path file = Paths.get(folderPath);

        Path pdfFolderPath = file.resolve(fileName);

        System.out.println(pdfFolderPath.toAbsolutePath());
        System.out.println(pdfFolderPath.toFile().exists());

        Resource resource = new FileSystemResource(pdfFolderPath);

        return ResponseEntity.ok()
            .contentType(MediaType.valueOf("application/pdf"))
            .body(resource);

    }

}
