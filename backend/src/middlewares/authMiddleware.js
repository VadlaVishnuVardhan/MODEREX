const { errorResponse } = require("../utils/utils");
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        const {token} = req.cookies;
        if(!token){
            return errorResponse(res, 403, 'Forbidden Access!!');
        }
        const secret = process.env.JWT_SECRET || 'dev_insecure_secret_change_me';
        jwt.verify(token, secret, (error, decoded) => {
            if(error){
                return errorResponse(res, 403,'Invalid token')
            }
            req.user = decoded;
            next();
        })
        
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

module.exports = {
    authMiddleware,
}