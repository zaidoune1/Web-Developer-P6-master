const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');  // J'importe le package m-u-v

const userSchema = mongoose.Schema({ // Schema d'un compte utilisateur
    email: { type: String, required: true, unique: true }, // L'email est une chaine de caractères qui est requise et doit être unique
    password: { type: String, required: true } // le mots de passe est une chaine de caractères qui est requise
});

userSchema.plugin(uniqueValidator); // Plugin permettant d'ajouter une sécurité au fait que l'email soit unique pour chaque utilisateurs

module.exports = mongoose.model('User', userSchema); // J'exporte le model Userschema