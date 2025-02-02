import { useAuth0 } from "@auth0/auth0-react";
import { authAPI, api } from "../api/api.js";
import {Navigate, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";

const PostAuthenticate = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userRow, setUserRow] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try{
        const token = await getAccessTokenSilently();
        console.log(token);
        axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
        api.defaults.headers.common["authorization"] = `Bearer ${token}`;
        console.log("Axios initialized with token.");

        console.log("Axios Headers:", axios.defaults.headers.common);

        const userData = await authAPI.getCurrentUser();
        console.log("User data: ", userData);
        setUserRow(userData);
      }catch (e) {
        setError(e.response.data);
        console.error("Error initializing Axios or fetching user data:", e.response);
      }finally {
        setLoading(false)
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, getAccessTokenSilently])

  if(loading) return;

  //if not logged in
  if(!user){
    return <Navigate to="/" replace/>;
  }
  // const id = user.sub;

  const registerUser = async () => {
    try {
      await authAPI.register({
        email: user.email,
        username: user.username,
        role: "ORGANIZER",
      });
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register');
    }
  }

  const loginUser = async () => {
    try {
      const { data } = await authAPI.login();
      console.log(data);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to login');
    }
  }


  //If user already exists
  if(!error){
    loginUser();
  }else{  //new registration
    registerUser();
    // return <Navigate to="/register" replace/>;
  }


}

export default PostAuthenticate;