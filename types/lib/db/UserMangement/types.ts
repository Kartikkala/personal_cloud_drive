import { Mongoose } from "mongoose"

export interface IDatabase extends Mongoose{
    connectToDatabase() : Promise<boolean>
}