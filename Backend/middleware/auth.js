const jwt = require('jsonwebtoken'); // J'importe le package jwt

module.exports = (req, res, next) => { // J'exporte ce middleware
    try {
        const token = req.headers.authorization.split(' ')[1]; // Je récupére le token (deuxième élément du tableau)
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // J'utilise la foction verify et le "code secret" afin de décodé le token
        const userId = decodedToken.userId; // Je récupére le userId contenu dans le token décodé.
        req.auth = { userId }; // J'ajoute à l'objet requête l'objet auth qui contient le userId
        if (req.body.userId && req.body.userId !== userId) { // Si un userId est bien présent dans le corp de la requête et que celui-ci est différent du userId
            throw 'User ID non valable !'; // Je retourne une erreur 
        } else { // Sinon
            next(); // je passe la requête au prochain middleware
        }
    } catch (error) { // Je renvoie une erreur status 401.
        res.status(401).json({ error: error | 'Requête non authentifiée ! ' })
    }
};