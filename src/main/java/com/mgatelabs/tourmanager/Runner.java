package com.mgatelabs.tourmanager;

import org.springframework.boot.SpringApplication;

import java.io.File;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/14/2016.
 */
public class Runner {
    public static void main(String[] args) {
        // Lets get everything ready
        readyFolders();
        // Start the app
        SpringApplication.run(Application.class, args);
    }


    public static void readyFolders() {
        File f = new File("." + File.separator + "Tours");
        if (!f.exists() || !f.isDirectory()) {
            f.mkdir();
        }
    }
}
