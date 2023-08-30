import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
import path from 'path'
import Jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const app=express();

mongoose.connect("mongodb://127.0.0.1:27017",{
   dbname:'userDetails'
}).then(()=>{console.log('Database connected')})
const userSchema=new mongoose.Schema({
   name:String,
   email:String,
   password:String
})
const User=mongoose.model('User',userSchema)
app.use(cookieParser())
app.use(express.static(path.join(path.resolve(),'public')))
app.use(express.urlencoded({extended:true}))
app.set('view engine','ejs')

const isauthnticate=async(req,res,next)=>{
   const {token}=req.cookies
   if(token){
      const decode=Jwt.verify(token,"asdfghhjjk")
      req.user=await User.findById(decode._id)
      next()
   }else{
      res.redirect('/login')
   }
}
app.get('/',isauthnticate,(req,res)=>{

   res.render('logout',{name:req.user.name})
})
app.get('/login',(req,res)=>{
   res.render('login')
})
app.get('/register',(req,res)=>{
   res.render('register')
})
app.post('/register',async(req,res)=>{
   const{name,email,password}=req.body
   const haspassword=await bcrypt.hash(password,10)
   let user=await User.create({name,email,password:haspassword})
   user=await User.findOne({email})
   if(user){
     return res.redirect('/login')
   }
   const token=Jwt.sign({_id:user._id},"asdfghhjjk")
   res.cookie('token',token,{
      httpOnly:true,
      expires:new Date(Date.now()+60*1000)
   })
   res.redirect('/')
})
app.post('/login',async(req,res)=>{
   const {email,password}=req.body
   const user=await User.findOne({email})
   if(!user){
      return res.redirect('/register')
   }

   const passmatch=bcrypt.compare(password, user.password)
   if(!passmatch)return res.render('login',{email,message:'incorect password'})
   const token=Jwt.sign({_id:user._id},"asdfghhjjk")
   res.cookie('token',token,{
      httpOnly:true,
      expires:new Date(Date.now()+60*1000)
   })
   res.redirect('/')
})
app.get('/logout',(req,res)=>{
   res.cookie('token',null,{
    httpOnly:true,
    expires:new Date(Date.now())
   })
   res.redirect('/')
})

app.listen(5000,()=>{
  console.log('Hello xpress in home page')
})
console.log(app)