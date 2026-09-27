import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword, removeError, removeSuccess } from '../features/user/userSlice';
import '../UserStyles/UpdatePassword.css';
import { toast } from "sonner";

function UpdatePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Pulling state variables from Redux instead of local state
    const { loading, error, success } = useSelector((state) => state.user);

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        
        // Corrected Approach: Send a standard object to match your JSON headers
        const passwordData = {
            oldPassword: oldPassword,
            newPassword: newPassword
        };
        
        dispatch(updatePassword(passwordData));
    }

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: "top-right",
                autoClose: 3000,
            });
            dispatch(removeError());
        }
        if (success) {
            toast.success("Password updated successfully", {
                position: "top-right",
                autoClose: 3000,
            });
            dispatch(removeSuccess());
            navigate("/profile");
        }
    }, [dispatch, error, success, navigate]);

    return (
        <div className="update-password-container">
            <div className="topbar">
                <Link to="/edit-profile" className="back-btn">
                    <ArrowLeft size={28} />
                </Link>
                <h1>Security</h1>
                <div style={{ width: 28 }}></div> {/* Spacer for alignment */}
            </div>

            <div className="security-icon-wrapper">
                <Lock size={48} className="lock-icon" />
                <p>Update your encryption credentials</p>
            </div>

            <form className="password-form" onSubmit={handlePasswordUpdate}>
                <div className="input-group">
                    <label>Old Password</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                    />
                </div>

                <div className="input-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={8}
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn-submit-password"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}

export default UpdatePassword;