const database = require('./db');

async function getAdvisors(){
    try{
        const sql = "select u.user_id , u.full_name , u.email , d.department_name , a.areas_of_expertise , a.academic_title , a. research  , a.available FROM users AS u INNER JOIN departments AS d INNER JOIN advisors AS a ON u.user_id = a.advisor_id AND d.department_id = u.department"
        const [rows] = await database.pool.execute(sql);
        return rows;

    }catch(e){
        console.log(`Get advisors error : ${e.message}`);
        throw e;
    }
}

async function createAdvisorRow(advisorId){

    try{
        const sql = "INSERT IGNORE INTO advisors (advisor_id) VALUES (?)";
        const [result] = await database.pool.execute(sql , [advisorId]);
    }catch(e){
        console.log(e.message);
        throw e;
    }
}

async function getAdvisorProfileInfo(advisorId){
    try{
        const sql = "select u.full_name , u.email , d.department_name , a.academic_title , a.areas_of_expertise , a.research , a.available   FROM users AS u INNER JOIN departments AS d INNER JOIN advisors AS a ON a.advisor_id = u.user_id AND d.department_id = u.department  WHERE user_id = ?";
        const [result] = await database.pool.execute(sql , [advisorId]);

        return result[0];
    
    }

    catch(e){
        console.log(`Finding advisor information : ${e.message}`);
    }
}

async function requestAdvisor(advisorId, projectId , studentId , message , meetingMethod){

    try{
        const sql = "INSERT INTO advisor_requests (advisor_id , project_id, student_id , request_message , meeting_method) VALUES (?,?,?,?,?)";
        const [result] = await database.pool.execute(sql , [advisorId , projectId, studentId , message , meetingMethod]);
    }

    catch(e){
        console.log(`Request advisor error : ${e.message}`);
        throw e;
    }
}

async function advisorDashboard(){

    try{
        const sql = "SELECT u.full_name , a.status , a.requested_at FROM users AS u INNER JOIN advisor_requests AS a ON a.student_id = u.user_id";
        const [rows] = await database.pool.execute(sql);

        return rows;
    }

    catch(e){
        console.log(`Advisor infos {advisorDashboard()} : ${e.message}`);
        throw e;
    }

}

async function getRequests(advisorId){
    try{
        const sql = "SELECT a.request_id , u.user_id, u.full_name , u.email , d.department_name , sp.project_title, sp.project_description , c.category_name , a.request_message , a.meeting_method , a.requested_at FROM advisor_requests AS a INNER JOIN student_projects AS sp INNER JOIN users AS u INNER JOIN departments AS d INNER JOIN categories AS c ON u.user_id = a.student_id AND d.department_id = u.department AND c.category_id = sp.project_type AND sp.project_id = a.project_id WHERE a.advisor_id = ?";
        const [rows] = await database.pool.execute(sql , [advisorId])

        return rows;
    }

    catch(e){
        console.log(`Get all requests error : ${e.message}`);
        throw e;
    }
}

async function countPendingRequests(advisorId){

    try{
        const sql = "SELECT count(status) as pending_requests FROM advisor_requests WHERE status = 'pending' AND advisor_id = ?";
        const [result] = await database.pool.execute(sql , [advisorId]);
        return result[0];
    }

    catch(e){
        console.log(`Count pending request error : ${e.message}`);
        throw e;
    }
}

async function countAcceptedRequests(advisorId){
    try{    
        const sql = "SELECT COUNT(status) AS total_accepted_requests FROM advisor_requests WHERE status = 'accepted' AND advisor_id = ?";
        const [result] = await database.pool.execute(sql , [advisorId]);
        return result[0];
    }catch(e){
        throw e;
    }
}

async function countRejectedRequests(advisorId){
    try{    
        const sql = "SELECT COUNT(status) AS total_rejected_requests FROM advisor_requests WHERE status = 'rejected' AND advisor_id = ? ";
        const [result] = await database.pool.execute(sql , [advisorId]);
        return result[0];
    }catch(e){
        throw e;
    }
}

async function getPendingRequests(advisorId){

    try{
        const sql = "SELECT a.request_id , u.user_id, u.full_name , u.email , d.department_name , sp.project_title, sp.project_description , c.category_name , a.request_message , a.meeting_method , a.requested_at FROM advisor_requests AS a INNER JOIN student_projects AS sp INNER JOIN users AS u INNER JOIN departments AS d INNER JOIN categories AS c ON u.user_id = a.student_id AND d.department_id = u.department AND c.category_id = sp.project_type AND sp.project_id = a.project_id WHERE a.status = 'pending' AND a.advisor_id = ?";
        const [rows] = await database.pool.execute(sql , [advisorId]);

        return rows;

    }
    catch(e){
       console.log(`Pending request request error : ${e.message}`);
       throw e;
    }
}

