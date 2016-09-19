package com.mgatelabs.tourmanager.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mgatelabs.tourmanager.entities.TourDefinition;
import com.mgatelabs.tourmanager.rest.TourListItem;
import com.mgatelabs.tourmanager.rest.TourListResponse;
import org.springframework.stereotype.Component;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import java.io.File;
import java.io.FileFilter;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/15/2016.
 */
@Component
@Path("/tours")
public class TourListController {

    @Path("/list")
    @GET
    @Produces("application/json")
    public TourListResponse listTours() {
        final File folder = new File("." + File.separator + "Tours" + File.separator);

        // Find the folders
        final File[] tourFolders = folder.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                if (pathname.isDirectory() && pathname.getName().endsWith(".tour")) {
                    return true;
                }
                return false;
            }
        });

        ObjectMapper objectMapper = new ObjectMapper();

        final TourListResponse response = new TourListResponse();

        // Process the folders
        for (File tourFolder : tourFolders) {
            // See if the json exists
            final File json = new File(folder, tourFolder.getName() + ".json");
            final File png = new File(folder, tourFolder.getName() + ".png");
            String identifier = tourFolder.getName();
            String name = identifier;
            final boolean jsonExists = (json.exists() && !json.isDirectory());
            final boolean previewExists = (png.exists() && !png.isDirectory());

            try {
                final TourDefinition tourDefinition = objectMapper.readValue(json, TourDefinition.class);
                name = tourDefinition.getDisplay();
            } catch (Exception ex) {
                response.addMessage("Could not process *.json file for " + tourFolder.getName());
            }

            response.addItem(new TourListItem(identifier, name, "", previewExists));
        }

        return response;
    }
}
