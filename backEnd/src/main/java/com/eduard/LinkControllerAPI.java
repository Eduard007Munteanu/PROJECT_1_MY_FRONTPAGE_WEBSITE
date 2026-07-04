package com.eduard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.ServletOutputStream;

import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
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

    @GetMapping("/pdfFiles/{id}")
    public ResponseEntity<Resource> getSpecificPDFFile(@PathVariable Long id) {
        return servePdf(id, "inline");
    }

    @GetMapping("/pdfFiles/{id}/download")
    public ResponseEntity<Resource> getSpecificPDFDownloadFile(@PathVariable Long id) {
        return servePdf(id, "attachment");
    }

    @GetMapping("/imageFiles/{id}")
    public ResponseEntity<Resource> getSpecificImageFile(@PathVariable Long id) throws IOException {
        Optional<Link> theLink = linkRepository.findById(id);

        if (theLink.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Link theActualLink = theLink.get();
        String imageUrl = theActualLink.getImage_url();

        if (imageUrl == null || imageUrl.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        String basePath = "E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload";
        Path imagePath = Paths.get(basePath).resolve(imageUrl);
        Resource resource = new FileSystemResource(imagePath);

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(imagePath);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .body(resource);
    }


    
    private ResponseEntity<Resource> servePdf(Long id, String dispositionType){
        Optional<Link> theLink = linkRepository.findById(id);

        if (theLink.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Link theActualLink = theLink.get();

        String pdfUrl = theActualLink.getPdf_url();
        if (pdfUrl == null || pdfUrl.isBlank()) {
            return ResponseEntity.notFound().build();
        }
        String basePath = "E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload";

        Path pdfPath = Paths.get(basePath).resolve(pdfUrl);
        Resource resource = new FileSystemResource(pdfPath);

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
            .header("Content-Disposition", dispositionType + "; filename=\"file.pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(resource);
    }









    @GetMapping("/videoFilesPLAY/{id}")
    public void getVideoPacketsToSend(@PathVariable Long id,
                                    HttpServletRequest request,
                                    HttpServletResponse response) throws IOException {
        Optional<Link> theLink = linkRepository.findById(id);

        if (theLink.isPresent()) {
            Link theActualLink = theLink.get();
            String videoUrl = theActualLink.getVideo_url();
            if (videoUrl == null || videoUrl.isBlank()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            String pdfFolderStringPath = "E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload";
            Path pdfFolderPath = Paths.get(pdfFolderStringPath).resolve(videoUrl);

            System.out.println("Resolved path: " + pdfFolderPath.toAbsolutePath());
            System.out.println("File exists? " + Files.exists(pdfFolderPath));


            long fileSize = Files.size(pdfFolderPath);
            String contentType = Files.probeContentType(pdfFolderPath);
            if (contentType == null) contentType = "video/mp4";

            response.setHeader("Content-Type", contentType);
            response.setHeader("Accept-Ranges", "bytes");

            // HEAD: only headers, no body
            if ("HEAD".equalsIgnoreCase(request.getMethod())) {
                response.setHeader("Content-Length", String.valueOf(fileSize));
                response.setStatus(HttpServletResponse.SC_OK);
                return;
            }

            String rangeHeader = request.getHeader("Range");

            if (rangeHeader == null) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.setHeader("Content-Length", String.valueOf(fileSize));

                try (InputStream inputStream = Files.newInputStream(pdfFolderPath);
                    ServletOutputStream outputStream = response.getOutputStream()) {

                    byte[] buffer = new byte[8192];
                    for (int bytesRead; (bytesRead = inputStream.read(buffer)) != -1; ) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                    outputStream.flush();
                }

            } else if (rangeHeader.startsWith("bytes=")) {
                String[] ranges = rangeHeader.substring(6).split("-");
                long start = Long.parseLong(ranges[0]);
                long end = ranges.length > 1 && !ranges[1].isEmpty()
                        ? Long.parseLong(ranges[1])
                        : fileSize - 1;

                if (start < 0 || end >= fileSize || start > end) {
                    response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
                    response.setHeader("Content-Range", "bytes */" + fileSize);
                } else {
                    long length = end - start + 1;

                    response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
                    response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileSize);
                    response.setHeader("Content-Length", String.valueOf(length));
                    response.setHeader("Content-Type", contentType);

                    try (RandomAccessFile randomAccessFile = new RandomAccessFile(pdfFolderPath.toFile(), "r");
                        ServletOutputStream outputStream = response.getOutputStream()) {

                        randomAccessFile.seek(start);
                        byte[] buffer = new byte[8192];
                        long remaining = length;

                        while (remaining > 0) {
                            int bytesToRead = (int) Math.min(buffer.length, remaining);
                            int bytesRead = randomAccessFile.read(buffer, 0, bytesToRead);
                            if (bytesRead == -1) break;

                            outputStream.write(buffer, 0, bytesRead);
                            remaining -= bytesRead;
                        }
                        outputStream.flush();
                    }
                }
            }
        }
    }


    @GetMapping("/videoFiles/{id}")
    public ResponseEntity<Resource> getSpecificVideoFile(@PathVariable Long id){
        Optional<Link> theLink = linkRepository.findById(id);

        if(theLink.isPresent()){
            Link theActualLink = theLink.get();

            String videoUrl = theActualLink.getVideo_url();
            if (videoUrl == null || videoUrl.isBlank()) {
                return ResponseEntity.notFound().build();
            }
            
            String pdfFolderStringPath = ("E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload"); 

            Path file = Paths.get(pdfFolderStringPath);

            Path pdfFolderPath = file.resolve(videoUrl);

            Resource resource = new FileSystemResource(pdfFolderPath);
            return ResponseEntity.ok()
                .contentType(MediaType.valueOf("video/mp4"))
                .body(resource);
        } else{
            return ResponseEntity.notFound().build();
        }


    }


    @PutMapping("/textData/{id}")
    public ResponseEntity<Link> editTextData(@PathVariable Long id,
            @RequestParam("project_name") String project_name,
            @RequestParam("project_summary") String project_summary,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "github_link", required = false) String github_link,
            @RequestParam(value = "project_context", required = false) String project_context,
            @RequestParam(value = "project_role", required = false) String project_role,
            @RequestParam(value = "project_goal", required = false) String project_goal,
            @RequestParam(value = "project_languages", required = false) String project_languages,
            @RequestParam(value = "project_technologies", required = false) String project_technologies,
            @RequestParam(value = "project_takeaways", required = false) String project_takeaways,
            @RequestParam(value = "project_category", required = false) String project_category){
        Optional<Link> theLink = linkRepository.findById(id);

        if(theLink.isPresent()){
            Link theActualLink = theLink.get();

            theActualLink.setProject_name(project_name);
            theActualLink.setProject_summary(project_summary);
            theActualLink.setDescription(description != null ? description : "");
            theActualLink.setProject_context(project_context != null ? project_context : "");
            theActualLink.setProject_role(project_role != null ? project_role : "");
            theActualLink.setProject_goal(project_goal != null ? project_goal : "");
            theActualLink.setProject_languages(project_languages != null ? project_languages : "");
            theActualLink.setProject_technologies(project_technologies != null ? project_technologies : "");
            theActualLink.setProject_takeaways(project_takeaways != null ? project_takeaways : "");
            if(github_link != null){
                theActualLink.setGithub_link(github_link);
            }
            if(project_category != null && !project_category.isBlank()){
                theActualLink.setProject_category(project_category);
            }

            linkRepository.save(theActualLink);

            return ResponseEntity.ok(theActualLink);
        } else{
            return ResponseEntity.notFound().build();
        }
    }


    @PutMapping("/bigData/{id}")
    public ResponseEntity<Link> editBigData(@PathVariable Long id,
            @RequestParam(value = "pdf_folder", required = false) MultipartFile pdf_folder,
            @RequestParam(value = "video_folder", required = false) MultipartFile video_folder,
            @RequestParam(value = "image_folder", required = false) MultipartFile image_folder) throws IOException{

        

        Optional<Link> theLink = linkRepository.findById(id);

        if(theLink.isPresent()){
            Link theActualLink = theLink.get();

            String pdfFolderPath = ("E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload");

            Path folder = Paths.get(pdfFolderPath);

            Files.createDirectories(folder);


            if(pdf_folder != null || video_folder != null || image_folder != null){
                if(pdf_folder != null) {

                    deletePDFFromPath(theActualLink.getPdf_url());

                    System.out.println("PDF file received: " + pdf_folder.getOriginalFilename());
                    String pdf_folder_name = pathNameSanitizing(pdf_folder.getOriginalFilename());
                    String update_file_folder_name = pathCreator(pdf_folder_name, folder, pdf_folder);
                    theActualLink.setPdf_url(update_file_folder_name);

                    linkRepository.save(theActualLink);

                    
                }
                if(video_folder != null) {

                    deleteVideoFromPath(theActualLink.getVideo_url());

                    System.out.println("Video file received: " + video_folder.getOriginalFilename());
                    String video_folder_name = pathNameSanitizing(video_folder.getOriginalFilename());
                    String update_video_folder_name = pathCreator(video_folder_name, folder, video_folder);
                    theActualLink.setVideo_url(update_video_folder_name);

                    linkRepository.save(theActualLink);
                }
                if(image_folder != null) {
                    deleteImageFromPath(theActualLink.getImage_url());

                    System.out.println("Image file received: " + image_folder.getOriginalFilename());
                    String image_folder_name = pathNameSanitizing(image_folder.getOriginalFilename());
                    String update_image_folder_name = pathCreator(image_folder_name, folder, image_folder);
                    theActualLink.setImage_url(update_image_folder_name);

                    linkRepository.save(theActualLink);
                }
                return ResponseEntity.ok(theActualLink);
            }
                      
        }
        return ResponseEntity.notFound().build();
    }




    // POST: Add a new link
    @PostMapping
    public ResponseEntity<?> createLink(
            @RequestParam(value = "pdf_folder", required = false) MultipartFile pdf_folder,
            @RequestParam(value = "video_folder", required = false) MultipartFile video_folder,
            @RequestParam(value = "image_folder", required = false) MultipartFile image_folder,
            @RequestParam(value = "project_name", required = false) String project_name,
            @RequestParam(value = "project_summary", required = false) String project_summary,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "github_link", required = false) String github_link,
            @RequestParam(value = "project_context", required = false) String project_context,
            @RequestParam(value = "project_role", required = false) String project_role,
            @RequestParam(value = "project_goal", required = false) String project_goal,
            @RequestParam(value = "project_languages", required = false) String project_languages,
            @RequestParam(value = "project_technologies", required = false) String project_technologies,
            @RequestParam(value = "project_takeaways", required = false) String project_takeaways,
            @RequestParam(value = "project_category", required = false) String project_category) throws IOException {

        if (project_name == null || project_name.isBlank()) {
            project_name = "Untitled Project";
        }

        String pdfFolderPath = ("E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload"); 


        Path folder = Paths.get(pdfFolderPath);
        
        Files.createDirectories(folder);

        String update_file_folder_name = "";
        if (pdf_folder != null && !pdf_folder.isEmpty()) {
            String pdf_folder_name = pathNameSanitizing(pdf_folder.getOriginalFilename());
            update_file_folder_name = pathCreator(pdf_folder_name, folder, pdf_folder);
        }

        String update_video_folder_name = "";
        if (video_folder != null && !video_folder.isEmpty()) {
            String video_folder_name = pathNameSanitizing(video_folder.getOriginalFilename());
            update_video_folder_name = pathCreator(video_folder_name, folder, video_folder);
        }

        String update_image_folder_name = "";
        if (image_folder != null && !image_folder.isEmpty()) {
            String image_folder_name = pathNameSanitizing(image_folder.getOriginalFilename());
            update_image_folder_name = pathCreator(image_folder_name, folder, image_folder);
        }



        Link link = new Link();
        link.setProject_name(project_name);
        link.setProject_summary(project_summary != null ? project_summary : "");
        link.setDescription(description != null ? description : "");
        link.setGithub_link(github_link != null ? github_link : "");
        link.setProject_category(project_category != null && !project_category.isBlank() ? project_category : "personal");
        link.setProject_context(project_context != null ? project_context : "");
        link.setProject_role(project_role != null ? project_role : "");
        link.setProject_goal(project_goal != null ? project_goal : "");
        link.setProject_languages(project_languages != null ? project_languages : "");
        link.setProject_technologies(project_technologies != null ? project_technologies : "");
        link.setProject_takeaways(project_takeaways != null ? project_takeaways : "");
        link.setImage_url(update_image_folder_name);
        link.setPdf_url(update_file_folder_name);
        link.setVideo_url(update_video_folder_name);

        
        
        return ResponseEntity.ok(linkRepository.save(link));

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
    public ResponseEntity<Link> deleteSpecificLink(@PathVariable Long id) throws IOException{
        Optional<Link> linkEntity = linkRepository.findById(id);
        if(linkEntity.isPresent()){
            Link actualLinkEntity = linkEntity.get();


            String videoUrl = actualLinkEntity.getVideo_url();
            String pdfUrl = actualLinkEntity.getPdf_url();
            String imageUrl = actualLinkEntity.getImage_url();


            deleteFileFromPath(pdfUrl, videoUrl, imageUrl);

            linkRepository.delete(actualLinkEntity);
            return ResponseEntity.ok(actualLinkEntity);
        } else{
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping
    public void deleteAllLinks() throws IOException{

        List<Link> links = linkRepository.findAll();

        for(Link link : links){
            String videoUrl = link.getVideo_url();
            String pdfUrl = link.getPdf_url();
            String imageUrl = link.getImage_url();

            deleteFileFromPath(pdfUrl, videoUrl, imageUrl);
        }

        linkRepository.deleteAll();
    } 


    private void deleteFileFromPath(String deletingPDFFile, String deletingVideoFile, String deletingImageFile) throws IOException{
        String folderStringPath = ("E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload"); 

        Path file = Paths.get(folderStringPath);

        Path pdfFolderPath = deletingPDFFile == null || deletingPDFFile.isBlank()
                ? null
                : file.resolve(deletingPDFFile);
        Path videoFolderPath = deletingVideoFile == null || deletingVideoFile.isBlank()
                ? null
                : file.resolve(deletingVideoFile);
        Path imageFolderPath = deletingImageFile == null || deletingImageFile.isBlank()
                ? null
                : file.resolve(deletingImageFile);


        if (pdfFolderPath != null) {
            try{
                Files.deleteIfExists(pdfFolderPath);
            } catch(IOException e){
                throw new IOException("Failed to remove pdf due to incorrect path: " + pdfFolderPath, e);
            }
        }

        
        if (videoFolderPath != null) {
            try{
                Files.deleteIfExists(videoFolderPath);
            } catch(IOException e){
                throw new IOException("Failed to remove video due to incorrect path: " + videoFolderPath, e);
            }
        }

        if (imageFolderPath != null) {
            try{
                Files.deleteIfExists(imageFolderPath);
            } catch(IOException e){
                throw new IOException("Failed to remove image due to incorrect path: " + imageFolderPath, e);
            }
        }
    }



    private void deletePDFFromPath(String deletingPDFFile)  throws IOException{
        if (deletingPDFFile == null || deletingPDFFile.isBlank()) {
            return;
        }

        String folderStringPath = ("E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload"); 

        Path file = Paths.get(folderStringPath);

        Path pdfFolderPath = file.resolve(deletingPDFFile);

        try{
            Files.deleteIfExists(pdfFolderPath);
        } catch(IOException e){
            throw new IOException("Failed to remove pdf due to incorrect path: " + pdfFolderPath, e);
        }

    }


    private void deleteVideoFromPath(String deletingVideoFile)  throws IOException{
        if (deletingVideoFile == null || deletingVideoFile.isBlank()) {
            return;
        }

        String folderStringPath = ("E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload"); 

        Path file = Paths.get(folderStringPath);

        Path videoFolderPath = file.resolve(deletingVideoFile);

        try{
            Files.deleteIfExists(videoFolderPath);
        } catch(IOException e){
            throw new IOException("Failed to remove video due to incorrect path: " + videoFolderPath, e);
        }

    }

    private void deleteImageFromPath(String deletingImageFile)  throws IOException{
        if (deletingImageFile == null || deletingImageFile.isBlank()) {
            return;
        }

        String folderStringPath = ("E:/Programare in timp liber/Projects/PROJECT_1_MY_FRONTPAGE_WEBSITE/backEnd/upload"); 

        Path file = Paths.get(folderStringPath);
        Path imageFolderPath = file.resolve(deletingImageFile);

        try{
            Files.deleteIfExists(imageFolderPath);
        } catch(IOException e){
            throw new IOException("Failed to remove image due to incorrect path: " + imageFolderPath, e);
        }
    }
}
