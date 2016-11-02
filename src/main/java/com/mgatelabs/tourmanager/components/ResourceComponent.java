package com.mgatelabs.tourmanager.components;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.mgatelabs.tourmanager.entities.TourInfo;
import com.mgatelabs.tourmanager.entities.TourItem;
import com.mgatelabs.tourmanager.entities.TourItemType;
import com.mgatelabs.tourmanager.rest.BaseRestResponse;
import com.mgatelabs.tourmanager.rest.RestResponseCodes;
import com.sun.istack.internal.NotNull;
import com.sun.istack.internal.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.*;
import java.nio.charset.Charset;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/16/2016.
 */
@Component
@Path("/resource")
public class ResourceComponent {

    public static final File toursFolder = new File("." + File.separator + "Tours" + File.separator);

    public static final Pattern TOUR_IDENTIFIER_PATTERN = Pattern.compile("^[a-z0-9-_]+$");
    public static final Pattern TOUR_FULL_PATTERN = Pattern.compile("^[a-z0-9-_]+.tour$");
    public static final Pattern TOUR_FLOAT = Pattern.compile("^[-]{0,1}[0-9]*(\\.[0-9]+){0,1}$");
    public static final Pattern TOUR_INTEGER = Pattern.compile("^[-]{0,1}[0-9]+$");
    public static final Pattern TOUR_POSITIVE_INTEGER = Pattern.compile("^[0-9]+$");

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
        if (!m.matches()) {
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

    @POST
    @Path("/tour/delete")
    @Produces("application/json")
    public BaseRestResponse deleteTour(@FormParam("tourIdentifier") String tourIdentifier) {

        if (tourIdentifier == null) {
            BaseRestResponse missing = new BaseRestResponse();
            missing.setCode(RestResponseCodes.ERROR);
            missing.addMessage("A required parameter was not provided.");
            return missing;
        }
        tourIdentifier = tourIdentifier.trim();

        if (tourIdentifier.isEmpty()) {
            BaseRestResponse missing = new BaseRestResponse();
            missing.setCode(RestResponseCodes.ERROR);
            missing.addMessage("A required parameter was empty.");
            return missing;
        }

        // Ensure tourIdentifier is correct
        Matcher m = TOUR_FULL_PATTERN.matcher(tourIdentifier);
        if (!m.matches()) {
            BaseRestResponse missing = new BaseRestResponse();
            missing.setCode(RestResponseCodes.ERROR);
            missing.addMessage("Tour identifier is invalid.");
            return missing;
        }

        BaseRestResponse ending = new BaseRestResponse();

        final File targetFolder = new File(toursFolder, tourIdentifier);
        final File targetJson = new File(toursFolder, tourIdentifier + ".json");
        final File targetPreview = new File(toursFolder, tourIdentifier + ".png");

        try {
            boolean deleted = true;
            if (targetPreview.exists()) {
                deleted &= targetPreview.delete();
            }
            if (targetJson.exists()) {
                deleted &= targetJson.delete();
            }
            if (targetFolder.exists()) {
                deleted &= deleteDir(targetFolder);
            }

            if (!deleted) {
                ending.setCode(RestResponseCodes.ERROR);
                ending.addMessage("Could not delete tour");
            }
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
                    return (pathname.getName().matches("[a-zA-Z0-9-_~]+\\.(png|jpg|mp4)"));
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

    private static final ImmutableSet<String> LIST_POINT_TYPE = ImmutableSet.of("rot", "point", "action");
    private static final ImmutableSet<String> LIST_POINT_ICON = ImmutableSet.of("dot", "eye", "exit", "stop", "up", "down", "left", "right", "previous", "next", "hidden");
    private static final ImmutableSet<String> LIST_POINT_ACTION = ImmutableSet.of("nav", "stop", "exit", "play", "noop");
    private static final ImmutableSet<String> LIST_TRUE_FALSE = ImmutableSet.of("true", "false");
    private static final ImmutableSet<String> LIST_TRUE_FALSE_APPLY = ImmutableSet.of("true", "false", "apply");
    private static final ImmutableSet<String> LIST_ROOM_PLAYBACK = ImmutableSet.of("360","360lr","360tb","2d","lr","rl","tb", "180","180lr","180tb","ffd","ffdlr","ffdtb","cube","cubelr","cubetb");
    private static final ImmutableSet<String> ATTRS_FOR_ROT = ImmutableSet.of("yaw", "pitch", "depth", "size");
    private static final ImmutableSet<String> ATTRS_FOR_POINT = ImmutableSet.of("x", "y", "z", "xrot", "yrot", "zrot", "size");

    @POST
    @Path("/{tour:[a-z0-9-_]+\\.tour}/info")
    @Produces("application/json")
    public BaseRestResponse postTourInfo(@PathParam("tour") String tour, @FormParam("info") String jsonStr) {
        BaseRestResponse restResponse = new BaseRestResponse();

        // Verify response
        final ObjectMapper mapper = new ObjectMapper();

        try {
            JsonNode rootNode = mapper.readTree(jsonStr);

            // Verify JSON Integrity
            JsonNode major = getNode(rootNode, "version.major");
            if (!getValueFrom(major).equals("1")) {
                restResponse.addError("Invalid version major number.  Expected value 1. @ Path (version.major)");
            }
            JsonNode minor = getNode(rootNode, "version.minor");
            if (!getValueFrom(minor).equals("0")) {
                restResponse.addError("Invalid version minor number.  Expected value 0. @ Path (version.major)");
            }
            JsonNode rooms = getNode(rootNode, "rooms");
            if (rooms == null || rooms.size() == 0) {
                restResponse.addError("Invalid room list.  In order to save, you must define at least one room. @ Path (rooms)");
            } else {
                // Verify each room
                for (int i = 0; i < rooms.size(); i++) {
                    JsonNode room = rooms.get(i);
                    if (room == null) {
                        restResponse.addError("Missing room definition.  @ Path (rooms[" + i + "])");
                    } else {
                        JsonNode roomId = getNode(room, "id");
                        if (StringUtils.isEmpty(getValueFrom(roomId))) {
                            restResponse.addError("Invalid room identifier.  Room id is required. @ Path (rooms[" + i + "].id)");
                        }
                        JsonNode roomTitle = getNode(room, "title");
                        if (StringUtils.isEmpty(getValueFrom(roomTitle))) {
                            restResponse.addError("Invalid room title.  Room title is required. @ Path (rooms[" + i + "].title)");
                        }
                        // Previews are not required
                        //JsonNode roomPreview = getNode(room, "preview");
                        //if (StringUtils.isEmpty(getValueFrom(roomPreview))) {
                        //    restResponse.addError("Invalid room preview.  Room preview is required. @ Path (rooms[" + i + "].preview)");
                        //}
                        JsonNode roomContent = getNode(room, "content");
                        if (StringUtils.isEmpty(getValueFrom(roomContent))) {
                            restResponse.addError("Invalid room content.  Room content is required. @ Path (rooms[" + i + "].content)");
                        }
                        String playbackType = getValueFrom(getNode(room, "playback"));
                        if (!StringUtils.isEmpty(playbackType) && !LIST_ROOM_PLAYBACK.contains(playbackType)) {
                            restResponse.addError("Invalid room playback type.  @ Path (rooms[" + i + "].playback)");
                        }

                        String roomYaw = getValueFrom(getNode(room, "yaw"));
                        if (!isEmptyOrFloat(roomYaw)) {
                            String attributeName = "yaw";
                            restResponse.addError("Invalid point " + attributeName + ".  Provided " + attributeName + " value was not a valid decimal.  Acceptable formats include ## or #.# or .##. @ Path (rooms[" + i + "]." + attributeName + ")");
                        }

                        JsonNode roomPoints = getNode(room, "points");
                        if (roomPoints == null || roomPoints.size() == 0) {
                            restResponse.addError("Invalid point list.  A room must define at least one point. @ Path (rooms[" + i + "].points)");
                        } else {
                            for (int j = 0; j < roomPoints.size(); j++) {
                                JsonNode point = roomPoints.get(j);

                                {
                                    JsonNode pointTitle = getNode(point, "title");
                                    if (StringUtils.isEmpty(getValueFrom(pointTitle))) {
                                        restResponse.addError("Invalid point title.  Point title is required. @ Path (rooms[" + i + "].points[" + j + "].title)");
                                    }
                                }

                                boolean iconRequired = true;

                                {
                                    String pointType = getValueFrom(getNode(point, "type"));
                                    if (StringUtils.isEmpty(pointType)) {
                                        restResponse.addError("Invalid point type.  Point type is required. @ Path (rooms[" + i + "].points[" + j + "].type)");
                                    } else if (!LIST_POINT_TYPE.contains(pointType)) {
                                        restResponse.addError("Invalid point type.  Provided type value was not recognized. @ Path (rooms[" + i + "].points[" + j + "].type)");
                                    } else {
                                        final Set<String> checkAgainst;
                                        if (pointType.equals("rot")) {
                                            checkAgainst = ATTRS_FOR_ROT;
                                        } else if (pointType.equals("point")) {
                                            checkAgainst = ATTRS_FOR_POINT;
                                        } else {
                                            iconRequired = false;
                                            checkAgainst = ImmutableSet.of();
                                        }
                                         for (String attributeName : checkAgainst) {
                                            JsonNode pointValue = getNode(point, attributeName);
                                            if (!isEmptyOrFloat(getValueFrom(pointValue))) {
                                                restResponse.addError("Invalid point " + attributeName + ".  Provided " + attributeName + " value was not a valid decimal.  Acceptable formats include ## or #.# or .##. @ Path (rooms[" + i + "].points[" + j + "]." + attributeName + ")");
                                            }
                                        }
                                    }
                                }

                                if (iconRequired) {
                                    String pointIcon = getValueFrom(getNode(point, "icon"));
                                    if (StringUtils.isEmpty(pointIcon)) {
                                        restResponse.addError("Invalid point icon.  Point icon is required. @ Path (rooms[" + i + "].points[" + j + "].icon)");
                                    } else if (!LIST_POINT_ICON.contains(pointIcon)) {
                                        restResponse.addError("Invalid point icon.  Provided icon value was not recognized. @ Path (rooms[" + i + "].points[" + j + "].icon)");
                                    }
                                }

                                {
                                    String pointRecenter = getValueFrom(getNode(point, "recenter"));
                                    if (!StringUtils.isEmpty(pointRecenter) && !LIST_TRUE_FALSE_APPLY.contains(pointRecenter)) {
                                        restResponse.addError("Invalid point recenter.  Provided recenter value was not recognized. @ Path (rooms[" + i + "].points[" + j + "].recenter)");
                                    }
                                }

                                {
                                    String pointTimer = getValueFrom(getNode(point, "timer"));
                                    if (!isEmptyOrPositiveInteger(pointTimer)) {
                                        restResponse.addError("Invalid point timer.  Provided timer value was not recognized. @ Path (rooms[" + i + "].points[" + j + "].timer)");
                                    }
                                }

                                {
                                    String pointAction = getValueFrom(getNode(point, "action"));
                                    if (StringUtils.isEmpty(pointAction)) {
                                        restResponse.addError("Invalid point action.  Point action is required. @ Path (rooms[" + i + "].points[" + j + "].action)");
                                    } else if (!LIST_POINT_ACTION.contains(pointAction)) {
                                        restResponse.addError("Invalid point action.  Provided action value was not recognized. @ Path (rooms[" + i + "].points[" + j + "].action)");
                                    } else {
                                        if (pointAction.equals("nav")) {
                                            String pointTo = getValueFrom(getNode(point, "to"));
                                            if (StringUtils.isEmpty(pointTo)) {
                                                restResponse.addError("Invalid point to.  Point to is required when action is nav. @ Path (rooms[" + i + "].points[" + j + "].to)");
                                            }
                                        } else if (pointAction.equals("play")) {
                                            String pointContent = getValueFrom(getNode(point, "content"));
                                            if (StringUtils.isEmpty(pointContent)) {
                                                restResponse.addError("Invalid point content.  Point content is required when action is play. @ Path (rooms[" + i + "].points[" + j + "].content)");
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (restResponse.isSuccessful()) {
                // Ready to save
                final File tourFolder = new File(toursFolder, tour + File.separator);
                final File infoFile = new File(tourFolder, "index.tour.json");

                if (writeFile(infoFile, jsonStr)) {
                    restResponse.addMessage("Updated: " + infoFile.getAbsolutePath());
                } else {
                    restResponse.addError("Unable to save to: " + infoFile.getAbsolutePath());
                }

            }


        } catch (Exception ex) {
            restResponse.setCode(RestResponseCodes.FAILURE);
            restResponse.addMessage(ex.toString());
            ex.printStackTrace();
        }

        return restResponse;
    }

    @Nullable
    private JsonNode getNode(@NotNull final JsonNode root, @NotNull final String path) {
        String[] parts = path.split("\\.");
        JsonNode node = root;
        for (String part : parts) {
            if (node == null) {
                return null;
            }
            node = node.get(part);
        }
        return node;
    }

    @NotNull
    private String getValueFrom(@Nullable final JsonNode node) {
        if (node == null) {
            return "";
        }
        final String value = node.asText();
        return StringUtils.isEmpty(value) ? "" : value;
    }

    private boolean isEmptyOrFloat(@NotNull final String value) {
        if (StringUtils.isEmpty(value)) {
            return true;
        } else {
            return TOUR_FLOAT.matcher(value).matches();
        }
    }

    private boolean isEmptyOrInteger(@NotNull final String value) {
        if (StringUtils.isEmpty(value)) {
            return true;
        } else {
            return TOUR_INTEGER.matcher(value).matches();
        }
    }

    private boolean isEmptyOrPositiveInteger(@NotNull final String value) {
        if (StringUtils.isEmpty(value)) {
            return true;
        } else {
            return TOUR_POSITIVE_INTEGER.matcher(value).matches();
        }
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

    public static String readJsonFile(@NotNull final File jsonFile) {
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

    public static boolean writeFile(@NotNull final File jsonFile, @NotNull final String jsonContent) {
        if (jsonFile.exists() && jsonFile.isFile() && jsonFile.getName().endsWith(".json")) {
            try (FileOutputStream fileOutputStream = new FileOutputStream(jsonFile)) {
                BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(fileOutputStream);
                byte [] bytes = jsonContent.getBytes("UTF-8");
                bufferedOutputStream.write(bytes, 0, bytes.length);
                bufferedOutputStream.flush();
                return true;
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
        return false;
    }

    private boolean deleteDir(File file) {
        boolean success = true;
        final File[] contents = file.listFiles();
        if (contents != null) {
            for (File f : contents) {
                success &= deleteDir(f);
            }
        }
        success &= file.delete();
        return success;
    }
}
