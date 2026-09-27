import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, ArrowLeft, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { editProfile, removeError, removeSuccess } from "../features/user/userSlice";
import "../UserStyles/EditProfile.css";

function EditProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Pulling all necessary state from Redux
    const { user, loading, error, success, message } = useSelector((state) => state.user);

    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    
    // We need two states for the avatar: one for the UI preview, one for the actual File object to send
    const [avatarPreview, setAvatarPreview] = useState("");
    const [avatarFile, setAvatarFile] = useState(null); 

    // Load existing user data into the form on mount
    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setBio(user.bio || "");
            setAvatarPreview(user.avatar || "");
        }
    }, [user]);

    // Handle toast notifications for success/error
    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: "top-right",
                autoClose: 3000,
            });
            dispatch(removeError());
        }

        if (success) {
            toast.success(message || "Profile updated successfully", {
                position: "top-right",
                autoClose: 3000,
            });
            dispatch(removeSuccess());
            navigate("/profile");
        }
    }, [dispatch, error, success, message, navigate]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Save the actual file object for the backend submission
            setAvatarFile(file);

            // Read as Data URL strictly for the frontend preview
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        
        // Correct Approach: Create FormData to match your "multipart/form-data" Redux header
        const myForm = new FormData();
        myForm.set("username", username);
        myForm.set("bio", bio);
        
        // Only append the avatar if the user actually uploaded a new one
        if (avatarFile) {
            myForm.set("avatar", avatarFile);
        }

        // Dispatch the form data to the thunk
        dispatch(editProfile(myForm));
    };

    return (
        <div className="edit-profile-container">
            <div className="topbar">
                <Link to="/profile" className="back-btn">
                    <ArrowLeft size={28} />
                </Link>
                <h1>Edit Profile</h1>
                <div style={{ width: 28 }}></div> {/* Spacer for centering */}
            </div>

            <form className="edit-form" onSubmit={handleUpdateProfile}>
                <div className="avatar-section">
                    <div className="avatar-wrapper">
                        <img 
                            src={avatarPreview || "/default-avatar.png"} 
                            alt="Avatar Preview" 
                        />
                        <label className="avatar-upload-label">
                            <Camera size={20} className="camera-icon" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                hidden
                            />
                        </label>
                    </div>
                </div>

                <div className="input-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose an untraceable alias"
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="A brief description..."
                        rows="4"
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>

            <div className="security-section">
                <hr className="divider" />
                <Link to="/update/password" className="btn-update-password">
                    <Lock size={18} />
                    Update Password
                </Link>
            </div>
        </div>
    );
}

export default EditProfile;