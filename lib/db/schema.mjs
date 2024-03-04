import { mongoose } from "./db.mjs"

const userSchema = new mongoose.Schema({
    fname : String,
    lname : String,
    username : String, 
    passwordHash : String,
    userDir : String,
    totalSpace : Number,
    admin : Boolean,
    hasAccess : Boolean
})

const inactiveDownloadsSchema = new mongoose.Schema({
    user_id : String,
    downloads : Array
})

export {userSchema, inactiveDownloadsSchema}