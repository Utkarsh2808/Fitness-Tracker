/**
 * Scoring Engine - Core business logic for performance scoring
 * Calculates scores based on task weights and completion percentages
 */

import { Task, DailyEntry } from '@/types';
import { progressLogRepository } from './progressLogRepository';
import { dailyEntryRepository } from './dailyEntryRepository';
import { taskRepository } from './taskRepository';

export interface DailyScoreCalculation {
  date: Date;
  score: number;
  maxScore: number;
  completedTasks: number;
  totalTasks: number;
  taskScores: Array<{
    taskId: string;
    taskName: string;
    weight: number;
    completionPercentage: number;
    contribution: number;
  }>;
  projectScores: Record<string, number>;
}

export const scoringEngine = {
  /**
   * Calculate daily score for a specific date
   * Score Formula: SUM(Task Completion Percentage × Task Weight)
   */
  async calculateDailyScore(date: Date): Promise<DailyScoreCalculation> {
    const tasks = await taskRepository.getAllTasks();

    if (tasks.length === 0) {
      return {
        date,
        score: 0,
        maxScore: 0,
        completedTasks: 0,
        totalTasks: 0,
        taskScores: [],
        projectScores: {},
      };
    }

    let totalScore = 0;
    let maxScore = 0;
    let completedTasks = 0;
    const taskScores: DailyScoreCalculation['taskScores'] = [];
    const projectScores: Record<string, number> = {};

    // Calculate score for each task
    for (const task of tasks) {
      // Get total progress for this task on this date
      const totalProgress = await progressLogRepository.getTotalProgressByTaskIdAndDate(task.id, date);

      // Calculate completion percentage
      const completionPercentage = Math.min((totalProgress / task.targetValue) * 100, 100);

      // Calculate contribution to score
      const contribution = (completionPercentage / 100) * task.weight;

      totalScore += contribution;
      maxScore += task.weight;

      if (completionPercentage >= 100) {
        completedTasks++;
      }

      taskScores.push({
        taskId: task.id,
        taskName: task.name,
        weight: task.weight,
        completionPercentage,
        contribution,
      });

      // Calculate project scores
      if (!projectScores[task.projectId]) {
        projectScores[task.projectId] = 0;
      }
      projectScores[task.projectId] += contribution;
    }

    // Normalize project scores to 0-100
    for (const projectId in projectScores) {
      const projectTasks = tasks.filter((t) => t.projectId === projectId);
      const projectMaxScore = projectTasks.reduce((sum, t) => sum + t.weight, 0);
      if (projectMaxScore > 0) {
        projectScores[projectId] = (projectScores[projectId] / projectMaxScore) * 100;
      }
    }

    return {
      date,
      score: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      maxScore,
      completedTasks,
      totalTasks: tasks.length,
      taskScores,
      projectScores,
    };
  },

  /**
   * Calculate average score over a date range
   */
  async calculateAverageScore(startDate: Date, endDate: Date): Promise<number> {
    let totalScore = 0;
    let dayCount = 0;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const score = await this.calculateDailyScore(currentDate);
      totalScore += score.score;
      dayCount++;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dayCount > 0 ? totalScore / dayCount : 0;
  },

  /**
   * Calculate best and worst performing days in a date range
   */
  async findBestAndWorstDays(
    startDate: Date,
    endDate: Date
  ): Promise<{
    bestDay: { date: Date; score: number };
    worstDay: { date: Date; score: number };
  }> {
    let bestDay = { date: new Date(startDate), score: 0 };
    let worstDay = { date: new Date(startDate), score: 100 };

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const score = await this.calculateDailyScore(currentDate);

      if (score.score > bestDay.score) {
        bestDay = { date: new Date(currentDate), score: score.score };
      }

      if (score.score < worstDay.score) {
        worstDay = { date: new Date(currentDate), score: score.score };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { bestDay, worstDay };
  },

  /**
   * Get completion statistics for a task over a date range
   */
  async getTaskCompletionStats(
    taskId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    completionRate: number;
    totalCompletions: number;
    totalDays: number;
    averageProgress: number;
    trend: 'improving' | 'declining' | 'stable';
  }> {
    const entries = await dailyEntryRepository.getDailyEntriesByTaskIdAndDateRange(
      taskId,
      startDate,
      endDate
    );

    let dayCount = 0;
    let completionCount = 0;
    let totalProgress = 0;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dayCount++;
      const entry = entries.find(
        (e) =>
          new Date(e.date).toDateString() === new Date(currentDate).toDateString()
      );

      if (entry?.isCompleted) {
        completionCount++;
      }

      if (entry) {
        totalProgress += entry.achievedValue;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate trend (first half vs second half)
    const midpoint = Math.floor(dayCount / 2);
    let firstHalfCompletions = 0;
    let secondHalfCompletions = 0;

    entries.forEach((entry, index) => {
      if (entry.isCompleted) {
        if (index < midpoint) {
          firstHalfCompletions++;
        } else {
          secondHalfCompletions++;
        }
      }
    });

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfCompletions > firstHalfCompletions) {
      trend = 'improving';
    } else if (secondHalfCompletions < firstHalfCompletions) {
      trend = 'declining';
    }

    return {
      completionRate: dayCount > 0 ? (completionCount / dayCount) * 100 : 0,
      totalCompletions: completionCount,
      totalDays: dayCount,
      averageProgress: dayCount > 0 ? totalProgress / dayCount : 0,
      trend,
    };
  },

  /**
   * Find most and least consistent tasks in a date range
   */
  async findMostAndLeastConsistentTasks(
    taskIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<{
    mostConsistent: { taskId: string; completionRate: number };
    leastConsistent: { taskId: string; completionRate: number };
  }> {
    let mostConsistent = { taskId: '', completionRate: 0 };
    let leastConsistent = { taskId: '', completionRate: 100 };

    for (const taskId of taskIds) {
      const stats = await this.getTaskCompletionStats(taskId, startDate, endDate);

      if (stats.completionRate > mostConsistent.completionRate) {
        mostConsistent = { taskId, completionRate: stats.completionRate };
      }

      if (stats.completionRate < leastConsistent.completionRate) {
        leastConsistent = { taskId, completionRate: stats.completionRate };
      }
    }

    return { mostConsistent, leastConsistent };
  },
};

export default scoringEngine;
