# Third Space Backend

## Context

### Summary
Third Space is trying to make the world less lonely by making personal
development more of a shared and relatable experience with others. To 
make experiences more relatable, Third Space is an app that seeks to virtualize 
communal spaces to promote healthier social interactions. 

### Problem
There is a documented increase in loneliness affecting people of all ages and
socioeconomic backgrounds. This epidemic of loneliness is caused in part by a 
lack of public places where social equals can interact to have a good time, 
exchange ideas and build meaningful relationships. Those seeking these places 
can find the process difficult, if not awkward as well.

### Solution
Third Space aims to ease loneliness by creating a safe space for people to mingle, 
and by providing a reason to interact with one another. By using long term personal 
development as the medium for users to interact with one another, users have a basis
to initiate casual conversation and opportunity for genuine connection given shared 
long term goals. Consequently, posts are always grouped into user-defined collections.
These collections become the primary means to discover one another or create an
influence on their local communities (geographically near users).

## The Tech 

The backend is built in Express.js and connects to a MongoDB instance for user data storage. 
Media is uploaded to an AWS S3 instance.


## Dev Notes

To switch between local and dev, add anything to the second field after "nodemon server.js"
