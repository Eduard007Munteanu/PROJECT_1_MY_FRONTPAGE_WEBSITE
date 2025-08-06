package com.eduard;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Column;


@Entity
public class Link {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String project_name;
    private String github_link;
    private String description;
    private String pdf_url;
    private String video_url;

    public Link(String project_name, String github_link, String description, String pdf_url, String video_url){
        this.project_name = project_name;
        this.github_link = github_link;
        this.description = description;
        this.pdf_url = pdf_url;
        this.video_url = video_url;
    }
}
