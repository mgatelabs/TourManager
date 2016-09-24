package com.mgatelabs.tourmanager.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.ws.rs.GET;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/15/2016.
 */
@Controller
public class EditController {

    @GET
    @RequestMapping("/edit/{tour:[a-z0-9-_]+\\.tour}/")
    String edit(Model model, @PathVariable("tour") String tourIdentifier) {

        model.addAttribute("bodyTemplate", "tourEditor");
        model.addAttribute("tourIdentifier", tourIdentifier);
        model.addAttribute("menuItem", "edit");

        return "portal";
    }
}
