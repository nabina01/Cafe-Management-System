//authentication middleware

import { verifyToken } from '../Utils/json.js';
import prisma from "../utils/prisma-clients.js"

const auth = async(request,response,next) =>{
    console.log("inside middleware");
   
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        return response.status(401).json({message:"Unauthorized"});

    }
    try{
        const payload = await verifyToken(token);
        const user = await prisma.user.findUnique({
            where:{
                id:payload.id
            }
        });
        // console.log("Authenticated User:",user);
        if(!user){
             return response.status(401).json({message:"Unauthorized"});
        }
        //deleting password data from output
        delete user.password;

        console.log("Authenticated User:",user);
        request.user = user;
        //fetch  user from database with given payload ID
        next();

    }catch(error){
        console.log(error);
        return response.status(401).json({message:"Unauthorized"});
    }
};


export {auth};


