import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { getAllPosts } from "../features/post/postSlice";
import ReelCard from "../components/ReelCard";
import "../pagesStyles/Home.css"

const Home = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        posts,
        loading,
        hasMore,
        skip,
        limit,
        error
    } = useSelector((state) => state.post);

    useEffect(() => {
        if (posts.length === 0) {
            dispatch(
                getAllPosts({
                    skip: 0,
                    limit: 10
                })
            );
        }
    }, [dispatch]);

    const loadMorePosts = () => {
        if (loading || !hasMore) return;

        dispatch(
            getAllPosts({
                skip,
                limit
            })
        );
    };

    return (
        <div className="home">

            {/* Top Bar */}
            <div className="home-header">

                <h2>BlackChat</h2>

                <button
                    className="message-button"
                    onClick={() => navigate("/chat")}
                >
                    <MessageCircle size={24} />
                </button>

            </div>


            {/* Reels */}
            <div className="reels-container">

                {posts.map((post) => (
                    <ReelCard
                        key={post._id}
                        post={post}
                    />
                ))}
            </div>


            {/* Loading */}
            {loading && (
                <p>Loading...</p>
            )}


            {/* Load More */}
            {hasMore && !loading && (
                <button
                    onClick={loadMorePosts}
                >
                    Load More
                </button>
            )}


            {/* Error */}
            {error && (
                <p>{error}</p>
            )}

        </div>
    );
};

export default Home;