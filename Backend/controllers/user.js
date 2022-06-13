const bcrypt = require('bcrypt') // J'importe le package bcrypt permettant de hasher les mots de passe
const jwt = require('jsonwebtoken') // J'importe le package jwt

const User = require('../models/User'); // J'importe le model User

exports.signup = (req, res, next) => { // CREATION D'UN NOUVEAU USER
    bcrypt.hash(req.body.password, 10) // Je récupére Le mots de passe renseigné depuis le front-end qui sera hasher ('l'algorythme de hashage est executé 10 fois (salt)')
        .then(hash => { // je récupére le hash du mots de passe
            const user = new User({ // Je crée un nouvelle utilisateur à l'aide du schéma 
                email: req.body.email, // Je récupére l'e-mail dans le corp de la requête
                password: hash // J'enregistre comme mots de passe celui crypté avec hash afin de ne pas stocker le mots de passe en blanc.
            });
            user.save() // J'enregistre ensuite l'User crée avec la méthode save
                .then(() => res.status(201).json({ message: 'Utilisateur créé ! ' })) // Je renvoie un status 201 et un message positif
                .catch(error => res.status(400).json({ error })); // Je renvoie un status 400 ainsi que l'erreur
        })
        .catch(error => res.status(500).json({ error })); // Je renvoie une erreur
};

exports.login = (req, res, next) => { // CONNEXION D'UN UTILISATEUR
    User.findOne({ email: req.body.email }) /* Je récupére l'utilisateur correspondant à 
                                            l'e-mail renseigné dans le corp de la requête */
        .then(user => {
            if (!user) { // Si l'e-mail ne correspond à aucun utilisateur
                return res.status(401).json({ error: 'Utilisateur non trouvé !' }); // Je retourne une erreur 401 ainsi qu'un message d'erreur
            }
            bcrypt.compare(req.body.password, user.password) /* Si l'e-mail correspond à un utilisateur je compare le mots de passe envoyer dans la requête avec le hash 
                                                        déjà présent dans la base à l'aide de la fonction compare de bcrypt */
                .then(valid => {
                    if (!valid) { // Si la comparaison n'est pas bonne je renvoie une erreur ('mauvais mdp")
                        return res.status(401).json({ error: 'Mots de passe incorrect !' });
                    }
                    res.status(200).json({ // Si la comparaison est bonne je renvoie un status 200 et un objet json qui contiendra
                        userId: user._id, // Un userId contenant l'id de l'utilisateur
                        token: jwt.sign( // Et un token dans lequel j'appelle la fonction sign de jwt
                            { userId: user._id }, // Objet contenant le user._id
                            'RANDOM_TOKEN_SECRET', // Clé secrete d'encodage
                            { expiresIn: '24h' } // durée avant expiration du token
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error })); // Je renvoie un status 500 "erreur serveur" et renvoie une erreur
};