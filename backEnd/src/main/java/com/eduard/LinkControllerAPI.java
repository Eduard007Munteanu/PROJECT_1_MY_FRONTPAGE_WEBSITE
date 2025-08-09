package com.eduard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000") //Allow CORS communication with frontend port 3000. For development only!
@RestController
@RequestMapping("/api/links")
public class LinkControllerAPI {

    @Autowired
    private LinkRepository linkRepository;

    // GET: Retrieve all links
    @GetMapping
    public List<Link> getAllLinks() {
        return linkRepository.findAll();
    }


    // GET: Retrieve specific link by id if exists, else 404. 
    @GetMapping("/{id}")
    public ResponseEntity<Link> getSpecificLink(@PathVariable Long id){
        Optional<Link> theLink = linkRepository.findById(id);

        if(theLink.isPresent()){
            Link theActualLink = theLink.get();
            return ResponseEntity.ok(theActualLink);
        } else{
            return ResponseEntity.notFound().build();
        }

    }

    // POST: Add a new link
    @PostMapping
    public Link createLink(@RequestParam("pdf_folder") MultipartFile pdf_folder, @RequestParam("video_folder") MultipartFile video_folder, @RequestParam("project_name") String project_name, @RequestParam("description") String description, @RequestParam("github_link") String github_link) throws IOException {
        //return linkRepository.save(link);
        

        

        String pdfFolderPath = ("E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload"); 


        Path folder = Paths.get(pdfFolderPath);
        
        Files.createDirectories(folder);

        String pdf_folder_name = pathNameSanitizing(pdf_folder.getOriginalFilename());


        String update_file_folder_name = pathCreator(pdf_folder_name, folder, pdf_folder);

        

        String video_folder_name = pathNameSanitizing(video_folder.getOriginalFilename());

        String update_video_folder_name = pathCreator(video_folder_name, folder, video_folder);




        Link link = new Link();
        link.setProject_name(project_name);
        link.setDescription(description);
        link.setGithub_link(github_link);
        link.setPdf_url(update_file_folder_name);
        link.setVideo_url(update_video_folder_name);

        
        
        return link;

    }

    private String pathCreator(String initialPathFile, Path folder, MultipartFile pdf_folder) throws IOException{
        

        String serializedPathFile = UUIDPathDefiner(initialPathFile);

        Path filePath = folder.resolve(serializedPathFile);

        pathCopyPerformance(filePath, pdf_folder);

        return serializedPathFile;
        

    }

    private String pathNameSanitizing(String fileName){
        String sanitizedFileName = fileName.replaceAll("[\\\\\\\\/:*?\\\"<>|]", "_");
        return sanitizedFileName;

    }

    private String UUIDPathDefiner(String initialPathFile){
        int lastDot = initialPathFile.lastIndexOf('.');
        String baseName;
        String extension;

        if (lastDot > 0 && lastDot < initialPathFile.length() - 1) {
            baseName = initialPathFile.substring(0, lastDot);
            extension = initialPathFile.substring(lastDot); // includes the dot
        } else {
            baseName = initialPathFile;
            extension = "";
        }

        return baseName + "__UUID__" + UUID.randomUUID().toString() + extension;
    }


    private void pathCopyPerformance(Path newFilePath, MultipartFile pdf_folder) throws IOException{
        try (InputStream in = pdf_folder.getInputStream()) {
                Files.copy(in, newFilePath);
        } catch (IOException e) {
            throw new IOException("Failed to copy file to: " + newFilePath, e);
        }
    }

    //Delete: Remove a link from the database
    @DeleteMapping("/{id}")
    public ResponseEntity<Link> deleteSpecificLink(@PathVariable Long id){
        Optional<Link> linkEntity = linkRepository.findById(id);
        if(linkEntity.isPresent()){
            Link actualLinkEntity = linkEntity.get();
            linkRepository.delete(actualLinkEntity);
            return ResponseEntity.ok(actualLinkEntity);
        } else{
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping
    public void deleteAllLinks(){
        linkRepository.deleteAll();
    } 
}