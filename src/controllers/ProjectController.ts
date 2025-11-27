import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {

    static createProject = async (req: Request, res: Response) =>{
        try {
            const project = new Project(req.body)

            // Asignar el manager o administrador del proyecto
            project.manager = req.user.id

            await project.save()
            return res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error)
        }
    }

    static getAllProjects = async (req: Request, res: Response) =>{
        try {
            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user._id } }, // Array con el ID
                    { team: { $in: req.user._id } }
                ]
            })
            return res.json(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static getProjectById = async (req: Request, res: Response) =>{
        const { id } = req.params
        try {
            const project = await Project.findById(id)
                .populate({
                    path: 'tasks',
                    populate: [
                        // Populate para completedBy.user
                        {
                            path: 'completedBy.user', 
                            model: 'User'
                        },
                        // Populate para notes y dentro de notes el createdBy
                        {
                            path: 'notes',
                            model: 'Note',
                            populate: {
                                path: 'createdBy',
                                model: 'User'
                            }
                        }
                    ]
                });

            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }
            if(project.manager.toString() !== req.user.id && !project.team.includes(req.user.id)){
                const error = new Error('Acción no válida')
                return res.status(404).json({error: error.message})
            }
            return res.json(project)
        } catch (error) {
            console.log(error)
        }
    }

    static updateProjectById = async (req: Request, res: Response) =>{
        // const { id } = req.params
        try {
            req.project.clientName = req.body.clientName
            req.project.projectName = req.body.projectName
            req.project.description = req.body.description
            
            await req.project.save()
            return res.send('Proyecto Actualizado')
        } catch (error) {
            console.log(error)
        }
    }

    static deleteProjectById = async (req: Request, res: Response) =>{
        try {
            await req.project.deleteOne()
            return res.send('Proyecto Eliminado')
        } catch (error) {
            console.log(error)
        }
    }

}