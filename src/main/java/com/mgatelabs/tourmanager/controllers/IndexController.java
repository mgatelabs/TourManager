package com.mgatelabs.tourmanager.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/14/2016.
 */
@Controller
public class IndexController {
    @RequestMapping("/")
    String index(Model model) {

        model.addAttribute("bodyTemplate", "list");
        model.addAttribute("menuItem", "index");

        return "portal";
    }
}
