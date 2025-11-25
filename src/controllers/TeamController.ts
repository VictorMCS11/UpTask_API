import { Response, Request } from "express"
import User from "../models/User"
import Project from "../models/Project"

export class TeamMemberController {

    static getProjectTeam = async (req: Request, res: Response) =>{
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id name email'
        })
        return res.json(project.team)
    }

    static findMemberByEmail = async (req: Request, res: Response) =>{
        const { email } = req.body
        // Find user
        const user = await User.findOne({ email }).select('id name email') 
        if(!user){
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }

        return res.json(user)
    }

    static addMemberById = async (req: Request, res: Response) =>{
        const { id } = req.body
        const user = await User.findOne({ _id: id }).select('id') 
        if(!user){
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }
        if(req.project.team.some(team => team.toString() === user.id)){
            const error = new Error('El usuarion ya existe en el proyecto')
            return res.status(409).json({ error: error.message })
        }
        req.project.team.push(user.id)
        await req.project.save()

        return res.send('Usuario agregado correctamente')
    }

    static removeMemberById = async (req: Request, res: Response) =>{
        const { userId } = req.params
        console.log(userId)
        const user = await User.findOne({ _id: userId }).select('id') 
        if(!user){
            const error = new Error('El usuario que desea eliminar del proyecto no existe')
            return res.status(404).json({error: error.message})
        }
        if(!req.project.team.some(team => team.toString() === user.id)){
            const error = new Error('El usuarion no existe en el proyecto')
            return res.status(409).json({ error: error.message })
        }
       
        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId)

        await req.project.save()
        return res.send('Miembro del grupo eliminado correctamente')
    }
}