const express = require('express');
const path = require('path');
const app = express();
const rateLimit = require('express-rate-limit');
const adminRouters = express.Router();
const db = require('../mysql/db');
const {countAnnouncements, countProjects, countCategories, countUsers} = require('../mysql/admins');
const {getAdmin , getAllUsers , deleteUsers, getUsersRoles , changeUserRole } = require('../mysql/users');
const {getCategories ,addCategory, deleteCategory} = require('../mysql/categories');
const {addAnnouncement , getAnnouncements , deleteAnnouncement} = require('../mysql/announcements');
const {createProjects , getProjects , myProjects , deleteProjects} = require('../mysql/projects');
const {createAdvisorRow} = require('../mysql/advisors');

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message : "Too many attempts"
});

function isAdmin(req, res, next){
    if(!req.session.adminId){
        console.log('No admin session .. redirecting ..');
        return res.redirect('/admin/dashboard');
    }
    next();
}


adminRouters.get('/dashboard' , (req , res)=>{
    try{
        return res.render("admin-login");
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }
});

adminRouters.post('/dashboard' , loginLimiter , async(req , res)=>{
    try{
        const {email , password} = req.body;
        const admin = await getAdmin(email , password);
        if(admin){
            req.session.adminId = admin.admin_id;
            req.session.save((err) => {
                if (err){
                    console.log(err.message);
                    return res.status(500).render("500");
                } 
                console.log(`Admin ✅`);
                return res.redirect('/admin/homepage');
            });
        }else{
            console.log(`Not admin ❌`);
            return res.redirect('/admin/dashboard');
        }
        
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }
})

adminRouters.get('/homepage' , isAdmin , async(req , res)=>{
    try{
        const categories = await countCategories() ;
        const projects = await countProjects();
        const users = await countUsers();
        const announcements = await countAnnouncements();
        
        return res.render("admin-homepage" , {
            categories : categories,
            projects : projects,
            users : users,
            announcements : announcements
        });
    }
    catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }
});

adminRouters.get('/projects' , isAdmin ,async (req , res)=>{
    try{
        const projects = await getProjects();
        return res.render("admin-projects" ,{
            projects : projects
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin")
    }
    
});

adminRouters.delete('/projects/:id/delete', async(req , res)=>{ // it has to be changed to delete not get.
    try{
        const projectId = req.params.id;
        const removeProject = await deleteProjects(projectId);
        return res.redirect('/admin/projects');

    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }
      
});

adminRouters.get('/announcements' , isAdmin , async(req , res)=>{
    try{
        const announcements = await getAnnouncements();
        const categories = await getCategories();
        return res.render("admin-announcements" , {
            announcements : announcements,
            categories : categories
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }
    
});

adminRouters.post('/announcements/add', async(req , res)=>{

    try{
        const {category , title , description , isUrgent} = req.body;
        const newAnnouncement = await addAnnouncement(category , title , description , isUrgent);

        return res.redirect('/admin/announcements');
    }

    catch(e){
        console.log(`Error : ${e.message}`);
        return res.status(500).render("500-admin");
    }
});

adminRouters.delete('/announcements/:id/delete' , async (req , res)=>{
    try{
        const announcementId = req.params.id;
        const removeAnnoucements = await deleteAnnouncement(announcementId);

        return res.redirect('/admin/announcements');
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }
});

adminRouters.get('/categories' , isAdmin ,async(req , res)=>{
    try{
        const categories = await getCategories();
        return res.render('admin-categories' , {
            categories : categories
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }  

});

adminRouters.post('/categories/add', isAdmin ,async(req , res)=>{

    try{
        const {categoryName , categoryDescription} = req.body;
        const newCategory = await addCategory(categoryName , categoryDescription);
        return res.redirect('/admin/categories');
    }

    catch(e){
        console.log(`Problem ${e.message}`);
        return res.status(500).send("500-admin");
    }
});

adminRouters.get('/categories/:categoryId/delete' , isAdmin , async(req , res)=>{
    try{
        const categoryId = req.params.categoryId;
        const result = await deleteCategory(categoryId);

        return res.redirect('/admin/categories');
    }

    catch(e){
        console.log(`Error : ${e.message}`);
        return res.status(500).render("500-admin");
    }
});

adminRouters.get('/users/roles' , isAdmin , async(req , res)=>{
    try{
        const users = await getAllUsers();
        const sql = "select role_id , role_name from roles where role_id != 1";
        const [result] = await db.pool.execute(sql);
        return res.render("admin-users-roles" , {
            users : users,
            roles : result
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }
});

adminRouters.patch('/:userId/change-role' , isAdmin , async(req , res)=>{
    try{
        const userId = req.params.userId;
        const newRole = Number(req.body.roleId);
        if(newRole === 2){
            const result = await changeUserRole(newRole , userId);
            const newAdvisor = await createAdvisorRow(userId);

            return res.redirect("/admin/users/roles");
        }
        else if(newRole === 3){
            const result = await changeUserRole(newRole , userId);
            return res.redirect("/admin/users/roles");
        }
        else{
            return res.status(500).render("500-admin");
        }
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500-admin");
    }
});

adminRouters.delete('/users/:userId/delete' , isAdmin , async(req , res)=>{

    try{
        const userId = req.params.userId;
        const removeUser = await deleteUsers(userId);

        return res.redirect('/admin/users/roles');
    }

    catch(e){
         console.log(e.message);
         return res.status(500).render("500-admin");
    }
});


module.exports = adminRouters;