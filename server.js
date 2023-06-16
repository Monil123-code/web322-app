/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Monilkuamr Patel Student ID: 156199218 Date: 16/06/2023
*
*  Cyclic Web App URL: https://plum-spotless-cygnet.cyclic.app/
*
*  GitHub Repository URL: https://github.com/Monil123-code/web322-app.git
*
********************************************************************************/ 
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
app.use(express.static('public')); 

cloudinary.config({
  cloud_name: 'dluqvusch',
  api_key: '889568762511658',
  api_secret: 'oJK5eNHOmETcUW6J-NQiSZYKTMY',
  secure: true
});

const upload = multer();


app.get("/", (req, res) => {
    res.redirect('/about')
});


app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/views/about.html');
  });

  app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(500).json({ message: 'getPublishedItem failed' });
      });
  });
  
  app.get('/items', (req, res) => {
    storeService.getAllItems()
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(500).json({ message: 'getAllItems failed' });
      });
  });
  
  app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        res.status(500).json({ message: 'getCategories failed' });
      });
  });
  
  app.get('/items/add', (req, res) => {
    res.sendFile(__dirname + '/views/addItem.html');
  });

  app.get('/items?category=value', (req, res) =>{
    category = value;
    storeService.getItemsByCategory(category)
    .then(data => {
      res.json(data);
    }) 
    .catch(error => {
      res.status(500).json({ message: 'getItemsByCategory failed' });
    });
  });

  app.get('/items?minDate=value', (req, res) =>{
    minDateStr = value;
    storeService.getItemsByMinDate(minDateStr)
    .then(data => {
      res.json(data);
    }) 
    .catch(error => {
      res.status(500).json({ message: 'getItemsByMinDate failed' });
    });
  });

  app.get('/items/value',(req, res) =>{
id = value;
    storeService.getItemsById(id)
    .then(data => {
      res.json(data);
    });  
  });


  app.post('/items/add', upload.single("featureImage"), (req, res) => {
    if(req.file){
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );
  
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };
  
      async function upload(req) {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      }
  
      upload(req).then((uploaded)=>{
          processItem(uploaded.url);
      });
  }
  else
  {
      processItem("");
  }
   
  function processItem(imageUrl){
      req.body.featureImage = imageUrl;
  
      
    const newItem = req.body;

    storeService.addItem(newItem)
    .then(data => {
      res.redirect('/items');
    })
  } 
  
  });
  
  
  app.get('*', (req, res) => {
    res.status(404).json({ message: 'Page Not Found' });
  });

  

storeService.initialize()
.then(() => {
 
  app.listen(HTTP_PORT, () => {
    console.log('Server is running on port '  + HTTP_PORT);
  });
})
  .catch(error => {
    
    console.error('Failed to initialize data');
  });
