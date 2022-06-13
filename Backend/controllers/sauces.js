const Sauce = require('../models/Sauce');
const fs = require('fs');

// Create new sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce) // Renvoie un objet 
    delete sauceObject._id; // Supprime le _id généré par le front de la sauce
    const sauce = new Sauce({ // Crée une nouvelle sauce à partir du Schema
        ...sauceObject, // L'opérateur spread prend l'intégralité des éléments dans le corp de la requête
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, // Récupére l'image à afficher depuis le fichier images à l'aide de la requête.
        likes: 0, // Initialise le nombre de likes à 0
        dislikes: 0, // Initialise le nombre de dislikes à 0
        usersLiked: [], // Crée un array qui contiendra le nom des utilisateurs ayant like.
        usersDisliked: [] // Crée un array qui contiendra le nom des utilisateurs ayant dislike.
    });
    sauce.save() // Enregistre la sauce
        .then(() => res.status(201).json({ message: 'Objet enregistré !' })) // renvoie un status 201 puis un message.
        .catch(error => res.status(400).json({ error })) // renvoie un status 400 et l'erreur
};

// Modify sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? // Si req.file existe
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            
        } : { ...req.body }; // Je copie simplement req.body
        if (req.file) {  //
            Sauce.findOne({ _id: req.params.id }) // // Trouve un objet correspondant à l'id de la requête
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1]; // retourne un tableau de deux éléments le deuxième étant le nom du fichier.
                fs.unlink(`images/${filename}`, () => { // supprime le fichier à l'aide de la fonction unlink
                });
            })
            // message d'erreur si la récupération de la sauce n'a pu être faite
            .catch(error => res.status(500).json({ error }));
        }
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) // Mets à jour l'objet correspondant à l'id dans les parametre de la requête
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

// Delete sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // Trouve un objet correspondant à l'id de la requête
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1]; // retourne un tableau de deux éléments le deuxième étant le nom du fichier.
            fs.unlink(`images/${filename}`, () => { // supprime le fichier à l'aide de la fonction unlink
                Sauce.deleteOne({ _id: req.params.id }) // Supprime l'objet ayant correspondant à l'id
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' })) // Renvoie un status 200 et un message
                    .catch(error => res.status(400).json({ error })); // renvoie un status 400 et l'erreur
            });
        })
        .catch(error => res.status(500).json({ error })); // renvoie un status 500 et l'erreur
};

// Display one sauce
exports.displayOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // Trouve et retourne une sauce parmis toutes à l'aide d'un critère (ID)
        .then(sauce => res.status(200).json(sauce)) // Retourne un status 200 et message
        .catch(error => res.status(404).json({ error })); // Retourne un status 404 et l'erreur
};

// Display all sauce 
exports.displayAllSauce = (req, res, next) => {
    Sauce.find() // Retourne toutes les sauces sous forme d'objet
        .then(sauces => res.status(200).json(sauces)) // Retourne un status 200 
        .catch(error => res.status(400).json({ error })); // Retourne un status 400 et l'erreur
};

// Like, dislike, neutral
exports.sauceLike = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // Trouve et retourne une sauce parmis toutes à l'aide d'un critère (ID)
        .then(sauce => {
            // Si le userLiked est false et si like === 1 
            if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) { // Si le userId de la personne n'est pas présent dans usersLiked et que like = 1 j'execute : 
                // Mise à jours BDD
                Sauce.updateOne( // Je mets à jours
                    { _id: req.params.id }, // La sauce correspondant à l'id dans la requête
                    {
                        $inc: { likes: 1 }, // j'incrémente likes : 1
                        $push: { usersLiked: req.body.userId } // Je rajoute dans le tableau à l'aide de push le userId de la requête dans usersLiked
                    }
                )
                    .then(() => res.status(201).json({ message: "Sauce like +1" })) // Je renvoie un status 201 et un message
                    .catch(error => res.status(400).json({ error })); // Je renvoie un status 400 et l'erreur
            }
            // like 0 = retire like (neutre)
            if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) { // Si le userId de la personne est déjà présent dans usersLiked et que like = 0 j'execute : 
                // Mise à jours BDD
                Sauce.updateOne( // Je mets à jours
                    { _id: req.params.id }, // La sauce correspondant à l'id dans la requête
                    {
                        $inc: { likes: -1 }, // j'incrémente likes : -1
                        $pull: { usersLiked: req.body.userId } // Je supprime à l'aide de pull le userId dans la requête déjà présent dans usersLiked
                    }
                )
                    .then(() => res.status(201).json({ message: "Sauce like 0" })) // Je renvoie un status 201 et un message
                    .catch(error => res.status(400).json({ error })); // Je renvoie un status 400 et l'erreur
            }
            // like -1 = dislike
            if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) { // Si le userId de la personne n'est pas présent dans usersDisliked et que like = -1 j'execute : 
                // Mise à jours BDD
                Sauce.updateOne( // Je mets à jours
                    { _id: req.params.id }, // La sauce correspondant à l'id dans la requête
                    {
                        $inc: { dislikes: 1 }, // j'incrémente disliked : 1
                        $push: { usersDisliked: req.body.userId } // Je rajoute dans le tableau à l'aide de push le userId de la requête dans usersDisliked
                    }
                )
                    .then(() => res.status(201).json({ message: "Sauce dislike +1" })) // Je renvoie un status 201 et un message
                    .catch(error => res.status(400).json({ error })); // Je renvoie un status 400 et l'erreur
            }
            // like 0 = retire dislike (neutre)
            if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) { // Si le userId de la personne est déjà présent dans usersDisliked et que like = 0 j'execute : 
                // Mise à jours BDD
                Sauce.updateOne( // Je mets à jours
                    { _id: req.params.id }, // La sauce correspondant à l'id dans la requête
                    {
                        $inc: { dislikes: -1 }, // j'incrémente dislikes : -1
                        $pull: { usersDisliked: req.body.userId } // Je supprime à l'aide de pull le userId dans la requête déjà présent dans usersDisliked
                    }
                )
                    .then(() => res.status(201).json({ message: "Sauce dislike 0" })) // Je renvoie un status 201 et un message
                    .catch(error => res.status(400).json({ error })); // Je renvoie un status 400 et l'erreur
            }
        })
        .catch(error => res.status(404).json({ error })); // Je renvoie un status 404 et l'erreur
}