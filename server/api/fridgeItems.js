const router = require('express').Router();
const { User, FridgeItems, Fridge } = require('../db/models/');
const axios = require('axios');
const { nutrix, nutrixApp } = require('../../secrets');
const { socket } = require('../');

module.exports = router;

router.get('/', (req, res, next) => {
  User.findById(req.session.passport.user)
    .then(user => user.getFridgeItems())
    .then((items) => {
      socket.emit('get_fridge', items);
      res.json(items);
    })
    .catch(next);
});

router.post('/', (req, res, next) => {
  const foodItem = req.body.food;
  const { fromBrowser } = req.body;
  let foodAmount;
  let itemToReturn;
  axios.post('https://trackapi.nutritionix.com/v2/natural/nutrients', { query: foodItem }, {
    headers: {
      'x-app-id': nutrixApp,
      'x-app-key': nutrix,
    },
  })
    .then((response) => {
      foodAmount = response.data.foods[0].serving_weight_grams;
      return response.data.foods;
    })
    .then(foodData => FridgeItems.findOrCreate({
      where: {
        name: foodData[0].food_name,
        image: foodData[0].photo.highres, // findOrCreate gives an Array
      },
    }))
    .then(([createdItem, wasCreated]) => { // why is this an array
      itemToReturn = createdItem;
      if (wasCreated) {
        Fridge.create({
          fridgeItemId: createdItem.id,
          userId: req.session.passport.user,
          quantity: foodAmount,
        });
      } else {
        return Fridge.update({
          quantity: foodAmount,
        }, {
          where: {
            fridgeItemId: createdItem.id,
            userId: req.session.passport.user,
          },
        });
      }
    })
    .then(() => {
      if (!fromBrowser) socket.emit('post_to_fridge', itemToReturn);
      res.json(itemToReturn);
    })
    .catch(next);
});

router.delete('/:itemId', (req, res, next) => {
  const itemId = Number(req.params.itemId);
  User.findById(req.session.passport.user)
    .then(user => Fridge.destroy({
      where: {
        userId: user.id,
        fridgeItemId: itemId,
      },
    }))
    .then(() => {
      socket.emit('delete_food_item', itemId);
      res.json(`Item with ${itemId} was deleted.`);
    })
    .catch(next);
});

router.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('There was an Express error.')
})

