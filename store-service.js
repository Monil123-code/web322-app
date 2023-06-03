let itemsArr = [];
let categoriesArr = [];

const fs = require("fs"); 


  function initialize() {
    return new Promise((resolve, reject) => {
      fs.readFile('./data/items.json', 'utf8', (err, itemsData) => {
        if (err) {
          reject('Unable to read items file');
          
        }
  
        try {
       
          itemsArr = JSON.parse(itemsData);
          fs.readFile('./data/categories.json', 'utf8', (err, categoriesData) => {
            if (err) {
              reject('Unable to read categories');
              return;
            }
  
            try {
              categoriesArr = JSON.parse(categoriesData)
              resolve();
            } catch (error) {
              reject('Error parsing categories');
            }
          });
        } catch (error) {
          reject('Error parsing items');
        }
      });
    });
  }

  function getAllItems() {
  return new Promise((resolve, reject) => {
    if (itemsArr.length === 0) {
      reject('No items returned');
    } else {
      resolve(itemsArr);
    }
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = itemsArr.filter(item => itemsArr.published === true);
    if (publishedItems.length === 0) {
      reject('No publishedItem returned');
    } else {
      resolve(publishedItems);
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categoriesArr.length === 0) {
      reject('No Categories returned');
    } else {
      resolve(categoriesArr);
    }
  });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
  };