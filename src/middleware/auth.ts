import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import User, { IUser } from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export async function authenticate (req: Request, res: Response, next: NextFunction){

    const bearer = req.headers.authorization

    if(!bearer){
        const error = new Error('No Autorizado')
        return res.status(401).json({error: error.message})
    }

    //Quitamos el "Bearer" del inicio del string de authorization
     const token = bearer.split(' ')[1]
    // const [, token] = bearer.split(' ')
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(typeof decoded === 'object' && decoded.id){
            const user = await User.findById(decoded.id).select('id name email')
            if(user){
                req.user = user
                return next()
            }else{
                return res.status(500).json({error: 'Token no válido'})
            }
        }
    } catch (error) {
        return res.status(500).json({error: 'Token no válido'})
    }

    return next()
}