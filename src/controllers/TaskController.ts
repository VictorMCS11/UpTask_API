import type { Request, Response } from "express";
import Task from "../models/Task";
import Project from "../models/Project";

export class TaskController {

    static createTask = async (req: Request, res: Response) =>{
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([ task.save(), req.project.save() ])
            res.send('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project')
            // res.send('Tareas encontradas')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getTaskById = async (req: Request, res: Response) =>{
        try {
            const { taskId } = req.params
            const { projectId } = req.params
            const task = await Task.findById(taskId)
            if(!task){
                const error = new Error('Tarea no encontrada')
                res.status(404).json({ error: error.message })
            }
            if(task.project.toString() !== projectId){
                const error = new Error('Acción no válida')
                res.status(400).json({ error: error.message })
            }
            res.json(req.task)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateTask = async (req: Request, res: Response) =>{
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()
            res.send('Tarea actualizada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static deleteTask = async (req: Request, res: Response) =>{
        try {
            // if(req.task.project.toString() !== req.project.id){
            //     const error = new Error('Acción no válida')
            //     res.status(400).json({ error: error.message })
            // }
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString())

            await Promise.allSettled([ req.task.deleteOne(), req.project.save() ])

            res.send('Tarea eliminada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateStatus = async (req: Request, res: Response) =>{
        try {
            const { status } = req.body
            req.task.status = status
            await req.task.save()
            res.send('Tarea Actualizada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

}