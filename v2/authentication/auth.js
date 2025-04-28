const jwt = require('jsonwebtoken');

function authToken(req,res,next) {
    const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];
    
    if(!token) 
    {
        return res.status(401).json({message:"Access Denied!"});
    }
    jwt.verify(token,process.env.JWT_SECRET,(error,user) => {
        if(error) 
        {
            return res.status(403).json({message:"Invalid Token"});
        }
        req.user = user;
        next();
        
    });
}

module.exports = authToken;