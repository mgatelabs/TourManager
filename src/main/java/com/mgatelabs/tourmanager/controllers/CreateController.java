package com.mgatelabs.tourmanager.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/19/2016.
 */
@Controller
public class CreateController {
    @RequestMapping("/create")
    String index(Model model) {
        model.addAttribute("bodyTemplate", "create");
        model.addAttribute("menuItem", "create");
        return "portal";
    }
}
