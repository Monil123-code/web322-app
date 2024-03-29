/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
*
*  Name: Monilkuamr Patel Student ID: 156199218 Date: 11/08/2023
*
*  Cyclic Web App URL: https://plum-spotless-cygnet.cyclic.app/
*
*  GitHub Repository URL: https://github.com/Monil123-code/web322-app.git
*
********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const authData = require('./auth-service');
const storeService = require('./store-service');
const clientSessions = require("client-sessions");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require("express-handlebars");
var app = express();

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


app.use(clientSessions({
  cookieName: "session", 
  secret: "week10example_web322",
  duration: 2 * 60 * 1000, 
  activeDuration: 1000 * 60 
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    navLink: function (url, options) {
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
    },
    formatDate: function (dateObj) {
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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

app.get('/login', (req, res) =>{
  res.render('login',{

  });
});

app.get('/register', (req, res) =>{
  res.render('register',{

  });
});

app.post('/register', async (req, res) => {
  const userData = req.body; 

  try {
    await authData.registerUser(userData); 
    res.render('register', { successMessage: 'User created' });
  } catch (err) {
    res.render('register', { errorMessage: err.message, userName: userData.userName });
  }
});

app.post('/login', async (req, res) => {
  req.body.userAgent = req.get('User-Agent');

  try {
    const user = await authData.checkUser(req.body);
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    };
    
    res.redirect('/items');
  } catch (err) {
    res.render('login', { errorMessage: err.message, userName: req.body.userName });
  }
});

app.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect("/");
});

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory'); 
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


app.get('/items',ensureLogin, (req, res) => {

  let queryPromise = null;


  if (req.query.category) {

    queryPromise = storeService.getItemsByCategory(req.query.category);
  } else if (req.query.minDate) {

    queryPromise = storeService.getItemsByMinDate(req.query.minDate);
  } else {

    queryPromise = storeService.getAllItems()
  }

  queryPromise.then(data => {
    if (data.length > 0) {
      res.render('items', { data: data });
    }
    else {
      res.render('items', { message: 'No results' });
    }
  }).catch(err => {
    res.render("items", { message: "no results" });
  })
});

app.get('/categories',ensureLogin, (req, res) => {
  storeService.getCategories()
    .then(data => {
      if (data.length > 0) {
        res.render('categories', { data: data });
      }
      else {
        res.render('categories', { message: 'No results' });
      }
    })
    .catch(error => {
      res.render("categories", { message: 'getCategories failed' });
    });
});

app.get('/items/add',ensureLogin, function (req, res) {
  storeService.getCategories()
    .then((categories) => {
      res.render("addItem", { category: categories});
    })
    .catch((err) => {
      res.render("addItem", { item: [] });
    });
});

app.get('/items/:value',ensureLogin, (req, res) => {
  id = req.params.value;
  storeService.getItemsById(id)
    .then(data => {
      res.render('items', { data: data });
    });
});


app.post('/items/add',ensureLogin, upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      try {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      } catch (error) {
        res.status(500).send('async failed');
      }
    }

    upload(req)
      .then((uploaded) => {
        processItem(req, res, uploaded.url);
      })
      .catch((error) => {
        res.status(500).send('upload failed');
      });
  } else {
    processItem(req, res, "");
  }


function processItem(req, res, imageUrl) {
  req.body.featureImage = imageUrl;

  const newItem = req.body;

  storeService
    .addItem(newItem)
    .then(() => {
      res.redirect('/items');
    })
    .catch((err) => {
      res.status(500).send('processItem failed');
    });
}
});
app.get('/categories/add',ensureLogin, (req, res) => {
  res.render('addCategory');
});

app.post('/categories/add',ensureLogin, (req, res) => {
  const categoryData = {
    category: req.body.category
  };

  storeService.addCategory(categoryData)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      res.render('addCategory', { message: 'Error adding category' });
    });
});

app.get('/categories/delete/:id',ensureLogin, (req, res) => {
  const categoryId = req.params.id;

  storeService.deleteCategoryById(categoryId)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      res.status(500).send('Unable to Remove Category / Category not found');
    });
});


app.get('/items/delete/:id',ensureLogin, function (req, res) {
  const postId = req.params.id;
console.log("im here");
  storeService.deletePostById(postId)
    .then(() => {
      res.redirect('/items');
    })
    .catch((err) => {
      res.status(500).send('Unable to Remove Post / Post not found');
    });
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}
app.get('*', (req, res) => {
  res.render('404');
});


storeService.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

