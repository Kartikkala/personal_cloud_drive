import express from 'express'
import { changeTotalUserSpace, getAllUsers, toggleAccess, totalDiskSpace, totalUsedSpace, getTotalSpaceForUser } from '../lib/userManagement/userManagement.js'

const userManagementRouter = express.Router()

function convertToInt(str : string) {
    const num = parseInt(str, 10); // Convert to integer with base 10

    // Check if conversion is valid
    if (!isNaN(num) && str.trim() === num.toString()) {
        return num; // Valid integer conversion
    } else {
        return undefined; // Handle malformed input
    }
}

userManagementRouter.get('/users/:pageNumber', async (request, response)=>{
    if(request.user)
    {
        const adminUsername = request.user.username
        const pgNum = convertToInt(request.params.pageNumber)
        if(pgNum)
        {
            const users = await getAllUsers([adminUsername], pgNum)
            return response.json(users)
        }
        return response.status(400).send("Invalid page number")
    }
    return response.status(401).send("Unauthorized!")
})

userManagementRouter.get('/diskUsage', async (request, response)=>{
    const responseObject = {'totalDiskSpace' : await totalDiskSpace(), 'totalUsedSpace' : await totalUsedSpace()}
    return response.json(responseObject)
})

// userManagementRouter.post('/changeTotalSpaceForUser', async (request, response)=>{
//     const newSpace = request.body.totalSpace
//     const targetUsername = request.body.targetUser
//     const responseObject = {success : true, userPresent : true, newSpace : undefined}

//     // Available Disk space = total space on local disk - (Total space used provisioned to all users - Total Space provisioned to target user)
//     const currentUserDetails = await getTotalSpaceForUser(targetUsername)
//     const spaceUsedByAllUsers = await totalUsedSpace()
    
//     responseObject.success = currentUserDetails.success
//     responseObject.userPresent = currentUserDetails.userPresent
//     responseObject.newSpace = currentUserDetails.totalSpace

//     const availableSpace = await totalDiskSpace() - (spaceUsedByAllUsers - currentUserDetails.totalSpace)
    
//     if(availableSpace - newSpace > 0)
//     {
//         const queryResult = await changeTotalUserSpace(targetUsername, newSpace)
//         if(queryResult)
//         {
//             responseObject.newSpace = newSpace
//         }
//     }
//     else{
//         responseObject.success = false
//     }
//     response.json(responseObject)
// })

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