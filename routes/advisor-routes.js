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

const { getUser , getUserById } = require('../mysql/users');


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
        const advisor = await getUserById(advisorId);
        const advisorInfos = await getAdvisorProfileInfo(advisorId);
        const pendingReq = await countPendingRequests(advisorId);
        const accepted = await countAcceptedRequests(advisorId);
        const rejected = await countRejectedRequests(advisorId);
        const pending = await countPendingRequests(advisorId);
        console.log(advisor);
        console.log(advisorInfos);
        return res.render("advisor-homepage" , {
            advisor : advisor ,
            pending : pendingReq,
            advisor : advisorInfos,
            accepted : accepted[0],
            rejected : rejected[0],
            total_pending : pending[0]
        });
    }catch(e){
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
        const rejected = await getRejectedRequests(advisorId);

        return res.render("new-advisor-rejected-reqs" , {
            requests : rejected
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
}) // new front-end required .

advisorRouters.patch('/requests/:requestId/accept' , isAdvisor , async(req , res)=>{
    
    try{
        const requestId = req.params.requestId;
        const accept = await acceptRequest(requestId);

        if(accept === null){
            console.log("acceptance failed ..");
            return res.status(500).send("500");
        }

        return res.redirect('/advisor/dashboard');
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



module.exports = advisorRouters;