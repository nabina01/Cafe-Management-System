//JSON utils
import  jwt from 'jsonwebtoken' ;

//generate token

const generateToken =(user) =>{
    const token = jwt.sign({id:user.id},process.env.JWT_SECRET,{
        expiresIn:'100h'
    });
    return token;

}

//verify token
const verifyToken = (token)=>{
    try{
        console.log("Token",token);
        const decoded =jwt.verify(token,process.env.JWT_SECRET);
        return decoded;
    }catch(error){
        return null;
    }
};
export {generateToken, verifyToken};

