const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://event-backend-deploy:mongodb123@cluster0.mongodb.net/Cluster0?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
