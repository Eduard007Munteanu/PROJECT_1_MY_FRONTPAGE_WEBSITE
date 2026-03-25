package com.eduard;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
public class CV {
    

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;


    public Long getId(){
        return id;
    }

    public String getFileName(){
        return fileName;
    }




    public void setId(Long id){
        this.id = id;
    }

    public void setFileName(String file_name){
        this.fileName = file_name;
    }

}
