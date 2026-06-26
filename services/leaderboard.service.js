import { redis } from "../config/redis.js";

export const getLeaderboard = async (contestId, page = 1, limit = 10) => {
    try{
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const data = await redis.zrevrange(
        `leaderboard:${contestId}`,
        start,
        end,
        "WITHSCORES"
    );

    const leaderboard = [];

    for (let i = 0; i < data.length; i += 2) {
        leaderboard.push({
            rank: start + (i / 2) + 1,
            userId: data[i],
            score: Number(data[i + 1])
        });
    }

    return leaderboard;
    }catch(error){
        console.error(error);
        throw error;
    }
};

export const getUserRank = async (contestId, userId) => {
    try{
    const rank = await redis.zrevrank(
        `leaderboard:${contestId}`,
        userId.toString()
    );

    const score = await redis.zscore(
        `leaderboard:${contestId}`,
        userId.toString()
    );

    return {
        rank: rank !== null ? rank + 1 : null,
        score: Number(score || 0)
    };
    }catch(error){
        console.error(error);
        throw error;
    }
};