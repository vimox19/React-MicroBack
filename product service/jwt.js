const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = 'secret';
    return jwt({
        secret,
        algorithms: ['HS256'],
        isRevoker: isRevoked
    }).unless({
        path: [
            { url: /\/(.*)/, method: ['GET', 'POST', 'OPTIONS'] }
        ]
    });
}

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true);
    }
    done();
}

function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: "The user is not authorized" });
    }

    if (err.name === 'ValidationError') {
        return res.status(401).json({ message: err });
    }

    return res.status(500).json(err);
}

module.exports = {
    authJwt,
    errorHandler
};