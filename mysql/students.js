const database = require('./db');
const bcrypt = require('bcrypt');
const SALT_COUNT = 8;

async function getStudentProfileInfo(studentId){
    
    try{
        const sql = "SELECT u.full_name , u.email , d.department_name , s.bio , s.skills  FROM students AS s INNER JOIN users AS u  INNER JOIN departments AS d ON u.user_id = s.student_id AND d.department_id = u.department WHERE student_id = ?";
        const [rows] = await database.pool.execute(sql , [studentId]);
   
        return rows[0];
    
    }
    
    catch(e){
        throw e;
    }
}

async function createStudentrRow(advisorId){

    try{
        const sql = "INSERT IGNORE INTO students(student_id) values(?)";
        const [result] = await database.pool.execute(sql , [advisorId]);
    }catch(e){
        console.log(e.message);
        throw e;
    }

}

async function getMyAdvisorRequests(studentId){

    try{
        const sql = "SELECT a.request_id , u.full_name , sp.project_title, sp.project_description , c.category_name , a.request_message , a.meeting_method , a.status , a.requested_at FROM advisor_requests AS a INNER JOIN users AS u ON u.user_id = a.advisor_id INNER JOIN student_projects AS sp ON sp.project_id = a.project_id INNER JOIN categories AS c ON  c.category_id = sp.project_type  WHERE a.student_id = ?";
        const [rows] = await database.pool.execute(sql , [studentId]);
        return rows;
    }
    
    catch(e){
        throw e;
    }
}

async function createStudentRow(studentId){

    try{
        const sql = "INSERT INTO students(student_id) values(?)";
        const [result] = await database.pool.execute(sql , [studentId]);
    }

    catch(e){
       throw e;
    }

}

async function changeStudentPassword(password , studentId){

    try{
        const hashPasswd = await bcrypt.hash(password , SALT_COUNT);
        const sql = "UPDATE users SET password = ? WHERE user_id = ?";
        const [result] = await database.pool.execute(sql , [hashPasswd , studentId]);
    }

    catch(e){
        throw e;
    }
}

async function modifyStudenSkills(skills , studentId){

    try{
        const sql = "UPDATE students SET skills = ? WHERE student_id = ?";
        const [result] = await database.pool.execute(sql , [skills , studentId]);  
        console.log('skills updated..');      
    }

    catch(e){
        throw e;
    }
}

async function modifyStudenBio(bio , studentId){
    try{
        const sql = "UPDATE students SET bio = ? WHERE student_id = ?";
        const [result] = await database.pool.execute(sql , [bio , studentId]); 
        console.log('Bio updated..'); 
    }

    catch(e){
        throw e;
    }
}

async function setStudentProfile(studentId){
    try{
        const sql = "INSERT INTO students(student_id , bio , skills) VALUES(?,?,?)"; 
        const [result] = await database.pool.execute(sql , [studentId]);
    }

    catch(e){
        throw e;
    }
}

async function getStudentById(studentId){
    try{

        const sql = "SELECT * FROM users WHERE role = 3 AND user_id = ?";
        const [row] = await database.pool.execute(sql , [studentId]);
        return row[0];
    }

    catch(e){
        throw e;
    }
}


module.exports = {
    getMyAdvisorRequests,
    getStudentById,
    getStudentById,
    getStudentProfileInfo,
    createStudentRow,
    changeStudentPassword,
    modifyStudenSkills , 
    modifyStudenBio
}