const database = require('./db');

async function countAnnouncements(){
    try{
        const sql = "SELECT count(announcement_id) AS total_announcements FROM announcements";
        const [result] = await database.pool.execute(sql);
        return result[0];
    }catch(e){
        throw e;
    }
}

async function countProjects(){
    try{
        const sql = "SELECT count(project_id) AS total_projects FROM student_projects";
        const [result] = await database.pool.execute(sql);
        return result[0];
    }catch(e){
        throw e;
    }
}

async function countCategories(){
    try{
        const sql = "SELECT count(category_id) AS total_categories FROM categories";
        const [result] = await database.pool.execute(sql);
        return result[0];

    }catch(e){
        throw e;
    }
}

async function countUsers(){
    try{
        const sql = "SELECT COUNT(user_id) AS total_users FROM users";
        const [result] = await database.pool.execute(sql);
        return result[0];
    }catch(e){
        throw e;
    }
}

async function getDeparments(){
    try{
        const sql = "SELECT department_id, department_name, created_at FROM departments";
        const [result] = await database.pool.execute(sql);
        return result;
    }catch(e){
        throw e;
    }
}

async function addDepartment(departmentName){
    try{
        const sql = "INSERT INTO departments (department_name) VALUES (?)";
        const [result] = await database.pool.execute(sql, [departmentName]);
        if(result.affectedRows < 0){
            throw new Error("Failed to add department");
        }
        console.log("Department added successfully");
        return result;
        
    }catch(e){
        throw e;
    }
}

async function deleteDepartment(departmentId){
    try{
        const sql = "DELETE FROM departments WHERE department_id = ?";
        const [result] = await database.pool.execute(sql, [departmentId]);
        if(result.affectedRows < 0){
            throw new Error("Failed to delete department");
        }

        console.log("Department deleted successfully");
        return result;

    }catch(e){
        throw e;
    }
}

module.exports = {
    countAnnouncements,
    countProjects,
    countCategories,
    countUsers,
    getDeparments,
    addDepartment,
    deleteDepartment
}