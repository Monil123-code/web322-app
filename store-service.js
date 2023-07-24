const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;

var sequelize = new Sequelize('zxxawtoy', 'zxxawtoy', 'dRAbLT8Puc4lbH_akO-IX9pH32nDUtiB', {
  host: 'ziggy.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});



const Item = sequelize.define("Item", {
body: Sequelize.TEXT,
title: Sequelize.STRING,
postDate: Sequelize.DATE,
featureImage: Sequelize.STRING,
published: Sequelize.BOOLEAN,
price: Sequelize.DOUBLE
});

const Category = sequelize.define("Category", {
category: Sequelize.STRING
});

Item.belongsTo(Category, {foreignKey: 'category'});
function initialize() {
return new Promise((resolve, reject) => {
  sequelize.sync()
    .then(() => {
      console.log("Database synced successfully.");
      resolve();
    })
    .catch((error) => {
      console.error("Error syncing the database:", error);
      reject('Unable to sync the database');
    });
});
}

function getAllItems(){
return new Promise((resolve, reject) => {
  Item.findAll()
    .then((Item) => {
        resolve(Item);
    })
    .catch((error) => {
      reject('no results returned');
    });
});
}
function getPublishedItems() {
return new Promise((resolve,reject)=>{
  Item.findAll({
    where: {
      published: true
    }
  })
    .then((Item) => {
        resolve(Item);
    })
    .catch((error) => {
      reject('no results returned');
    });
});
}

function getPublishedItemsByCategory(category){
return new Promise((resolve,reject)=>{
  Post.findAll({
    where: {
      published: true,
      category: category
    }
  })
    .then((Item) => {
        resolve(Item);
    })
    .catch((error) => {
      reject('no results returned');
    });
});
}

function getCategories() {
return new Promise((resolve, reject) => {
  Category.findAll()
  .then((categories) => {
      resolve(categories);
  })
  .catch((error) => {
    reject('no results returned');
  });
});
}
function addItem(itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = (itemData.published) ? true : false;

    for (const key in itemData) {
      if (itemData[key] === "") {
        itemData[key] = null;
      }
    }

    itemData.postDate = new Date();

    Item.create(itemData)
      .then(() => {
        resolve('Item added');
      })
      .catch((error) => {
        reject('Unable to create post');
      });
  });
}


function getItemsByCategory(category)
{  return new Promise((resolve, reject) => {
Item.findAll({
  where: {
    category: category
  }
})
  .then((items) => {
      resolve(items);
  })
  .catch((error) => {
    reject('no results returned');
  });
});
}


function getItemsByMinDate(minDateStr) {
return new Promise((resolve, reject) => {
  Item.findAll({
    where: {
      postDate: {
        [gte]: new Date(minDateStr)
      }
    }
  })
  .then((items) => {
      resolve(items);
  })
  .catch((error) => {
    reject('no results returned');
  });
});
}

function getItemsById(id) {
return new Promise((resolve, reject) => {
  Item.findAll({
    where: {
      id: id
    }
  })
    .then((items) => {
        resolve(items[0]);
    })
    .catch((error) => {
      reject('no results returned');
    });
});
}

function addCategory(categoryData) {
return new Promise((resolve, reject) => {
  for (const key in categoryData) {
    if (categoryData[key] === "") {
      categoryData[key] = null;
    }
  }
  Category.create(categoryData)
    .then(() => {
      resolve('Category added');
    })
    .catch((error) => {
      reject('Unable to create category');
    });
});
}

function deleteCategoryById(id) {
return new Promise((resolve, reject) => {
  Category.destroy({
    where: {
      id: id
    }
  })
    .then((categoryDeleted) => {
      if (categoryDeleted > 0) {
        resolve('Category deleted');
      } else {
        reject('Category not found');
      }
    })
    .catch((error) => {
      reject('Error deleting category');
    });
});
}



function deletePostById(id) {
  return new Promise((resolve, reject) => {
    Item.destroy({
        where: {
            id: id
        }
    }).then( data => {
        resolve(data);
    }).catch(() => {
        reject("unable to delete item");
    });
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
  getItemsById,
  getPublishedItemsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById
};