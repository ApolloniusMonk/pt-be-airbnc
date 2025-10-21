const db = require("../db/db-connection-pool")

const { fetchUserById } = require("../models/users")

exports.getUserById = async (req, res, next) => {
  try{
    const { id } = req.params;
    if(isNaN(id)) return next ({status: 400, msg: "Invalid user id."});

    const user = await fetchUserById(id);
    res.status(200).send({user})
  }catch (err){
   next (err)
  }
}