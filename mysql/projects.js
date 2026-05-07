const database = require('./db');

async function createProjects(title , type , description , budget , skills , team_size , require_advisor , created_by){
    try{
        const sql = "INSERT INTO student_projects(project_title , project_type , project_description , budget , required_skills , team_size , require_advisor , created_by) VALUES(?,?,?,?,?,?,?,?)";
        const [result] = await database.pool.execute(sql , [title , type , description , budget , skills , team_size , require_advisor ? 1 : 0 , created_by]);

        console.log(`Project successefuly created`);
        return result;
    }
    catch(e){
        console.log(`Project not successefuly created : ${e.message}`);
        throw e;
    } 
}

async function getProjects(){
    try{
        const sql = "SELECT p.created_by , p.project_id , p.project_title , c.category_name , u.full_name , p.project_description ,p.team_size , p.budget , p.required_skills , p.created_at FROM student_projects AS p INNER JOIN categories AS c INNER JOIN users AS u ON c.category_id = p.project_type AND p.created_by = u.user_id";
        const [rows] = await database.pool.execute(sql);

        return rows;
    }
    catch(e){
        console.log(`Fetching projects : ${e.message}`);
        throw e;
    }
    
}

async function deleteProjects(projectId){
    try{
        const sql = "DELETE FROM student_projects WHERE project_id = ? ";
        const [result] = await database.pool.execute(sql , [projectId]);
        if(result.affectedRows < 0){
            return null;
        }
        console.log("successefully deleted ..");
        return true;
    }catch(e){
        console.error("Delete projects error:", e.message);
        throw e; 
    }
}

async function myProjects(createdBy){

    try{
        const sql = "SELECT p.project_id , p.project_title , u.full_name , c.category_name , p.project_description ,p.budget , p.required_skills , p.team_size , p.require_advisor , p.created_at FROM student_projects AS p INNER JOIN users AS u INNER JOIN categories AS c ON p.created_by = u.user_id AND p.project_type = c.category_id WHERE p.created_by = ?";
        const [result] = await database.pool.execute(sql , [createdBy]);

        console.log("Serving my projects...");
        return result; 
    }catch(e){
        console.error("My projects error:", e.message);
        throw e; 
    };

}

async function applyForProjects(studentId){
    try{
        const sql = "SELECT s.*, u.full_name, d.department_name,c.category_name FROM student_projects AS s INNER JOIN users AS u ON s.created_by = u.user_id INNER JOIN categories AS c ON s.project_type = c.category_id INNER JOIN departments AS d ON d.department_id = u.department WHERE s.created_by != ?";
        const [rows] = await database.pool.execute(sql , [studentId]);
        return rows; 
    }catch(e){
        throw e;
    }
}

async function totalProjects(){
    try{
        const sql = "SELECT COUNT(project_id) AS projectsCount FROM  student_projects;";
        const [rows] = await database.pool.execute(sql);
        return rows;

    }catch(e){
        console.log(e.message);
        throw e;
    }
}

module.exports = {
    createProjects,
    getProjects,
    deleteProjects,
    myProjects,
    applyForProjects,
    totalProjects
}