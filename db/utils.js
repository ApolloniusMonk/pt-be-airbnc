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
    return properties.map((property) => {
        const host = users.find(
            (user) =>
                `${user.first_name} ${user.surname}` === property.host_name
        );
        return {
            host_id: host ? host.user_id : null,
            name: property.name,
            location: property.location,
            property_type: property.property_type,
            price_per_night: property.price_per_night,
            description: property.description,
        };
    });
}

module.exports = {addUserDefaults, formatProperties}



