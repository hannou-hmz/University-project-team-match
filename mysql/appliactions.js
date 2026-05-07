const database = require('./db');

async function submitApplication(userId , projectId , email , message , skills){

    try{
        const sql = "INSERT INTO applications(user_id , project_id , email , request_message , request_skills) VALUES(?,?,?,?,?)";
        const [result] = await database.pool.execute(sql , [userId , projectId , email , message , skills]);
    }

    catch(e){
        throw e;
    }

}

async function myProjectApplications(userId){

    try{
        const sql = "SELECT a.request_id , p.project_title , a.email , u.full_name , u.department , c.category_name ,a.request_date, a.request_message , a.request_skills , a.status  FROM applications AS a INNER JOIN student_projects AS p INNER JOIN categories AS c INNER JOIN users AS u ON a.project_id = p.project_id AND u.user_id = a.user_id AND p.project_type = category_id  WHERE a.user_id = ?";
        const [rows] = await database.pool.execute(sql , [userId]);
        return rows;
    }
   
    catch(e){
        throw e;
    }
}

async function deleteApplication(applicationId){

    try{
        const sql = "DELETE FROM applications WHERE request_id = ?";
        const [result] = await database.pool.execute(sql , [applicationId]);
        if(result.affectedRows < 0){
            return null;
        }

        return true;
    }

    catch(e){
        throw e;
    }
}

async function getApplicants(userId){
    
    try{
        const sql = "SELECT a.request_id, a.email, a.request_message, a.request_skills, a.request_date, a.status, p.project_title, c.category_name, u.full_name, d.department_name FROM applications AS a INNER JOIN users AS u ON a.user_id = u.user_id INNER JOIN student_projects AS p ON a.project_id = p.project_id INNER JOIN categories AS c ON c.category_id = p.project_type INNER JOIN departments AS d ON u.department = d.department_id WHERE p.created_by = ?";
        const [rows] = await database.pool.execute(sql , [userId]);   
        return rows;
    }

    catch(e){
        throw e;
    }
}

async function updateApplicationStatus(stat, requestId ){
    try{
        const sql = "UPDATE applications SET status = ? WHERE request_id = ?";
        const [result] = await database.pool.execute(sql , [stat , requestId]);
        if(result.affectedRows < 0){
            console.log(`Status not updated in DB ..`);
            return null;
        }

        return true;

    }catch(e){
        throw e;
    }
}

async function acceptApplication(requestId){

    try{
        const sql = "UPDATE applications SET status = 'accepted' WHERE request_id = ?";
        const [result] = await database.pool.execute(sql , [requestId]); 
        if(result.affectedRows <= 0){
            return null
        }
    }

    catch(e){
        throw e;
    }
}

async function rejectApplication(requestId){

    try{
        const sql = "UPDATE applications SET status = 'rejected' WHERE request_id = ?";
        const [result] = await database.pool.execute(sql , [requestId]);
    }

    catch(e){
        throw e;
    }
}



module.exports = {
    submitApplication,
    myProjectApplications,
    deleteApplication,
    getApplicants,
    acceptApplication,
    rejectApplication,
    updateApplicationStatus
}