import express from 'express'
import { changeTotalUserSpace, getAllUsers, toggleAccess, totalDiskSpace, totalUsedSpace, getTotalSpaceForUser } from '../lib/userManagement/userManagement.mjs'

const userManagementRouter = express.Router()

userManagementRouter.get('/users/:pageNumber', async (request, response)=>{
    const adminUsername = request.user.username
    const users = await getAllUsers([adminUsername], request.params.pageNumber)
    response.json(users)
})

userManagementRouter.get('/diskUsage', async (request, response)=>{
    const responseObject = {'totalDiskSpace' : await totalDiskSpace(), 'totalUsedSpace' : await totalUsedSpace()}
    response.json(responseObject)
})

userManagementRouter.post('/changeTotalSpaceForUser', async (request, response)=>{
    const newSpace = request.body.totalSpace
    const targetUsername = request.body.targetUser
    const responseObject = {success : true, userPresent : true, newSpace : undefined}

    // Available Disk space = total space on local disk - (Total space used provisioned to all users - Total Space provisioned to target user)
    const currentUserDetails = await getTotalSpaceForUser(targetUsername)
    const spaceUsedByAllUsers = await totalUsedSpace()
    
    responseObject.success = currentUserDetails.success
    responseObject.userPresent = currentUserDetails.userPresent
    responseObject.newSpace = currentUserDetails.totalSpace

    const availableSpace = await totalDiskSpace() - (spaceUsedByAllUsers - currentUserDetails.totalSpace)
    
    if(availableSpace - newSpace > 0)
    {
        const queryResult = await changeTotalUserSpace(targetUsername, newSpace)
        if(queryResult)
        {
            responseObject.newSpace = newSpace
        }
    }
    else{
        responseObject.success = false
    }
    response.json(responseObject)
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