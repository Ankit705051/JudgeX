import Redis from "ioredis";


const subscriber = new Redis();
const redis = new Redis();

async function startLeaderboardConsumer() {
    await subscriber.subscribe("contest-score-updated");
      
    console.log("leaderborad consumer started ...");

    subscriber.on("message", async (channel, message) => {
        try{
            const data=JSON.parse(message);
            const{
                contestId,
                userId,
                score,
            }=data;
            const leaderboradKey=`leaderboard:${contestId}`;
            await redis.zadd(leaderboradKey,score, userId);

            console.log(`Updated leaderboard for contest ${contestId} with user ${userId} and score ${score}`);
            
        }catch(error){
            console.error("Error processing leaderboard update:", error);
        }
    });
}

startLeaderboardConsumer();
