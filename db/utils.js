function addUserDefaults(users = []){
return users.map((user, index) => {
    return {
        user_id: index + 1,
        ...user,
        created_at: new Date(),
    }
})
}


function formatProperties(properties = [], users = []){
    return []
}

module.exports = {addUserDefaults, formatProperties}



