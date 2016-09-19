package com.mgatelabs.tourmanager.rest;

import com.google.common.collect.Lists;

import java.util.List;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/15/2016.
 */
public class TourListResponse extends BaseRestResponse {

    private final List<TourListItem> items;

    public TourListResponse() {
        super();
        this.items = Lists.newArrayList();
    }

    public List<TourListItem> getItems() {
        return items;
    }

    public void addItem(TourListItem item) {
        items.add(item);
    }
}
