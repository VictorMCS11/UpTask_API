import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import { TaskType } from "./Task";
import { IUser } from "./User";

// Typescript
export type ProjectType = Document & {
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<TaskType & Document>[]
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
}

// Mongoose
const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true, // Quita espacios en blanco al principal y al final
    },
    clientName: {
        type: String,
        required: true,
        trim: true, // Quita espacios en blanco al principal y al final
    },
    description: {
        type: String,
        required: true,
        trim: true, // Quita espacios en blanco al principal y al final
    },
    tasks: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],
}, {timestamps: true})

const Project = mongoose.model<ProjectType>('Project', ProjectSchema)
export default Project