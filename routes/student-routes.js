const express = require('express');
const path = require('path');
const limit = require('express-rate-limit');
const studentRoutes = express.Router();
const db = require('../mysql/db');
const {getMyAdvisorRequests , getStudentProfileInfo, getStudentById ,modifyStudenSkills , modifyStudenBio} = require('../mysql/students');
const {getCategories ,addCategory, deleteCategory} = require('../mysql/categories');
const {getAdvisors , requestAdvisor} = require('../mysql/advisors');
const {getAnnouncements} = require('../mysql/announcements');
const {compareUserPassword , changeUserPassword} = require('../mysql/users');
const {createProjects , getProjects , deleteProjects, myProjects , applyForProjects} = require('../mysql/projects');
const {submitApplication, myProjectApplications, deleteApplication, getApplicants ,
     acceptApplication , rejectApplication,
     updateApplicationStatus} = require('../mysql/appliactions');

const limiter = limit({
    windowMs : 15 * 60 * 1000 ,
    max : 100 ,
    message : "Too much requests . Try later"
})

function isStudent(req, res, next){
    if(!req.session.studentId){
        console.log('No student session .. redirecting ..');
        return res.redirect('/login');
    }
    next();
}

studentRoutes.get('/homepage' , isStudent , async(req , res)=>{
    const studentId = req.session.studentId;
    const student = await getStudentById(studentId);

    return res.render("student-homepage" , {
        student : student
    });
});

