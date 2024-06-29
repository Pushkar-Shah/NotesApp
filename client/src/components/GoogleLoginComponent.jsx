import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const GoogleLoginComponent = () => {
  const { signIn, loaded } = useGoogleLogin({
    clientId,
    onSuccess: (response) => {
      console.log('Login Success:', response);
      // Handle the response here, e.g. send it to backend for authentication
    },
    onError: (error) => {
      console.error('Login Error:', error);
    },
    isSignedIn: true, // The user will be signed in by default
    // You can also enable useOneTap for faster login experience
    // useOneTap: true,
  });

  return (
    <div>
      {loaded ? (
        <button onClick={signIn}>Sign In with Google</button>
      ) : (
        <p>Loading Google SDK...</p>
      )}
    </div>
  );
};

export default GoogleLoginComponent;