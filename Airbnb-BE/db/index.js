const mongoose = require('mongoose');
mongoose
  .connect('mongodb+srv://tkashi328:vbVPyXitWJkkDIp5@cluster0.ruvuygi.mongodb.net/airbnb')
  .then(() => {
    console.log(`Connected To Online Db Successfully...... `);
  })
  .catch((err) => {
    console.log(err);
    console.log(`Connection failed`);
  });
