package com.mgatelabs.tourmanager.rest;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/15/2016.
 */
public class TourListItem {

    private final String identifier;
    private final String name;
    private final String dateModified;
    private final boolean previewAvailable;

    public TourListItem(String identifier, String name, String dateModified, boolean previewAvailable) {
        this.identifier = identifier;
        this.name = name;
        this.dateModified = dateModified;
        this.previewAvailable = previewAvailable;
    }

    public String getIdentifier() {
        return identifier;
    }

    public String getName() {
        return name;
    }

    public String getDateModified() {
        return dateModified;
    }

    public boolean isPreviewAvailable() {
        return previewAvailable;
    }
}
