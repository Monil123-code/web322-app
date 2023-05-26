let items = [];
let categories = [];

const fs = require("fs"); 


  function initialize() {
    return new Promise((resolve, reject) => {
      fs.readFile('./data/items.json', 'utf8', (err, itemsData) => {
        if (err) {
          reject('Unable to read items file');
          
        }
  
        try {
       
          items = JSON.parse(itemsData);
          fs.readFile('./data/categories.json', 'utf8', (err, categoriesData) => {
            if (err) {
              reject('Unable to read categories file');
              return;
            }
  
            try {
              categories = JSON.parse(categoriesData)
              resolve();
            } catch (error) {
              reject('Error parsing categories file');
            }
          });
        } catch (error) {
          reject('Error parsing items file');
        }
      });
    });
  }

  function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      reject('No results returned');
    } else {
      resolve(items);
    }
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published === true);
    if (publishedItems.length === 0) {
      reject('No results returned');
    } else {
      resolve(publishedItems);
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject('No results returned');
    } else {
      resolve(categories);
    }
  });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
  };