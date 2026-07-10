import { contest } from "../schema/contest.js";
import { Submission } from "../schema/submission.js";
    
export const getContestLeaderboard = async (contestId) => {
  try {
    // Verify contest exists and is ended
    const contests = await contest.findById(contestId);
    if (!contests) {
      throw new Error("Contest not found");
    }

    if (contests.status !== "ended") {
      throw new Error("Leaderboard is only available after contest ends");
    }

    // Get all submissions for this contest's problems
    const submissions = await Submission.find({
      problemId: { $in: contests.problems || [] },
      status: "accepted",
    }).populate("userId", "username email");

    // Calculate leaderboard
    const userStats = new Map();

    submissions.forEach((submission) => {
      const userId = submission.userId._id.toString();
      const user = submission.userId;

      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId,
          username: user.username,
          email: user.email,
          score: 0,
          problemsSolved: new Set(),
          totalTime: 0,
          lastSubmissionTime: new Date(0),
        });
      }

      const stats = userStats.get(userId);
      const problemId = submission.problemId.toString();

      // Only count first accepted submission per problem
      if (!stats.problemsSolved.has(problemId)) {
        stats.problemsSolved.add(problemId);
        stats.score += 100; // 100 points per problem
        stats.totalTime += submission.executionTime || 0;
        stats.lastSubmissionTime = new Date(
          Math.max(stats.lastSubmissionTime.getTime(), new Date(submission.createdAt).getTime())
        );
      }
    });

    // Convert to array and sort
    const leaderboard = Array.from(userStats.values()).map((stats) => ({
      userId: stats.userId,
      username: stats.username,
      email: stats.email,
      score: stats.score,
      problemsSolved: stats.problemsSolved.size,
      totalProblems: contests.problems?.length || 0,
      totalTime: stats.totalTime,
      lastSubmissionTime: stats.lastSubmissionTime,
    }));

    // Sort by score (descending), then by problems solved (descending), then by total time (ascending)
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
      if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime;
      return a.lastSubmissionTime - b.lastSubmissionTime;
    });

    return leaderboard;
  } catch (error) {
    throw error;
  }
};
