import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import "../UserStyles/Auth.css"; // Adjusted import path to match your directory structure

import {
    register,
    removeError,
    removeSuccess
} from "../features/user/userSlice";

function Register() {

    const [formData, setFormData] = React.useState({
        username: "",
        password: ""
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        username,
        password
    } = formData;

    const {
        error,
        success,
        loading
    } = useSelector((state) => state.user);


    const registerDataChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const registerSubmit = (e) => {

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

        dispatch(register({ username, password }));
    };


    useEffect(() => {

        if (error) {

            toast.error(error, {
                position: "top-right",
                duration: 3000
            });

            dispatch(removeError());
        }

    }, [error, dispatch]);


    useEffect(() => {

        if (success) {

            toast.success("User registered successfully", {
                position: "top-right",
                duration: 3000
            });

            dispatch(removeSuccess());

            navigate("/login");
        }

    }, [success, dispatch, navigate]);


    return (
        <div className="form-container">

            <div className="container">

                <div className="form-content">

                    <form
                        className="form"
                        onSubmit={registerSubmit}
                    >

                        <h2>Register</h2>

                        <div className="input-group">

                            <input
                                type="text"
                                placeholder="Enter username"
                                name="username"
                                value={username}
                                onChange={registerDataChange}
                            />

                        </div>


                        <div className="input-group">

                            <input
                                type="password"
                                placeholder="Enter Password"
                                name="password"
                                value={password}
                                onChange={registerDataChange}
                            />

                        </div>


                        <button
                            type="submit"
                            className="authBtn"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>


                        <p className="form-links">

                            Already have an account?

                            <Link
                                className="pointer"
                                to="/login"
                            >
                                Login
                            </Link>

                        </p>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Register;

