require('dotenv').config();
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    port : process.env.DB_PORT,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    waitForConnections : true, 
    connectionLimit : 10, // max of connection a pool can handle at the same time.
    queueLimit : 0 //Maximum number of requests allowed to wait in the queue for a free connection.
});

async function testConnection(){
    try{
        const connection = await pool.getConnection(); // get one connection from the pool
        console.log(`✅ Connected to mySQL .`);
        connection.release(); // send it back to the pool
        return true;
    } 
    catch(connectionError){
        console.error("MySQL Error:", connectionError);
        return false;
    }   
}


module.exports = {
    pool , testConnection
}