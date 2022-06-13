const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const path = require('path'); // Module utilisé pour travailler avec des fichiers et chemin d'accés 
const sauceRoutes = require('./routes/sauces'); // J'importe le router sauces
const userRoutes = require('./routes/user') // J'importe le router User
const helmet = require("helmet");// pour enforceé la securité 

require('dotenv').config();
mongoose.connect(process.env.DATABASE_MONGO,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();
app.use(bodyParser.json());
app.use(express.json());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});


app.use(helmet({crossOriginResourcePolicy: false}));// pour bien montrer les images

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes); 



module.exports = app;