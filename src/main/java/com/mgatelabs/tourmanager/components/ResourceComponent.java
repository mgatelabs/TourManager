package com.mgatelabs.tourmanager.components;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Maps;
import com.mgatelabs.tourmanager.entities.TourInfo;
import com.mgatelabs.tourmanager.entities.TourItem;
import com.mgatelabs.tourmanager.entities.TourItemType;
import com.mgatelabs.tourmanager.rest.BaseRestResponse;
import com.mgatelabs.tourmanager.rest.RestResponseCodes;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.*;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/16/2016.
 */
@Component
@Path("/resource")
public class ResourceComponent {

    public static final File toursFolder =  new File("." + File.separator + "Tours" + File.separator);

    public static final Pattern TOUR_IDENTIFIER_PATTERN = Pattern.compile("^[a-z0-9-_]+$");

    @POST
    @Path("/tour/create")
    @Produces("application/json")
    public BaseRestResponse createTour(@FormParam("tourTitle") String tourTitle, @FormParam("tourIdentifier") String tourIdentifier) {

        if (tourTitle == null || tourIdentifier == null) {
            BaseRestResponse missing = new BaseRestResponse();
            missing.setCode(RestResponseCodes.ERROR);
            missing.addMessage("A required parameter was not provided.");
            return missing;
        }
        tourTitle = tourTitle.trim();
        tourIdentifier = tourIdentifier.trim();

        if (tourTitle.isEmpty() || tourIdentifier.isEmpty()) {
            BaseRestResponse missing = new BaseRestResponse();
            missing.setCode(RestResponseCodes.ERROR);
            missing.addMessage("A required parameter was empty.");
            return missing;
        }

        // Ensure tourIdentifier is correct
        Matcher m = TOUR_IDENTIFIER_PATTERN.matcher(tourIdentifier);
        if(!m.matches()) {
            BaseRestResponse missing = new BaseRestResponse();
            missing.setCode(RestResponseCodes.ERROR);
            missing.addMessage("Tour identifier is invalid.");
            return missing;
        }

        // Make sure folder doesn't exist
        final File targetFolder = new File(toursFolder, tourIdentifier + ".tour");
        final File indexFile = new File(toursFolder, tourIdentifier + ".tour" + File.separator + "index.tour.json");
        final File targetJson = new File(toursFolder, tourIdentifier + ".tour.json");
        final File targetPreview = new File(toursFolder, tourIdentifier + ".tour.png");
        if (targetFolder.exists() || targetJson.exists() || targetPreview.exists()) {
            BaseRestResponse missing = new BaseRestResponse();
            missing.setCode(RestResponseCodes.ERROR);
            missing.addMessage("Another tour or file has one of the required file names, please choose another identifier.");
            return missing;
        }

        // Everything is good, lets start making stuff

        Map<String, Object> jsonPieces = Maps.newHashMap();
        jsonPieces.put("display", tourTitle);
        jsonPieces.put("type", new Integer(10));
        jsonPieces.put("present", Boolean.FALSE);

        Map<String, Object> indexPieces = Maps.newHashMap();
        Map<String, Object> versionPieces = Maps.newHashMap();
        versionPieces.put("major", new Integer(1));
        versionPieces.put("minor", new Integer(0));

        indexPieces.put("version", versionPieces);
        indexPieces.put("tool", "tourmanager");
        indexPieces.put("title", tourTitle);
        indexPieces.put("rooms", new ArrayList<String>());

        ObjectMapper objectMapper = new ObjectMapper();

        BaseRestResponse ending = new BaseRestResponse();

        try {
            targetFolder.mkdir();
            objectMapper.writeValue(targetJson, jsonPieces);
            objectMapper.writeValue(indexFile, indexPieces);
        } catch (Exception ex) {
            ending.setCode(RestResponseCodes.ERROR);
            ending.addMessage(ex.toString());
            ex.printStackTrace();
        }

        return ending;
    }

    @GET
    @Path("/{tour:[a-z0-9-_]+\\.tour}/info")
    @Produces("application/json")
    public TourInfo listTourInfo(@PathParam("tour") String tour) {
        final File tourFolder = new File(toursFolder, tour + File.separator);
        final File tourPreview = new File(toursFolder, tour + ".png");
        final File tourJson = new File(toursFolder, tour + ".json");

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
                    return (pathname.getName().matches("[a-zA-Z0-9-_]+\\.(png|jpg)"));
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
    @Path("/{tour:[a-z0-9-_]+\\.tour}/{file:[a-zA-Z0-9-_]+(\\.jpg|\\.png){0,1}\\.png}")
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
    @Path("/{tour:[a-z0-9-_]+\\.tour}/{file:[a-zA-Z0-9-_]+(\\.jpg|\\.png){0,1}\\.jpg}")
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
    @Path("/{tour:[a-z0-9-_]+\\.tour}/{file:[a-zA-Z0-9-_]+((\\.tour|\\.jpg)){0,1}\\.json}")
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
