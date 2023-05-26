/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Monilkuamr Patel Student ID: 156199218 Date: 26/05/2023
*
*  Cyclic Web App URL: https://plum-spotless-cygnet.cyclic.app/
*
*  GitHub Repository URL: https://github.com/Monil123-code/web322-app.git
*
********************************************************************************/ 
const storeService = require('./store-service');
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
app.use(express.static('public')); 

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.redirect('/about')
});

// Return the about.html file
app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/views/about.html');
  });

  app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  });
  
  app.get('/items', (req, res) => {
    storeService.getAllItems()
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  });
  
  app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(500).json({ message: error });
      });
  });
  
  // Add the following route at the end to handle unmatched routes
  app.get('*', (req, res) => {
    res.status(404).json({ message: 'Page Not Found' });
  });
  
  
// Initialize the data before starting the server
storeService.initialize()
.then(() => {
  // Start the server
  app.listen(HTTP_PORT, () => {
    console.log('Server is running on port 8080');
  });
})
  .catch(error => {
    // Output the error to the console
    console.error('Failed to initialize data:');
  });
