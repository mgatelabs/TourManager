# TourManager
A embedded webapp for editing *.tour files for Mobile VR Station

This is very basic at the moment, it only supports loading in the *.tour folders and viewing it's information, rooms and points.

#Current Goals
- Create/Delete/Copy/Archive/Package tour
- Add Room/Point
- Generate preview images
- WebGl Point Preview
- Validate on client/server side
- Save changes back to local file system

#Concerns
- Don't allow this app onto the internet, it's built for localhost development and currently doesn't have any security

#Running
- I used Intellij community edition, so that should work for you also.  Just import the POM project.
- You will want to use the Runner class to start the application.  Just specify a work folder, thats outside the project.  On startup, it will construct the neccessary folders for data storage in your working folder.
- You can open you browser to http://localhost:8080 and use the web app.  Don't use EDGE, it can't read from the localhost.
