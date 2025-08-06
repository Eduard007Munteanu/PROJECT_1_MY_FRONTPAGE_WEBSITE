package com.eduard;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Table;
import jakarta.persistence.Column;


@Entity
public class Link {
    @Id
    @GeneratedValue
    private Long id;
    private String project_name;
    private String github_link;
    private String description;
    private String pdf_url;
    private String video_url;
}
