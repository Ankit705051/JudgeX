import { contestParticipant } from "../schema/contestParticipant.js";
import { contestProblem } from "../schema/contestProblem.js";

export const updateContestScore = async (
    contestId,
    userId,
    problemId
) => {
    try {
        const participant =
            await contestParticipant.findOne({
                contestId,
                userId
            });

        if (!participant) {
            return;
        }

        const alreadySolved =
            participant.solvedProblem.some(
                p =>
                    p.problemId.toString() ===
                    problemId.toString()
            );

        if (alreadySolved) {
            return;
        }

        const contestProblemData =
            await contestProblem.findOne({
                contestId,
                problemId
            });

        if (!contestProblemData) {
            return;
        }

        const points =
            contestProblemData.points || 100;

        participant.score += points;

        participant.solvedProblem.push({
            problemId,
            score: points,
            solveDate: new Date()
        });

        await participant.save();

        console.log(
            `Contest score updated for user ${userId}`
        );
    } catch (error) {
        console.error(
            "Update Contest Score Error:",
            error
        );
    }
};