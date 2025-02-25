const jwt = require("jsonwebtoken");

const checktoken = (req, res, next) =>{
    try {
        //đọc token từ headerss
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            throw new Error('Token không hợp lệ')
        }else{
            //giải mã token
            //sai token, sai key, het han token
            jwt.verify(token, 'kchi',(error, decode)=>{
                if (error) {
                    throw new Error('Token không hợp lệ')
                }else{
                    //luu lại thông tin giải mã 
                    req.user = decode
                    next()
                }
            })
        }
    } catch (error) {
        
    }
}

module.exports = checktoken