async function getAcceptedRequests(advisorId){
    try{
        const sql = "SELECT a.request_id , u.user_id, u.full_name , u.email , d.department_name , sp.project_title, sp.project_description , c.category_name , a.request_message , a.meeting_method , a.requested_at FROM advisor_requests AS a INNER JOIN student_projects AS sp INNER JOIN users AS u INNER JOIN departments AS d INNER JOIN categories AS c ON u.user_id = a.student_id AND d.department_id = u.department AND c.category_id = sp.project_type AND sp.project_id = a.project_id WHERE a.status = 'accepted' AND a.advisor_id = ?";
        const [rows] = await database.pool.execute(sql , [advisorId]);
        return rows;

    }catch(e){
        throw e;
    }
}

async function getRejectedRequests(advisorId){
    try{
        const sql = "SELECT a.request_id , u.user_id, u.full_name , u.email , d.department_name , sp.project_title, sp.project_description , c.category_name , a.request_message , a.meeting_method , a.requested_at FROM advisor_requests AS a INNER JOIN student_projects AS sp INNER JOIN users AS u INNER JOIN departments AS d INNER JOIN categories AS c ON u.user_id = a.student_id AND d.department_id = u.department AND c.category_id = sp.project_type AND sp.project_id = a.project_id WHERE a.status = 'rejected' AND a.advisor_id = ?";
        const [rows] = await database.pool.execute(sql , [advisorId]);
        return rows;

    }catch(e){
        throw e;
    }
}

async function acceptRequest(requestId){
    try{
        const sql = "UPDATE advisor_requests SET status = 'accepted' WHERE request_id = ?";
        const [result] = await database.pool.execute(sql , [requestId]);
        if(result.affectedRows <= 0){
            return null;
        }
    }catch(e){
        console.log(`Accept request error : ${e.message}`);
        throw e;
    }
}

async function rejectRequest(requestId){
    try{
        const sql = "UPDATE advisor_requests SET status = 'rejected' WHERE request_id = ?";
        const [result] = await database.pool.execute(sql , [requestId]);

        if(result.affectedRows <= 0){
            return null;
        }
    }catch(e){
        console.log(`Reject request error : ${e.message}`);
        throw e;
    }
}

async function myProjects(advisorId){

    try{
        const sql = "SELECT u.full_name , u.email , p.project_title , p.project_description , p.budget , a.meeting_method  FROM advisor_requests AS a INNER JOIN users AS u INNER JOIN student_projects AS p ON u.user_id = a.advisor_id AND p.project_id = a.project_id WHERE a.status = 'accepted' AND a.advisor_id = ?";
        const [rows] = await database.pool.execute(sql , [advisorId]);

        return rows;
    }

    catch(e){
        console.log(`My projects error :${e.message} `);
        throw e;
    }
}

async function setAcademicTitle(academicTitle , advisorId){
    try{
        const sql = "UPDATE advisors SET academic_title = ? WHERE advisor_id = ?";
        const [result] = await database.pool.execute(sql , [academicTitle , advisorId]);
    }

    catch(e){
        console.log(e.message);
        throw e;
    }
}

async function setExpertise(expertise , advisorId){
    try{
        const sql = "UPDATE advisors SET areas_of_expertise = ? WHERE advisor_id = ?";
        const [result] = await database.pool.execute(sql , [expertise , advisorId]);

    }

    catch(e){
        console.log(e.message);
        throw e;
    }
}

async function setResearches(researches , advisorId){
    try{
        const sql = "UPDATE advisors SET research = ? WHERE advisor_id = ?";
        const [result] = await database.pool.execute(sql , [researches , advisorId]);
    }

    catch(e){
        console.log(e.message);
        throw e;
    }
}

async function isAdvisorAvailable(available , advisorId){
    try{
        const sql = "UPDATE advisors SET available = ? WHERE advisor_id = ?";
        const [result] = await database.pool.execute(sql , [available , advisorId]);
    }

    catch(e){
        console.log(e.message);
        throw e;
    }
}

module.exports = {
    getAdvisors, 
    createAdvisorRow,
    getAdvisorProfileInfo,
    getRequests,
    acceptRequest,
    setAcademicTitle,
    isAdvisorAvailable,
    setResearches,
    setExpertise,
    rejectRequest,
    myProjects,
    requestAdvisor,
    advisorDashboard,
    countPendingRequests,
    getPendingRequests,
    getAcceptedRequests,
    getRejectedRequests,
    countAcceptedRequests,
    countRejectedRequests
}