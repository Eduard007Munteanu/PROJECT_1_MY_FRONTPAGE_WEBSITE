package com.eduard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http//localhost:3000") //Allow CORS communication with frontend port 3000. For development only!
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
    public Link createLink(@RequestBody Link link) {
        return linkRepository.save(link);
    }
}