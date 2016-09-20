# TourManager
A embedded webapp for editing *.tour files for Mobile VR Station

This is very basic at the moment, it only supports loading in the *.tour folders and viewing it's information, rooms and points.

#Current Goals
- Edit/Delete/Copy/Archive/Package tour
- Add Room/Point
- Generate preview images
- WebGl Point Preview
- Validate on client/server side
- Save changes back to local file system

#Features
- Create/List/Edit(View Only) tour

#Concerns
- Don't allow this app onto the internet, it's built for localhost development and currently doesn't have any security

#Running
- I used Intellij community edition, so that should work for you also.  Just import the POM project.
- You will want to use the Runner class to start the application.  Just specify a work folder, thats outside the project.  On startup, it will construct the neccessary folders for data storage in your working folder.
- You can open you browser to http://localhost:8080 and use the web app.  Don't use EDGE, it can't read from the localhost.


# Format

## Identifier file

/identifier.tour.json

    {
      display: 'Tour name',
      type: 10,
      present: false
    }

## Index file

/identifier.tour/index.tour.json

    {
      version: {major: 1, minor: 0},
      tool: 'tourmanager',
      'title': 'Display name'
      rooms: [
        {
          identifier: 'unique id',
          title: 'Display name',
          playback: '360' || '360lr' || '360tb' || '2d' || 'lr' || 'rl' || '180' || '180lr' || '180tb',
          content: 'filename',
          points: [
            title: 'Display name',
            type: 'rot' || 'point',
            action: 'nav' || 'exit' || 'stop',
            to: 'room identifier', // when action == 'nav'
            recenter: true || false, // true to reset view
            yaw: FLOAT, // -180 - 180.  Left = -.  0 will default.
            pitch: FLOAT, // when type == 'rot'. -90 - 90. Up = +.  0 will default.
            depth: FLOAT, // when type == 'rot'. 1.5 - 10. 1.5 will default.
            size: FLOAT, // when type == 'rot'. 1.0 - 10.  1.0 will default.
            x: FLOAT, // when type == 'point'.
            y: FLOAT, // when type == 'point'.
            z: FLOAT, // when type == 'point'.
            xrot: FLOAT, // when type == 'point'.
            yrot: FLOAT, // when type == 'point'.
            zrot: FLOAT // when type == 'point'.
          ], ...
        }, ...
      ]
    }