studentRoutes.get('/announcements' , isStudent , limiter , async(req , res)=>{
    try{
        const announcements = await getAnnouncements();
        return res.render("announcements" , {
            announcements : announcements
        });
    }
    catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

studentRoutes.get('/create/projects' , isStudent , limiter ,async(req , res)=>{

    try{
        const categories = await getCategories();

        return res.render("student-create-projects" , {
            categories : categories
        });
    }

    catch(e){
        console.log(e.message);
    }
    
});

studentRoutes.post('/create/projects' ,isStudent, limiter , async (req , res)=>{

    const {title , category , description , budget , skills , teamSize , reqAdvisor } = req.body;
    const createdBy = req.session.studentId;
    const announcementCategory = Number(category);

    try{
        const project = await createProjects(title , announcementCategory , description , budget , skills , teamSize , reqAdvisor , createdBy);
        return res.redirect('/student/homepage');    
    } 
    catch(e){
        res.status(500).render("500");
    }
})

studentRoutes.get('/projects' , isStudent , limiter ,async (req , res)=>{

    try{
        const studentId = req.session.studentId;
        const projects = await applyForProjects(studentId);
        const categories = await getCategories();
        return res.render("show-projects" , {
            projects : projects,
            categories : categories
        });
    }catch(e){
        console.log(`${e.message}`);
        return res.status(500).render("500");
    }

});

studentRoutes.get('/project/application/:id/apply' , isStudent , limiter , async(req , res)=>{
    
    const projectId = req.params.id;

    return res.render("submit-application" , {
         projectId: projectId
    });
});

studentRoutes.post('/project/application/submit', isStudent , limiter , async(req , res)=>{
    try{
        const id = req.session.studentId;
        const {projectId , email , message , skills}  = req.body;

        const application = await submitApplication(id , projectId , email , message , skills);
        return res.redirect('/student/projects');
    }
    catch(e){
        console.log(e.message);
        return res.status(500).render("500")
    }

});

studentRoutes.post('/project/:id/delete', isStudent, limiter ,async (req, res) => {
    try {
        const projectId = req.params.id;
        const studentId = req.session.studentId;

        const result = await deleteProjects(projectId, studentId);
        return res.redirect("/student/myprojects");

    } catch (e) {
        console.log(e.message);
        return res.status(500).render("500");
    }
});

studentRoutes.get('/myprojects', isStudent, limiter ,async (req, res) => {
    try {
        const createdBy = req.session.studentId;
        const myproject = await myProjects(createdBy);

        return res.render("st-my-projects", {
            projects: myproject 
        });

    } catch (e) {
        console.log(e.message);
        return res.status(500).send("Server error");
    }
});

studentRoutes.delete('/my-projects/:id/delete' , isStudent, limiter , async (req ,res)=>{
     try{
        const studentId = req.session.studentId;
        const projectId = req.params.id;
        const deleteProject = await deleteProjects(projectId , studentId);
        if(deleteProject){
             return res.redirect('/student/myprojects');
        }
        else{
            return res.status(500).render("500");
        }
       
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

studentRoutes.get('/applications' , isStudent , limiter ,async(req , res)=>{
    try{
        const id = req.session.studentId;
        const applications = await myProjectApplications(id);

        return res.render("st-applications" , {
            applications : applications
        });
    }

    catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
    
});

studentRoutes.delete('/applications/:applicationID/delete' ,isStudent, limiter ,async(req , res)=>{
    try{
        const applicationId = req.params.applicationID;
        const removeApplication = await deleteApplication(applicationId);

        if(removeApplication){
            return res.redirect('/student/applications');
        }

        return res.status(500).render("500");
    }
    catch(e){
        console.log(e.message);
        return res.status(500).render("500")
    }
});

studentRoutes.get('/applicants' ,isStudent ,limiter ,async (req , res)=>{
    try{
        const studentId = req.session.studentId;
        const applicants = await getApplicants(studentId);

        return res.render("applicants" , {
            applicants : applicants,
        });

    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
    
});

studentRoutes.patch('/applicants/:id/accept', isStudent , limiter ,async(req , res)=>{
    try{
        const requestId = Number(req.params.id);
        const accept = await acceptApplication(requestId);

        return res.redirect("/student/applicants");
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

studentRoutes.patch('/applicants/:id/undo', isStudent , limiter ,async(req , res)=>{
    try{
        const requestId = Number(req.params.id);
        const status = req.body.application_status
        const result = await updateApplicationStatus(status ,requestId);
        if(result){
            return res.redirect("/student/applicants");
        }else{
            return res.status(500).render("500");
        }
        
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

studentRoutes.patch('/applicants/:id/reject' , isStudent , limiter ,async(req , res)=>{
    try{
        const requestId = Number(req.params.id);
        const reject = await rejectApplication(requestId);
        return res.redirect("/student/applicants");
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

studentRoutes.get('/find/advisors' , isStudent , limiter ,async(req ,  res)=>{
     try{
        const advisors = await getAdvisors();
        return res.render("find-advisors" , {
            advisors : advisors
        });
    }
    catch(e){
        console.log(`Error : ${e.message}`);
    }
});

studentRoutes.get('/requests/:advisorId/advisors' , isStudent , limiter ,async(req , res)=>{
    try{

        const advisorId = Number(req.params.advisorId);
        const studentId = req.session.studentId;
        const [projects] = await db.pool.query('SELECT p.project_id , p.project_title , c.category_name , u.full_name , p.project_description , p.budget , p.required_skills , p.created_at FROM student_projects AS p INNER JOIN categories AS c INNER JOIN users AS u ON c.category_id = p.project_type AND p.created_by = u.user_id WHERE p.require_advisor = 1 AND p.created_by = ?' , [studentId]);
        return res.render("st-request-advisor" , {
            advisorId : advisorId , 
            projects : projects
        });
    }
    catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
})

studentRoutes.post('/requests/:advisorId/advisors' , isStudent , limiter ,async(req ,res)=>{

    try{
        const advisorId = Number(req.params.advisorId);
        const studentId = req.session.studentId;
        const {projectId , message , meetingMethod} = req.body;
        const request = await requestAdvisor(advisorId, Number(projectId) , studentId , message , meetingMethod);

        return res.redirect('/student/find/advisors');
    }

    catch(e){
        return e.message;
    }
});

studentRoutes.get('/requests' , isStudent , limiter ,async(req , res)=>{

    try{
        const studentId = req.session.studentId;
        const getRequests = await getMyAdvisorRequests(studentId);

        return res.render("st-advisor-requests" , {
            requests : getRequests
        });
    }
    
    catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }

});

studentRoutes.get('/profile' , isStudent ,limiter ,async(req , res)=>{
    try{
        const studentId = req.session.studentId;
        const student = await getStudentProfileInfo(studentId);
        return res.render("student-profile" , {
            student:student
        });
        
    }

    catch(e){
        console.log(`St Profile error : ${e.message}`);
        return res.status(500).render("500");
    }
});

studentRoutes.post('/profile/update' , isStudent , limiter ,async(req , res)=>{
    try{
        const studentId = req.session.studentId;
        const {skills , bio} = req.body;
        const updateBio = await modifyStudenBio(bio , studentId);
        const updateSkills = await modifyStudenSkills(skills , studentId);

        return res.redirect("/student/profile");
    }

    catch(e){
        console.log(`Error : ${e.message}`);
        return res.status(500).render("500");
    }
});

studentRoutes.post('/profile/change-password' , isStudent , limiter ,async(req , res)=>  {
    try{
        const studentId = req.session.studentId;
        const {currentPassword , newPassword , confirmPassword} = req.body;
        const checkCurrentPasswd = await compareUserPassword(studentId , currentPassword);
        
        if(!checkCurrentPasswd){
            console.log(`Wrong current password ..`);
            return res.status(500).render("500");
        }

        else{
            if(newPassword != confirmPassword){
                console.log(`Wrong password`);
                return res.status(500).render("500")
            }

            const changePassword = await changeUserPassword(newPassword , studentId);
            return res.redirect('/student/profile');
        }
    }

    catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});


module.exports = studentRoutes;