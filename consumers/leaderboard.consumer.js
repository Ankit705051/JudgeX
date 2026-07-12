import Redis from "ioredis";
import { contestParticipant } from "../schema/contestParticipant.js";

const subscriber = new Redis();
const redis = new Redis();

async function startLeaderboardConsumer() {
    await subscriber.subscribe("contest-score-updated");

    console.log("leaderboard consumer started ...");

    subscriber.on("message", async (channel, message) => {
        try{
            const data=JSON.parse(message);
            const{
                contestId,
                userId,
            }=data;

            // Get the participant to get their total score
            const participant = await contestParticipant.findOne({
                contestId,
                userId
            });

            if (participant) {
                const leaderboardKey=`leaderboard:${contestId}`;
                // Update with total score, not incremental score
                await redis.zadd(leaderboardKey, participant.score, userId.toString());

                console.log(`Updated leaderboard for contest ${contestId} with user ${userId} and total score ${participant.score}`);
            }
        }catch(error){
            console.error("Error processing leaderboard update:", error);
        }
    });
}

startLeaderboardConsumer();
