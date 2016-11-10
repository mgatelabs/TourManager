# TourManager
A embedded webapp for editing *.tour files for Mobile VR Station

This is very basic at the moment, it only supports loading in the *.tour folders and viewing it's information, rooms and points.

#Current Goals
- Edit/Delete/Copy/Archive/Package tour
- Generate preview images

#Features
- Create/List/Edit(View Only) tour
- Add Room/Point
- WebGl Point Preview
- Validate on client/server side
- Save changes back to local file system

#Concerns
- Don't allow this app onto the internet, it's built for localhost development and currently doesn't have any security

#Running
- I used Intellij community edition, so that should work for you also.  Just import the POM project.
- You will want to use the Runner class to start the application.  Just specify a work folder, thats outside the project.  On startup, it will construct the neccessary folders for data storage in your working folder.
- You can open you browser to http://localhost:8080 and use the web app.  Don't use EDGE, it can't read from the localhost.

# Licensing
- The files in and under /src/main/resources/static/images are exclusive to TourManager.  They are not public domain, but if you fork the project, you can continue to use them as they were intended.


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
          id: 'unique id',
          title: 'Display name',
          playback: '360' || 'cube',
          content: 'filename', // Name nust be [a-z0-9_-]+\.(jpg|png|sbs)
          world: {
            yaw: FLOAT, // -180 - 180.  Left = -.  0 will default.
          },
          points: [
            {
                title: 'Display name',
                type: 'rot' || 'point' || 'action',
                action: 'nav' || 'exit' || 'stop',
                to: 'room id', // when action == 'nav'
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
            }, ...
          ]
        }, ...
      ]
    }

### World Attributes
- version: Object, used to validate before attempting to read
- tool: The application used to make the tour
- title: Name of tour, not shown
- rooms: Array of Room.  First item is starting room

### Room Attributes

- id: The 'unique id' used by points to jump around
- title: The room's name,
- playback: How the content is formatted.  Either '360' || 'cube'.
- content: The background filename.  Name must have format [a-z0-9_-]+\.(jpg|png|sbs)
- world: Object used to adjust the backgrounds rotation

### Point Attributes

- title: Text to display,
- type: What kind of point. 'rot' = rotational based. 'point' = point in space. 'action' = non visible action
- flow: What to do after this point finishes it's action.  Next = go to next point.  Stop, repeat = Loop again (for videos)
- action: 'nav' || 'exit' || 'stop' || 'play' || 'noop'
- content: A file to show when play action is specified. Must have format [a-z0-9_-]+\.(jpg|png|sbs|mpg|mp4|mov)
- to: 'room id', // when action == 'nav'
- recenter: 'true' || 'false' || 'apply',

- yaw: FLOAT, // -180 - 180.  Left = -.  0 will default.
- pitch: FLOAT, // when type == 'rot'. -90 - 90. Up = +.  0 will default.
- depth: FLOAT, // when type == 'rot'. 1.5 - 10. 1.5 will default.
- size: FLOAT, // when type == 'rot'. 1.0 - 10.  1.0 will default.

- x: FLOAT, // when type == 'point'.
- y: FLOAT, // when type == 'point'.
- z: FLOAT, // when type == 'point'.
- xrot: FLOAT, // when type == 'point'.
- yrot: FLOAT, // when type == 'point'.
- zrot: FLOAT // when type == 'point'.
