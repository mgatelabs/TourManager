package com.mgatelabs.tourmanager;

import com.mgatelabs.tourmanager.controllers.ResourceComponent;
import com.mgatelabs.tourmanager.controllers.TourListController;
import org.glassfish.jersey.server.ResourceConfig;
import org.springframework.context.annotation.Configuration;

import javax.ws.rs.ApplicationPath;

/**
 * Created by @mgatelabs (Michael Fuller) on 9/16/2016.
 */
@Configuration
@ApplicationPath("/rest")
public class JerseyConfig extends ResourceConfig {
    public JerseyConfig() {
        register(TourListController.class);
        register(ResourceComponent.class);
    }
}
