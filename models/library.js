const mongoUtil = require("../database/mongoUtil");

function GetLib(){
    const db = mongoUtil.getDb();
    return db.collection('√∂grenciler').find({}).toArray()
}


exports.GetLib = GetLib

