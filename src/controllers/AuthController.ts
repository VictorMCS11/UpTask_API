import { Request, Response } from "express"
import bcrypt from 'bcrypt'
import User from "../models/User"
import { hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { transporter } from "../config/nodemailer"
import { AuthEmail } from "../emails/AuthEmail"
import { checkPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"

export class AuthController {
    static createAccount = async (req: Request, res:Response) => {
        try {
            const { password, email } = req.body

            // Prevenir duplicados
            const userExists = await User.findOne({email})
            if(userExists){
                const error = new Error('El Usuario ya está registrado')
                return res.status(409).json({error: error.message})
            }

            // Crea un usuario
            const user = new User(req.body)

            //Hash Password
            user.password = await hashPassword(password)

            // Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            return res.send('Revisa tu email para confirmar la cuenta')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }
            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            return res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }
            if(!user.confirmed){
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                //Enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada. Te hemos enviado un e-mail de confirmación') 
                return res.status(401).json({error: error.message})
            }
            // Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect){
                const error = new Error('La contraseña es incorrecta')
                return res.status(500).json({error: error.message})
            }

            const token = generateJWT({ id: user._id.toString() })

            return res.send(token)
        } catch (error) {
            return res.status(500).json({error: error.message})
        }
    }

    static requestConfirmationCode = async (req: Request, res:Response) => {
        try {
            const { email } = req.body

            // Buscar el usuario
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('El Usuario no está registrado')
                return res.status(404).json({error: error.message})
            }

            if(user.confirmed){
                const error = new Error('El Usuario ya está confirmado')
                return res.status(409).json({error: error.message})
            }

            // Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            return res.send('Se envió un nuevo código de confirmació a tu email')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword = async (req: Request, res:Response) => {
        try {
            const { email } = req.body

            // Buscar el usuario
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('El Usuario no está registrado')
                return res.status(404).json({error: error.message})
            }

            // Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            //Enviar email
            AuthEmail.sendPasswordResendToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            return res.send('Revisa tu email para adquirir instrucciones')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req: Request, res: Response) =>{
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }
            res.send('Token válido. Define tu nueva contraseña')
        } catch (error) {
            return res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            return res.send('La contraseña de ha actualizado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static user = async (req: Request, res: Response) =>{
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) =>{
        const { name, email } = req.body

        // Verificamos que el email del usuario del usuario 
        const userExists = await User.findOne({email})
        if(userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya está registrado')
            return res.status(409).json({error: error.message})
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil actuializado correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('El password actual es incorrecto')
            return res.status(401).json({error: error.message})
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            return res.send('La contraseña se modificó correctamente')
        } catch (error) {
            return res.status(500).send('Hubo un error')
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)
        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('El password actual es incorrecto')
            return res.status(401).json({error: error.message})
        }

        return res.send('La contraseña es correcta')
    }

}