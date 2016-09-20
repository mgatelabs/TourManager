package com.mgatelabs.tourmanager;

import com.mgatelabs.tourmanager.components.ResourceComponent;
import com.mgatelabs.tourmanager.components.TourListComponent;
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
        register(TourListComponent.class);
        register(ResourceComponent.class);
    }
}
