import express from 'express'
import { getAllUsers, toggleAccess } from '../lib/userManagement/userManagement.mjs'

const userManagementRouter = express.Router()

userManagementRouter.get('/users/:pageNumber', async (request, response)=>{
    const adminUsername = request.user.username
    const users = await getAllUsers([adminUsername], request.params.pageNumber)
    response.json(users)
})

userManagementRouter.post('/toggleAccess', async(request, response)=>{
    const toggleAccessArray = request.body.toggleAccessArray
    const result = await toggleAccess(toggleAccessArray)
    if(result)
    {
        response.status(200).json({"success" : true})
    }
    else{
        response.status(500).json({"success" : false})
    }
})

export {userManagementRouter}