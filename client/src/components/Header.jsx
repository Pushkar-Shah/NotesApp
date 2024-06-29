/* eslint-disable no-unused-vars */
import React from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import  {useCookies} from 'react-cookie'
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
function Header() {

  const [cookie,setCookie,removeCookie] = useCookies(null);
  const authToken = cookie.AuthToken;
  const username = cookie.Username;

  function handleClick(){
    console.log("signout");
        removeCookie('Email');
        removeCookie('AuthToken');
        removeCookie('User')
        removeCookie('Username');
        window.location.reload();
  }

  return (
    <div>
    <header id = "header">
      <h1>
        <HighlightIcon fontSize="medium" /> Notes App    
      </h1> 
      {authToken &&<div className='username-container'>
      <h1 className='username'> Welcome {username}</h1>
      </div>}
    </header>
    {authToken && <p className="signout"> <Button variant="contained" color="error" onClick={handleClick}>
    Sign Out <LogoutIcon/>
  </Button></p>}
  </div>
  );
}

export default Header;
