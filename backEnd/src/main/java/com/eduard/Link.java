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
    private String project_summary;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String project_category;
    private String project_context;
    private String project_role;
    @Column(columnDefinition = "TEXT")
    private String project_goal;
    @Column(columnDefinition = "TEXT")
    private String project_languages;
    @Column(columnDefinition = "TEXT")
    private String project_technologies;
    @Column(columnDefinition = "TEXT")
    private String project_takeaways;
    private String image_url;
    private String pdf_url;
    private String video_url;

    // Getters
    public Long getId() { return id; }
    public String getProject_name() { return project_name; }
    public String getGithub_link() { return github_link; }
    public String getProject_summary() { return project_summary; }
    public String getDescription() { return description; }
    public String getProject_category() { return project_category; }
    public String getProject_context() { return project_context; }
    public String getProject_role() { return project_role; }
    public String getProject_goal() { return project_goal; }
    public String getProject_languages() { return project_languages; }
    public String getProject_technologies() { return project_technologies; }
    public String getProject_takeaways() { return project_takeaways; }
    public String getImage_url() { return image_url; }
    public String getPdf_url() { return pdf_url; }
    public String getVideo_url() { return video_url; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setProject_name(String project_name) { this.project_name = project_name; }
    public void setGithub_link(String github_link) { this.github_link = github_link; }
    public void setProject_summary(String project_summary) { this.project_summary = project_summary; }
    public void setDescription(String description) { this.description = description; }
    public void setProject_category(String project_category) { this.project_category = project_category; }
    public void setProject_context(String project_context) { this.project_context = project_context; }
    public void setProject_role(String project_role) { this.project_role = project_role; }
    public void setProject_goal(String project_goal) { this.project_goal = project_goal; }
    public void setProject_languages(String project_languages) { this.project_languages = project_languages; }
    public void setProject_technologies(String project_technologies) { this.project_technologies = project_technologies; }
    public void setProject_takeaways(String project_takeaways) { this.project_takeaways = project_takeaways; }
    public void setImage_url(String image_url) { this.image_url = image_url; }
    public void setPdf_url(String pdf_url) { this.pdf_url = pdf_url; }
    public void setVideo_url(String video_url) { this.video_url = video_url; }

    
}
