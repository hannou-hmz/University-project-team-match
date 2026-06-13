const express = require('express');
const path = require('path');
const app = express();
const advisorRouters = express.Router();
const db = require('../mysql/db');
const {advisorDashboard , getRequests, getAdvisorProfileInfo, getPendingRequests, 
    acceptRequest , rejectRequest ,myProjects ,setAcademicTitle,
    isAdvisorAvailable,setResearches,setExpertise , countAcceptedRequests,
    countRejectedRequests , countPendingRequests,
    getAcceptedRequests,
    getRejectedRequests} = require('../mysql/advisors');
const {getAnnouncements} = require('../mysql/announcements');
const { getUser , getUserById, changeUserPassword , compareUserPassword } = require('../mysql/users');


function isAdvisor(req, res, next){
    if(!req.session.advisorId){
        console.log('No advisor session .. redirecting ..');
        return res.redirect('/login');
    }
    next();
}

 
advisorRouters.get('/dashboard' , isAdvisor, async(req , res)=>{
    try{
        const advisorId = req.session.advisorId;
        const advisorInfos = await getAdvisorProfileInfo(advisorId);
        const accepted = await countAcceptedRequests(advisorId);
        const rejected = await countRejectedRequests(advisorId);
        const pending = await countPendingRequests(advisorId);

        return res.render("advisor-homepage" , {
            pending : pending,
            advisor : advisorInfos,
            accepted : accepted,
            rejected : rejected,
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

advisorRouters.get('/announcements' , isAdvisor , async(req , res)=>{
    try{
        const advisorId = req.session.advisorId; 
        const announcements = await getAnnouncements();
        const advisorInfos = await getAdvisorProfileInfo(advisorId);
        return res.render("advisor-announcements" , {
            announcements : announcements,
            advisor : advisorInfos
        });
    }
    catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

advisorRouters.get('/requests' , isAdvisor , async(req , res)=>{

    try{
        const advisorId = req.session.advisorId;
        const advisorInfos = await getAdvisorProfileInfo(advisorId);
        const requests = await getPendingRequests(advisorId);

        return res.render("advisor-requests" , {
            requests : requests,
            advisor : advisorInfos
        });
    }catch(e){
        return e.message;
    }

});

advisorRouters.get('/requests/rejected' , isAdvisor , async(req , res)=>{
    try{    
        const advisorId = req.session.advisorId;
        const advisorInfos = await getAdvisorProfileInfo(advisorId);
        const rejected = await getRejectedRequests(advisorId);

        return res.render("advisor-rejected-reqs" , {
            requests : rejected,
            advisor : advisorInfos
        }
        );

    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
}) 

advisorRouters.patch('/requests/:requestId/accept' , isAdvisor , async(req , res)=>{
    
    try{
        const requestId = req.params.requestId;
        const accept = await acceptRequest(requestId);

        if(accept === null){
            console.log("acceptance failed ..");
            return res.status(500).send("500");
        }

        return res.redirect('/advisor/projects');
    }
    catch(e){
        return e.message;
    }
});

advisorRouters.patch('/requests/:requestId/reject' , isAdvisor , async(req , res)=>{

    try{
        const requestId = req.params.requestId;
        const reject = await rejectRequest(requestId);

        if(reject === null){
            console.log("decline failed ..");
            return res.status(500).send("500");
        }

        return res.redirect('/advisor/dashboard');
    }
    catch(e){
        return e.message;
    }
});

advisorRouters.get('/projects' , isAdvisor , async(req , res)=>{

    try{
        const advisorId = req.session.advisorId;
        const projects = await myProjects(advisorId);
        const advisorInfos = await getAdvisorProfileInfo(advisorId);
        
        return res.render("advisor-projects" , {
            projects : projects,
            advisor : advisorInfos
        });
    }
    
    catch(e){
        return e.message;
    }
});

advisorRouters.get('/profile' , isAdvisor , async(req , res)=>{

    try{
        const advisorId = req.session.advisorId;
        const advisorInfos = await getAdvisorProfileInfo(advisorId);

        return res.render("advisor-profile" , {
            advisor : advisorInfos
        });

    }catch(e){
        console.log(e.message);
        return res.status(500).render("500"); 
    }


});

advisorRouters.post('/profile' ,isAdvisor, async(req , res)=>{

    try{
        const advisorId = req.session.advisorId;
        const available = req.body.available ? 1 : 0;
        const {academic_title,expertise,researches} = req.body;
        const academicTitle = await setAcademicTitle(academic_title,advisorId);
        const research = await setResearches(researches,advisorId);
        const areaOfExpertise = await setExpertise(expertise,advisorId);
        const availability = await isAdvisorAvailable(available,advisorId);
        
        return res.redirect('/advisor/profile');
    }

    catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

advisorRouters.post('/profile/change-password' , isAdvisor ,async(req , res)=>  {
    try{
        const advisorId = req.session.advisorId;
        const {currentPassword , newPassword , confirmPassword} = req.body;
        const checkCurrentPasswd = await compareUserPassword(advisorId , currentPassword);
        
        if(!checkCurrentPasswd){
            return res.status(500).render("500");
        }

        else{
            if(newPassword != confirmPassword){
                console.log(`Confirm password do not match!!`);
                return res.status(500).render("500")
            }

            const changePassword = await changeUserPassword(newPassword , advisorId);
            console.log('Password updated ...');
            return res.redirect('/advisor/profile');
        }
    }

    catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});



module.exports = advisorRouters;