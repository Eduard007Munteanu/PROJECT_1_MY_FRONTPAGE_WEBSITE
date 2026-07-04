package com.eduard;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;



@Entity
public class Link {

    public Link() {}

    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String project_name;
    private String github_link;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String project_category;
    private String image_url;
    private String pdf_url;
    private String video_url;

    // Getters
    public Long getId() { return id; }
    public String getProject_name() { return project_name; }
    public String getGithub_link() { return github_link; }
    public String getDescription() { return description; }
    public String getProject_category() { return project_category; }
    public String getImage_url() { return image_url; }
    public String getPdf_url() { return pdf_url; }
    public String getVideo_url() { return video_url; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setProject_name(String project_name) { this.project_name = project_name; }
    public void setGithub_link(String github_link) { this.github_link = github_link; }
    public void setDescription(String description) { this.description = description; }
    public void setProject_category(String project_category) { this.project_category = project_category; }
    public void setImage_url(String image_url) { this.image_url = image_url; }
    public void setPdf_url(String pdf_url) { this.pdf_url = pdf_url; }
    public void setVideo_url(String video_url) { this.video_url = video_url; }

    
}
