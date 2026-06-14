const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const authRoutes = express.Router();
const db = require('../mysql/db');
const nodemailer = require('nodemailer');
const {getAdvisors , createAdvisorRow} = require('../mysql/advisors');
const {createUser , getUser , resetPassword , getUserByEmail} = require('../mysql/users');
const {createStudentRow} = require('../mysql/students');
const {getProjects} = require('../mysql/projects');
const { getCategories } = require('../mysql/categories');
const {storeCode , getCode , checkCode , deleteCode} = require('../mysql/tempCode')

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,

  handler: (req, res) => {
    res.status(429).render("429", {
      message: "Too many login attempts. Try again later."
    });
  }
});

async function sendmail(sendTo){
    try{
        const code = Math.floor(100000 + Math.random() * 900000);
        const myEmail = 'hhannou06@gmail.com';
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : myEmail,
                pass : 'jkjq rgdj xoqm vhqq'
            }
        })
        
        const mailOptions = {
            from : myEmail,
            to : sendTo,
            subject: 'Verification code' ,
            html : `<h1>Your verification code is: ${code}</h1>
                    <p>This code will expire in 5 minute.</p>`
        } 

        const infos = await transporter.sendMail(mailOptions);
        console.log('infos : ' , infos.messageId);
        return code;
    
    }catch(e){
        return e.message;
    }    
}

function isStudent(req, res, next){
    if(!req.session.studentId){
        console.log('No student session .. redirecting ..');
        return res.redirect('/login');
    }
    next();
}

authRoutes.get('/' , async(req , res , next)=>{
    try{
        const projects = await getProjects();
        const categories = await getCategories();
        
        return res.render("homepage" , {
            projects : projects,
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500")
    }
    
});

authRoutes.get('/reset-password' , loginLimiter , (req , res)=>{
    try{
        return res.render("forgot-password")
    }catch(e){
        console.log(e.message)
        return res.status(500).render("500")
    }
})

authRoutes.post('/reset-password' , loginLimiter , async(req , res)=>{
    try{
        const {email} = req.body
        const user = await getUserByEmail(email) 

        if(!user){
            console.log(`Invalid email !!`)
            return res.status(401).redirect('/login')
        }

        const userId = user.user_id
        const isCode = await getCode(userId) 

        console.log('type: ',isCode)
        console.log('Length : ',isCode.length)
        
        if(isCode !== null){
            await deleteCode(userId)
        }
        
        const originalCode = await sendmail(email)
        const store = await storeCode(userId , email , String(originalCode))

        console.log(`Code sent is : ${originalCode}`)

        return res.redirect(`/verify-code/${userId}`)

    }catch(e){
        console.log(e.message)
        return res.status(500).render('500')
    }
})

authRoutes.get('/verify-code/:id' , (req , res)=>{
    try{
        const userId = req.params.id
        return res.render("verify-code" , {
            userId : userId
        })
    }catch(e){
        console.log(e.message)
        return res.status(500).render("500")
    }
})

authRoutes.post('/verify-code/:id' , async(req , res)=>{
    try{
        const userId = req.params.id
        const receivedCode = req.body.code
        const isValid = await checkCode(userId , receivedCode)

        if(!isValid){
            console.log(`Code never match !!`)
            return res.status(401).redirect(`/verify-code/${userId}`)
        }
        
        await deleteCode(userId)
        return res.status(200).redirect('/login')
        
    }catch(e){
        console.log(e.message)
        return res.status(500)
    }
})

authRoutes.get('/login' ,(req , res)=>{
    try{
        return res.render("login" , {
        title : "ProjectHub Login",
        error : "Invalid passowrd or email"
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

authRoutes.post('/login' , loginLimiter , async (req , res)=>{
    try{
        const {role , email , password} = req.body;
        const userRole = Number(role);
        const user = await getUser(userRole , email , password);
        
        if(!email || typeof email !== 'string'){
            return res.status(400).send("Invalid input");
        }

        else{
            if(user && userRole === 3){
                req.session.studentId = user.user_id;
                req.session.save((err) => {
                    if (err){
                        console.log(err.message);
                        return res.status(500).render("500");
                    } 
                    return res.redirect('/student/homepage');
                });
            }
            else if(user && userRole === 2){
                req.session.advisorId = user.user_id;
                req.session.save((err) => {
                    if (err){
                        console.log(err.message);
                        return res.status(500).render("500");  
                    } 
                    return res.redirect('/advisor/dashboard');
                });
            }
            else{
                console.log('Wrong credentials');
                return res.redirect('/login');
            }
        }

    }catch(e){  
        console.log(e.message);
        return res.status(500).render("500");
    }
 
});

authRoutes.get('/signup' , async(req , res)=>{
    try{
        return res.render("signup" , {
        title : "Create Account"
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
});

authRoutes.post('/signup' , async (req , res)=>{
    try{
        const {role , username , age , email , department , password , confirm_password} = req.body;

        if(password != confirm_password){
            console.log('Inorrect password');
            return res.redirect('/signup');
        }

        const user = await createUser(role , username , age ,email , department , password);
        if(user && role === '3'){
            req.session.studentId = user.insertId;
            const studentId = user.insertId;
            await createStudentRow(studentId);
            return res.redirect('/student/homepage');
        }
        else if(user && role === '2'){
            req.session.advisorId = user.insertId;
            const advisorId = user.insertId;
            await createAdvisorRow(advisorId) 
            return res.redirect('/advisor/dashboard');
        }
        else{
            return res.status(422).send("Validation failed!");
        } 
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
        
});

authRoutes.get('/logout' , (req , res) =>{
    try{
        req.session.destroy((error)=>{
            if(error){
                console.log(error.message);
                return res.status(500).render("500");
            }

            res.clearCookie('connect.sid');
            return res.redirect('/login');
        });
    }catch(e){
        console.log(e.message);
        return res.status(500).render("500");
    }
    
})



module.exports = authRoutes;