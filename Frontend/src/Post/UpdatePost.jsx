import React, { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Video, Image } from "lucide-react";


import { useDispatch, useSelector } from "react-redux";

import {
    getPostById,
    updatePost,
    deletePost
} from "../features/post/postSlice";
import "../PostStyles/UpdatePost.css"


function UpdatePost() {

    const [postVideoFile, setPostVideoFile] = useState(null);
    const [postThumbnail, setPostThumbnail] = useState(null);

    const [duration, setDuration] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [isPublished, setIsPublished] = useState(true);

    const [postThumbnailPrev, setPostThumbnailPrev] = useState("");

    const { post, loading, error, success } =
        useSelector((state) => state.post);

    const dispatch = useDispatch();

    const { postId } = useParams();

    const navigate = useNavigate();


    // Get existing post
    useEffect(() => {

        dispatch(getPostById(postId));

    }, [dispatch, postId]);


    // Put existing post data into inputs
    useEffect(() => {

        if (post) {

            setTitle(post.title || "");

            setDescription(post.description || "");

            setDuration(post.duration || "");

            setIsPublished(post.isPublished ?? true);

            setPostThumbnailPrev(post.thumbnail || "");
        }

    }, [post]);


    //delete post
    const handleDeletePost = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this post?"
        );

        if (!confirmDelete) return;

        try {
            await dispatch(deletePost(postId)).unwrap();

            navigate("/myPosts");
        } catch (error) {
            console.log("Delete failed:", error);
        }
    };


    // Update post
    const updatePostSubmit = (e) => {

        e.preventDefault();

        const myData = new FormData();

        myData.set("title", title);

        myData.set("duration", duration);

        myData.set("description", description);

        myData.set("isPublished", isPublished);


        // Send new video only if selected
        if (postVideoFile) {

            myData.set("postFile", postVideoFile);

        }


        // Send new thumbnail only if selected
        if (postThumbnail) {

            myData.set("thumbnail", postThumbnail);

        }


        dispatch(
            updatePost({
                postId: postId,
                formData: myData
            })
        );
    };


    // After successful update
    useEffect(() => {

        if (success) {

            navigate("/myPosts");

        }

    }, [success, navigate]);


    return (

        <div className="create-post-page">

            {/* Top Bar */}

            <div className="create-post-topbar">

                <Link
                    to="/myPosts"
                    className="back-btn"
                >
                    <ArrowLeft size={26} />
                </Link>

                <h1>Update Post</h1>

                <div></div>

            </div>


            <form
                className="create-post-form"
                onSubmit={updatePostSubmit}
            >

                {/* Current Video */}

                <div className="form-section">

                    <label className="form-label">

                        <Video size={20} />

                        Current Video

                    </label>


                    {post?.postFile && (

                        <video
                            src={post.postFile}
                            controls
                            width="100%"
                        />

                    )}

                </div>


                {/* Change Video */}

                <div className="form-section">

                    <label className="form-label">

                        <Video size={20} />

                        Change Video

                    </label>


                    <input
                        type="file"
                        name="postFile"
                        accept="video/*"
                        onChange={(e) =>
                            setPostVideoFile(
                                e.target.files[0]
                            )
                        }
                    />

                </div>


                {/* Current Thumbnail */}

                <div className="form-section">

                    <label className="form-label">

                        <Image size={20} />

                        Current Thumbnail

                    </label>


                    {postThumbnailPrev && (

                        <img
                            src={postThumbnailPrev}
                            alt="Current thumbnail"
                            width="250"
                        />

                    )}

                </div>


                {/* Change Thumbnail */}

                <div className="form-section">

                    <label className="form-label">

                        <Image size={20} />

                        Change Thumbnail

                    </label>


                    <input
                        type="file"
                        name="thumbnail"
                        accept="image/*"
                        onChange={(e) =>
                            setPostThumbnail(
                                e.target.files[0]
                            )
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
                        value={title}
                        placeholder="Enter your title"
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
                        value={description}
                        placeholder="Write a description..."
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
                        value={duration}
                        placeholder="Duration in seconds"
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
                            setIsPublished(
                                e.target.checked
                            )
                        }
                    />


                    <label htmlFor="isPublished">
                        Publish this post
                    </label>

                </div>


                {/* Error */}

                {error && (
                    <p className="form-error">
                        {error}
                    </p>
                )}


                {/* Submit */}

                <button
                    type="submit"
                    className="submit-post-btn"
                    disabled={loading}
                >

                    {loading
                        ? "Updating..."
                        : "Update Post"}

                </button>
                <button
                    type="button"
                    className="delete-post-btn"
                    onClick={handleDeletePost}
                    disabled={loading}
                >
                    Delete Post
                </button>

            </form>

        </div>
    );
}

export default UpdatePost;