/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Monilkuamr Patel Student ID: 156199218 Date: 30/06/2023
*
*  Cyclic Web App URL: https://plum-spotless-cygnet.cyclic.app/
*
*  GitHub Repository URL: https://github.com/Monil123-code/web322-app.git
*
********************************************************************************/ 
const storeService = require('./store-service');
const express = require("express");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require("express-handlebars");

var app = express();
var HTTP_PORT = process.env.PORT || 8080;

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.use(express.static('public')); 


app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: { 
    navLink: function(url, options) {
      const isActive = (url === app.locals.activeRoute);
      const activeClass = isActive ? 'active' : '';
      return `<li class="nav-item"><a class="nav-link ${activeClass}" href="${url}">${options.fn(this)}</a></li>`;
    },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    }    
  }
}));

cloudinary.config({
  cloud_name: 'dluqvusch',
  api_key: '889568762511658',
  api_secret: 'oJK5eNHOmETcUW6J-NQiSZYKTMY',
  secure: true
});

const upload = multer();

app.get("/", (req, res) => {
  res.redirect('/shop')
});

app.get('/about', (req, res) => {
    res.render('about', {
    });
  });
  
  app.get("/shop", async (req, res) => {
    let viewData = {};
  
    try {
      let items = [];
  
      if (req.query.category) {
        items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
        items = await storeService.getPublishedItems();
      }
  
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
  
      viewData.items = items;
      viewData.post = items[0]; 
  
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      let categories = await storeService.getCategories();
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    res.render("shop", { data: viewData });
  });
  

  
  app.get('/shop/:id', async (req, res) => {
    let viewData = {};
  
    try {
      let items = [];
  
      if (req.query.category) {
        items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
        items = await storeService.getPublishedItems();
      }
  
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
  
      viewData.items = items;
  
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      viewData.item = await storeService.getItemById(req.params.id);
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      let categories = await storeService.getCategories();
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    res.render("shop", { data: viewData });
  });

 
app.get('/items', (req,res)=>
{

    let queryPromise = null;

   
    if(req.query.category){
       
        queryPromise = storeService.getItemsByCategory(req.query.category);
    }else if(req.query.minDate){
       
        queryPromise = storeService.getItemsByMinDate(req.query.minDate);
    }else{
      
        queryPromise = storeService.getAllItems()
    } 

    queryPromise.then(data=>{
        res.render("items",{ data : data })
    }).catch(err=>{
        res.render("items", {message: "no results"});
    })
});
  
  app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then(data => {
        res.render("categories",{data : data});
      })
      .catch(error => {
        res.render("categories",{ message: 'getCategories failed' });
      });
  });
  
  app.get('/items/add', (req, res) => {
    res.render('addItem');
  });


  app.get('/items/:value',(req, res) =>{
id = req.params.value;
    storeService.getItemsById(id)
    .then(data => {
      res.render('items', {data : data});
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
    .catch((err) => {
      res.status(500).json({ message: 'addItem failed' });
    });
  } 
  
  });
  
  
  app.get('*', (req, res) => {
    res.render('404');
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
