const database = require('./db')
const bcrypt = require('bcrypt')
const SALT_COUNT = 10


async function storeCode(userId , email , code){
    try{
        const hashCode = await bcrypt.hash(code , SALT_COUNT)
        const sql = "INSERT INTO temp_code (issuer_id , issuer_email , code) values(?,?,?)"
        const [result] = await database.pool.execute(sql , [userId , email , hashCode])

    }catch(e){
        console.log(e.message)
        throw e
    }
}

async function getCode(userId){
    try{
        const sql = "SELECT code FROM temp_code WHERE issuer_id = ?"
        const [result] = await database.pool.execute(sql , [userId])
    
        return result[0] ?? null // If result[0] is not null or undefined, return it. Otherwise, return null.
        
    }catch(e){
        console.log(e.message)
        throw e
    }
}

async function checkCode(userId , code){
    try{
        const originalCode = await getCode(userId)
        const isValid = await bcrypt.compare(code , originalCode.code)
        
        return isValid
        
    }catch(e){
        console.log(`Check code function : ${e.message}`)
        throw e
    }
} 

async function deleteCode(userId){
    try{
        const sql = "DELETE FROM temp_code WHERE issuer_id = ?"
        const result = await database.pool.execute(sql , [userId])

    }catch(e){
        console.log(e.message)
        throw e
    }
}

module.exports = {
    storeCode , 
    getCode ,
    checkCode,
    deleteCode
}