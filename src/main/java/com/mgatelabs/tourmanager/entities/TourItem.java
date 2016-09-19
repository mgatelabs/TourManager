package com.mgatelabs.tourmanager.entities;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/17/2016.
 */
public class TourItem implements Comparable<TourItem> {

    public TourItemType type;
    public String name;
    public boolean preview;
    public String json;

    public TourItemType getType() {
        return type;
    }

    public void setType(TourItemType type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isPreview() {
        return preview;
    }

    public void setPreview(boolean preview) {
        this.preview = preview;
    }

    public String getJson() {
        return json;
    }

    public void setJson(String json) {
        this.json = json;
    }

    @Override
    public int compareTo(TourItem o) {
        return this.getName().compareTo(o.getName());
    }
}
