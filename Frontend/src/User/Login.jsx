import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import "../UserStyles/Auth.css"; // Adjusted import path to match your directory structure

import { login, removeError, removeSuccess } from "../features/user/userSlice";

function Login() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    const {
        success,
        error,
        loading,
        isAuthenticated
    } = useSelector((state) => state.user);

    const dispatch = useDispatch();

    const navigate = useNavigate();


    const loginDataChange = (e) => {

        if (e.target.name === "username") {
            setUsername(e.target.value);
        }

        if (e.target.name === "password") {
            setPassword(e.target.value);
        }
    };


    const loginSubmit = (e) => {

        e.preventDefault();

        if (!username || !password) {

            toast.error("Please fill all the fields", {
                position: "top-right",
                duration: 3000
            });

            return;
        }

        console.log("username", username);
        console.log("password", password);

        dispatch(login({ username, password }));

    };


    useEffect(() => {

        if (error) {

            toast.error(error, {
                position: "top-right",
                duration: 3000
            });

            dispatch(removeError());
        }

    }, [dispatch, error]);


    useEffect(() => {

        if (success) {

            toast.success("Login successful", {
                position: "top-right",
                duration: 3000
            });

            dispatch(removeSuccess());
        }

        

    }, [dispatch, success, navigate, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/profile");
        }
    }, [isAuthenticated, navigate]);
    
    return (
        <div className="form-container">

            <div className="container">

                <div className="form-content">

                    <form
                        className="form"
                        onSubmit={loginSubmit}
                    >

                        <h2>Login</h2>

                        <div className="input-group">

                            <input
                                type="text"
                                placeholder="Enter Username"
                                name="username"
                                value={username}
                                onChange={loginDataChange}
                            />

                        </div>


                        <div className="input-group">

                            <input
                                type="password"
                                placeholder="Enter Password"
                                name="password"
                                value={password}
                                onChange={loginDataChange}
                            />

                        </div>


                        <button
                            type="submit"
                            className="authBtn"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>


                        <p className="form-links">

                            Don't have an account?

                            <Link
                                to="/register"
                                className="pointer"
                            >
                                Register
                            </Link>

                        </p>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Login;

