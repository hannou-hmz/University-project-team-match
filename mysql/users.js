const database = require('./db');
const bcrypt = require('bcrypt');
const SALT_COUNT = 8;

async function createUser(role , full_name , age , email , department , password){
    try{
        const encPassword = await bcrypt.hash(password , SALT_COUNT);
        const sql = "INSERT INTO users(role , full_name , age , email , department , password) VALUES(?,?,?,?,?,?)";
        const [result] = await database.pool.execute(sql , [role , full_name , age , email , department , encPassword]);
        return result;
    }
    catch(e){
        throw e;
    }
}

async function getAdmin(email , password){
    try{
        const sql = "SELECT * FROM admins WHERE email = ?";
        const [result] = await database.pool.execute(sql , [email]);
        
        if(result.length > 0){
            const passwd = await bcrypt.compare(password , result[0].password); 
            if(passwd){
                console.log('Admin found ..');
                return result[0];
            }
           else{
                console.log("NO admin found ..");
                return null;
            }
        }
        
    }
    catch(e){
        console.log(e.message);
        throw e;
    }
    
}

async function getUser(role , email , password){
    
    try{
        const sql = "SELECT * FROM users WHERE role = ? AND email = ?";
        const [rows] = await database.pool.execute(sql, [role , email]);
        
        if(rows.length > 0){
            const isMatch = await bcrypt.compare(password , rows[0].password);
            if(isMatch){
                console.log('User found in database.')
                return rows[0];
            }
            else{
                console.log(`User not found in db (Wrong password)`);
            }
        }

       return null;
    }
    
    catch (e) {
        throw e;
    }
}

async function getUserById(userId){

    try{
        const sql = "SELECT u.full_name FROM users AS u WHERE user_id = ?";
        const [rows] = await database.pool.execute(sql , [userId]);
        return rows[0];
    }

    catch(e){
        throw e;
    }
}

async function getUserByEmail(userId){
    try{
        const sql = "SELECT email FROM users WHERE user_id = ?";
        const [result] = await database.pool.execute(sql , [userId]);
        if(result.length <= 0){
            console.log(`No user with such email ..`);
            return false;
        }

        return result;
    }catch(e){
        console.log(e.message);
        throw e;
    }
}

async function compareUserPassword(userId , currentPasswd){

    try{
        const sql = "SELECT password FROM users WHERE user_id = ?";
        const [result] = await database.pool.execute(sql , [userId]);
        if (result.length === 0) return null;
        const isMatch = await bcrypt.compare(currentPasswd , result[0].password); 

        if(!isMatch){
            console.log(`Password do not match!`);
            return false;
        }

        return true;
    }

    catch(e){
        throw e;
    }
}

async function resetPassword(password , email){
    try{
        const newPassword = await bcrypt.hash(password , SALT_COUNT);
        const sql = "UPDATE users SET password = ? WHERE email = ?";
        const [result] = await database.pool.execute(sql , [newPassword , email]);

        if(result.affectedRows > 0){
            return true;
        }
        else{
            return false;
        }

    }catch(e){
        throw e;
    }
}

async function getAllUsers(){

    try{
        const sql = "SELECT u.user_id, u.role ,  u.full_name , u.email , d.department_name , r.role_name FROM users AS u INNER JOIN roles AS r INNER JOIN departments AS d ON r.role_id = u.role AND d.department_id = u.department";
        const [rows] = await database.pool.execute(sql);
        return rows;
    }

    catch(e){
        throw e;
    }
}

async function getUsersRoles(){
    try{
        const sql = "SELECT role_id , role_name FROM roles";
        const [rows] = await database.pool.execute(sql);
        return rows;
    }
    catch(e){
        throw e;
    }
}

async function deleteUsers(userId){

    try{
        const sql = "DELETE FROM users WHERE user_id = ?";
        const [result] = await database.pool.execute(sql , [userId]);
    }

    catch(e){
        throw e;
    }
}

async function changeUserRole(role , userId){
    try{
        const sql = "UPDATE users SET role = ? WHERE user_id = ?";
        const [result] = await database.pool.execute(sql , [role , userId]);
    }
    catch(e){
        console.log(e.message);
        throw e;
    }
}



module.exports = {
    createUser,
    getUser,
    getUserById,
    getAdmin,
    getAllUsers,
    getUsersRoles,
    compareUserPassword,
    resetPassword,
    deleteUsers,
    changeUserRole,
    getUserByEmail
}