package com.mgatelabs.tourmanager.entities;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/15/2016.
 */
public class TourDefinition {

    // Sample
    /*
    {
        "display" : "001.jpg",
        "type" : 10,
        "present" : false
    }
    */

    private String display;
    private boolean present;
    private int type;

    public TourDefinition() {
    }

    public String getDisplay() {
        return display;
    }

    public void setDisplay(String display) {
        this.display = display;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }
}
