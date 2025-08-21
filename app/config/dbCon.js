
const mongoose=require('mongoose')
const dbCon=()=>{
    try {
        const db=mongoose.connect(process.env.MONGODB_URL)
        if(db){
            console.log("Database connecttion successful!")
        }
    } catch (error) {
        console.log("Failed to connect database!",error)
    }
}

module.exports=dbCon