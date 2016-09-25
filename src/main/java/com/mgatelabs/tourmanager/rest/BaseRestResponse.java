package com.mgatelabs.tourmanager.rest;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.collect.Lists;
import com.sun.istack.internal.NotNull;

import java.util.List;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/15/2016.
 */
public class BaseRestResponse {
    private @NotNull RestResponseCodes code;

    private @NotNull final List<String> messages;

    public BaseRestResponse() {
        // Success by default
        this.code = RestResponseCodes.OK;
        messages = Lists.newArrayList();
    }

    @NotNull
    public RestResponseCodes getCode() {
        return code;
    }

    public void setCode(@NotNull RestResponseCodes code) {
        this.code = code;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void addMessage(@NotNull String msg) {
        messages.add(msg);
    }

    @JsonIgnore
    public boolean isSuccessful() {
        return code == RestResponseCodes.OK;
    }

    public void addError(@NotNull String msg) {
        setCode(RestResponseCodes.ERROR);
        messages.add(msg);
    }

    @Override
    public String toString() {
        return "BaseRestResponse{" +
                "code=" + code +
                '}';
    }
}
