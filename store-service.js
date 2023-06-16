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
  return new Promise((resolve,reject)=>{
   if(itemsArr.length > 0) 
   {
     resolve(itemsArr.filter(itemsArr => itemsArr.published))
     }
   else
   { reject("Item not found!");
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

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    if (itemData.published == undefined){
 itemData.published = false;
}
 else
 {
  itemData.published = true;
 }
 itemData.id = itemsArr.length + 1;
 itemsArr.push(itemData);
 resolve(itemData);
});

}

function getItemsByCategory(category)
{  return new Promise((resolve, reject) => {
  const itemsByCategory = items.filter(item => item.category === category);
  
  if (itemsByCategory.length > 0) 
  {
    resolve(itemsByCategory);
  } 
  else 
  {
    reject("Item not found!");
  }
});
}

function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const itemsByMinDate = itemsArr.filter(itemsArr => new Date(itemsArr.postDate) >= new Date(minDateStr));
if (itemsByMinDate > 0)
{
  resolve(itemsByMinDate);
}
else
{
  reject("Item not found!")
}
  });
}

function getItemsById(id) {
  return new Promise((resolve, reject) => {
    const itemsById = itemsArr.filter(itemsArr => itemsArr.id == id);
if (itemsById > 0)
{
  resolve(itemsById);
}
else{
  reject("Item not found!");
}
  });
}



module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemsById
  };