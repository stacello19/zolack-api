const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    res.send({
      code: 200,
      message: 'Zolack api is alive!'
    })
  } catch(err) {
    next(err);
  }
});

module.exports = router;