/* eslint-disable no-unused-vars */
import React, {useState} from "react";
import Header from "./Header";
import Footer from "./Footer";
import Button from '@mui/material/Button';
function Home(){
        
       return <div >
        <Header/>
        <div className="home" >
         <i className="fas fa-key fa-6x"></i>
         <h1 className="display-3">Notes App</h1>
         {/* <p className="lead"></p> */}
         {/* < Button className="btn btn-light btn-lg">Register</Button>
         < Button className="btn btn-light btn-lg">Login</Button> */}
         
         <a className="btn btn-light btn-lg" href="/register" role="button">Register</a>
         <a className="btn btn-dark btn-lg" href="/login" role="button">Login</a>
     
     </div>
     <Footer/>
     </div> 
}

export default Home;