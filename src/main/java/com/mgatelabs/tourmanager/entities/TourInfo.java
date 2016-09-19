package com.mgatelabs.tourmanager.entities;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.mgatelabs.tourmanager.rest.BaseRestResponse;
import com.sun.istack.internal.NotNull;
import com.sun.istack.internal.Nullable;

import javax.validation.constraints.Null;
import java.util.List;
import java.util.Map;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/17/2016.
 */
public class TourInfo extends BaseRestResponse {

    private List<TourItem> items;

    @Nullable TourItem definition;

    @Nullable TourItem index;

    public TourInfo() {
        items = Lists.newArrayList();
    }

    @NotNull
    public List<TourItem> getItems() {
        return items;
    }

    @NotNull
    public TourInfo addItem(@NotNull final TourItem item) {
        items.add(item);
        return this;
    }

    public TourItem getDefinition() {
        return definition;
    }

    public void setDefinition(TourItem definition) {
        this.definition = definition;
    }

    public TourItem getIndex() {
        return index;
    }

    public void setIndex(TourItem index) {
        this.index = index;
    }
}
