import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Video, Image } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../features/post/postSlice";
import "../PostStyles/CreatePost.css"

function CreatePost() {
    const {loading} = useSelector(state=>state.post)
    const [postVideoFile, setPostVideoFile] = useState(null);
    const [postThumbnail, setPostThumbnail] = useState(null);
    const [duration, setDuration] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublished, setIsPublished] = useState(true);

    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();

        const myForm = new FormData();

        myForm.append("title", title);
        myForm.append("description", description);
        myForm.append("duration", duration);
        myForm.append("postFile", postVideoFile);
        myForm.append("thumbnail", postThumbnail);
        myForm.append("isPublished", isPublished);

        dispatch(createPost(myForm));
    };

    return (
        <div className="create-post-page">

            {/* Top Bar */}
            <div className="create-post-topbar">

                <Link
                    to="/profile"
                    className="back-btn"
                >
                    <ArrowLeft size={26} />
                </Link>

                <h1>Create Post</h1>

                <div></div>

            </div>

            {/* Form */}
            <form
                className="create-post-form"
                onSubmit={handleSubmit}
            >

                {/* Video */}
                <div className="form-section">

                    <label className="form-label">
                        <Video size={20} />
                        Video
                    </label>

                    <input
                        type="file"
                        name="postFile"
                        accept="video/*"
                        onChange={(e) =>
                            setPostVideoFile(e.target.files[0])
                        }
                    />

                </div>

                {/* Thumbnail */}
                <div className="form-section">

                    <label className="form-label">
                        <Image size={20} />
                        Thumbnail
                    </label>

                    <input
                        type="file"
                        name="thumbnail"
                        accept="image/*"
                        onChange={(e) =>
                            setPostThumbnail(e.target.files[0])
                        }
                    />

                </div>

                {/* Title */}
                <div className="form-section">

                    <label htmlFor="title">
                        Title
                    </label>

                    <input
                        id="title"
                        type="text"
                        name="title"
                        placeholder="Enter your title"
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                    />

                </div>

                {/* Description */}
                <div className="form-section">

                    <label htmlFor="description">
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        rows="6"
                        placeholder="Write a description..."
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />

                </div>

                {/* Duration */}
                <div className="form-section">

                    <label htmlFor="duration">
                        Duration
                    </label>

                    <input
                        id="duration"
                        type="number"
                        name="duration"
                        placeholder="Duration in seconds"
                        value={duration}
                        onChange={(e) =>
                            setDuration(e.target.value)
                        }
                    />

                </div>

                {/* Published */}
                <div className="publish-section">

                    <input
                        id="isPublished"
                        type="checkbox"
                        name="isPublished"
                        checked={isPublished}
                        onChange={(e) =>
                            setIsPublished(e.target.checked)
                        }
                    />

                    <label htmlFor="isPublished">
                        Publish this post
                    </label>

                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="submit-post-btn"
                    disabled={loading}
                >

                    {loading
                        ? "Createing Post..."
                        : "Create Post"}

                </button>

            </form>

        </div>
    );
}

export default CreatePost;