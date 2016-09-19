package com.mgatelabs.tourmanager.controllers;

import com.mgatelabs.tourmanager.entities.TourInfo;
import com.mgatelabs.tourmanager.entities.TourItem;
import com.mgatelabs.tourmanager.entities.TourItemType;
import org.springframework.stereotype.Component;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import java.io.*;
import java.nio.charset.Charset;
import java.util.Collections;
import java.util.Date;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/16/2016.
 */
@Component
@Path("/resource")
public class ResourceComponent {

    @GET
    @Path("/{tour:[a-zA-Z0-9]+\\.tour}/info")
    @Produces("application/json")
    public TourInfo listTourInfo(@PathParam("tour") String tour) {
        final File tourFolder = new File("." + File.separator + "Tours" + File.separator + tour + File.separator);
        final File tourPreview = new File("." + File.separator + "Tours" + File.separator + tour + ".png");
        final File tourJson = new File("." + File.separator + "Tours" + File.separator + tour + ".json");

        final TourInfo tourInfo = new TourInfo();

        // Definition
        {
            final TourItem definitionItem = new TourItem();
            definitionItem.setType(TourItemType.DEFINITION);
            definitionItem.setName(tour);
            definitionItem.setPreview(tourPreview.exists());
            definitionItem.setJson(readJsonFile(tourJson));
            tourInfo.setDefinition(definitionItem);
        }

        // Find Files
        for (File mediaFile : tourFolder.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                if (pathname.exists() || pathname.isFile())
                    return (pathname.getName().matches("[a-zA-Z0-9]+\\.(png|jpg)"));
                return false;
            }
        })) {
            final File mediaPreview = new File(tourFolder, mediaFile.getName() + ".png");
            final File mediaJson = new File(tourFolder, mediaFile.getName() + ".json");

            final TourItem mediaItem = new TourItem();
            mediaItem.setType(TourItemType.MEDIA);
            mediaItem.setName(mediaFile.getName());
            mediaItem.setPreview(mediaPreview.exists());
            mediaItem.setJson(readJsonFile(mediaJson));
            tourInfo.addItem(mediaItem);
        }
        Collections.sort(tourInfo.getItems());

        // Index
        {
            final File infoFile = new File(tourFolder, "index.tour.json");

            final TourItem mediaItem = new TourItem();
            mediaItem.setType(TourItemType.INDEX);
            mediaItem.setName(infoFile.getName());
            mediaItem.setPreview(false);
            mediaItem.setJson(readJsonFile(infoFile));
            tourInfo.setIndex(mediaItem);
        }

        return tourInfo;
    }

    @GET
    @Path("/{tour:[a-zA-Z0-9]+\\.tour}/{file:[a-zA-Z0-9]+(\\.jpg|\\.png){0,1}\\.png}")
    @Produces("image/png")
    public Response getPng(@PathParam("tour") String tour, @PathParam("file") String filename) {
        File imageFile = new File("." + File.separator + "Tours" + File.separator + tour + File.separator + filename);
        if (imageFile.exists()) {
            try {
                return Response.ok(new FileInputStream(imageFile)).lastModified(new Date(imageFile.lastModified())).build();
            } catch (Exception ex) {
                return null;
            }
        }
        return Response.noContent().build();
    }

    @GET
    @Path("/{tour:[a-zA-Z0-9]+\\.tour}/{file:[a-zA-Z0-9]+(\\.jpg|\\.png){0,1}\\.jpg}")
    @Produces("image/jpg")
    public Response getJpeg(@PathParam("tour") String tour, @PathParam("file") String filename) {
        File imageFile = new File("." + File.separator + "Tours" + File.separator + tour + File.separator + filename);
        if (imageFile.exists()) {
            try {
                return Response.ok(new FileInputStream(imageFile)).lastModified(new Date(imageFile.lastModified())).build();
            } catch (Exception ex) {
                return null;
            }
        }
        return Response.noContent().build();
    }

    @GET
    @Path("/{tour:[a-zA-Z0-9]+\\.tour}/{file:[a-zA-Z0-9]+((\\.tour|\\.jpg)){0,1}\\.json}")
    @Produces("application/json")
    public Response getJson(@PathParam("tour") String tour, @PathParam("file") String filename) {
        File imageFile = new File("." + File.separator + "Tours" + File.separator + tour + File.separator + filename);
        if (imageFile.exists()) {
            try {
                return Response.ok(new FileInputStream(imageFile)).lastModified(new Date(imageFile.lastModified())).build();
            } catch (Exception ex) {
                return null;
            }
        }
        return Response.noContent().build();
    }

    public static String readJsonFile(File jsonFile) {
        if (jsonFile.exists() && jsonFile.isFile() && jsonFile.getName().endsWith(".json")) {
            try (FileInputStream fileInputStream = new FileInputStream(jsonFile)) {
                BufferedInputStream bufferedInputStream = new BufferedInputStream(fileInputStream);
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                int b;
                while ((b = bufferedInputStream.read()) != -1) {
                    byteArrayOutputStream.write(b);
                }
                return new String(byteArrayOutputStream.toByteArray(), Charset.forName("UTF-8"));
            } catch (Exception ex) {
                return "";
            }
        }
        return "";
    }
}
