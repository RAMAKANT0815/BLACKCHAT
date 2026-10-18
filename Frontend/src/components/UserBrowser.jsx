import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    getShadows,
    getShadowing,
    getMultipleShadowStatus,
    shadowUser,
    unshadowUser
} from "../features/shadow/shadowSlice";
import { getRandomUsers } from "../features/user/userSlice";

import "../componentStyles/UserBrowser.css";

function UserBrowser({ type, userId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    // Logged-in user
    const { user } = useSelector((state) => state.user);

    // For profile pages use logged-in user,
    // for /user/:userId pages use URL userId
    const currentUserId = userId || params.userId || user?._id;

    const {
        shadowsByUser,
        shadowingByUser,
        shadowStatusByUser,
        loadingByUser,
        loading,
        error
    } = useSelector((state) => state.shadow);

    const { randomUsers } = useSelector((state) => state.user);


    // =========================
    // FETCH LIST
    // =========================

    useEffect(() => {
        if (type === "random") {
            dispatch(getRandomUsers());
            return;
        }

        if (!currentUserId) return;

        if (type === "shadows") {
            dispatch(getShadows(currentUserId));
        }

        if (type === "shadowing") {
            dispatch(getShadowing(currentUserId));
        }

    }, [dispatch, type, currentUserId]);


    // =========================
    // SELECT USERS
    // =========================

    let users = [];

    if (type === "random") {
        users = randomUsers || [];
    }

    if (type === "shadows") {
        users = shadowsByUser[currentUserId] || [];
    }

    if (type === "shadowing") {
        users = shadowingByUser[currentUserId] || [];
    }


    // =========================
    // GET SHADOW STATUS
    // =========================

    useEffect(() => {
        if (users.length === 0) return;

        const userIds = users.map(
            (user) => user._id
        );

        dispatch(
            getMultipleShadowStatus(userIds)
        );

    }, [dispatch, users.length, type, currentUserId]);


    // =========================
    // SHADOW
    // =========================

    const handleShadow = (targetUserId) => {
        dispatch(shadowUser(targetUserId));
    };


    // =========================
    // UNSHADOW
    // =========================

    const handleUnshadow = (targetUserId) => {
        dispatch(unshadowUser(targetUserId));
    };


    // =========================
    // EMPTY MESSAGE
    // =========================

    let emptyMessage = "No users found";

    if (type === "shadows") {
        emptyMessage = "No shadows yet";
    }

    if (type === "shadowing") {
        emptyMessage = "Not shadowing anyone";
    }


    // =========================
    // UI
    // =========================

    return (
        <div className="user-browser">

            {loading && (
                <div className="user-browser-loading">
                    Loading...
                </div>
            )}

            {error && (
                <div className="user-browser-error">
                    {error}
                </div>
            )}

            {!loading && users.length === 0 && (
                <div className="user-browser-empty">
                    {emptyMessage}
                </div>
            )}

            {!loading && users.length > 0 && (
                <div className="user-browser-list">

                    {users.map((user) => {

                        const isShadowing =
                            shadowStatusByUser[user._id] || false;

                        const isLoading =
                            loadingByUser[user._id] || false;

                        return (
                            <div
                                className="user-browser-card"
                                key={user._id}
                                onClick={() =>
                                    navigate(`/user/${user._id}`)
                                }
                            >

                                <img
                                    src={
                                        user.avatar ||
                                        "/default-avatar.png"
                                    }
                                    alt={user.username}
                                    className="user-browser-avatar"
                                />

                                <span className="user-browser-username">
                                    {user.username}
                                </span>

                                <button
                                    className={`user-browser-button ${
                                        isShadowing
                                            ? "unshadow"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        if (isShadowing) {
                                            handleUnshadow(user._id);
                                        } else {
                                            handleShadow(user._id);
                                        }
                                    }}
                                >
                                    {isLoading
                                        ? "Processing..."
                                        : isShadowing
                                            ? "Unshadow"
                                            : "Shadow"
                                    }
                                </button>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default UserBrowser;