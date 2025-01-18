# standard
import json
import math
from datetime import date, timedelta


## helpers
def is_date_this_week(date_to_check):
    """Get most recent monday and check if supplied date is this week"""
    today = date.today()
    days_since_monday = (today.day + 6) % 7
    monday = today - timedelta(days_since_monday)

    return date.fromisoformat(date_to_check) >= monday


## process puzzle history
def get_stats_and_streaks_from_history(puzzle_history=None):
    """Produces output similar to the nyt crossword stats-and-streaks.json"""
    if puzzle_history is None:
        with open("./mini-history.json", "r") as f:
            puzzle_history = json.load(f)

    return {
        "stats": get_stats_from_history(puzzle_history),
        "streaks": get_streaks_from_history(puzzle_history),
    }


def get_stats_from_history(puzzle_history):
    """Calculate stats from puzzle history
    
    Summarizes solved puzzle stats by day of week
    """
    grouped_days = [[] for _ in range(7)]

    for puzzle in puzzle_history:
        day_of_week_integer = (
            int(puzzle["day_of_week_integer"]) - 1
            if int(puzzle["day_of_week_integer"]) > 0
            else 6
        )

        grouped_days[day_of_week_integer].append(puzzle)

    stats_by_day = []
    for grouped_day in grouped_days:
        puzzles_attempted = sum(
            [1 if day["percent_filled"] > 0 else 0 for day in grouped_day]
        )
        puzzles_solved = [day for day in grouped_day if day["solved"]]
        puzzle_times = [day["solving_seconds"] for day in puzzles_solved]
        puzzle_dates_text = [day["print_date"] for day in puzzles_solved]
        puzzle_dates = [date.fromisoformat(text) for text in puzzle_dates_text]

        avg_time = 0
        best_time = 0
        latest_time = 0
        this_weeks_time = 0

        # not sure what the actual null values are for these
        best_date = 0
        latest_date = 0

        if len(puzzles_solved):
            avg_time = math.ceil(sum(puzzle_times) / len(puzzle_times))
            best_time = min(puzzle_times)
            best_date = puzzle_dates_text[puzzle_times.index(best_time)]
            latest_date_index = puzzle_dates.index(max(puzzle_dates))
            latest_date = puzzle_dates_text[latest_date_index]
            latest_time = puzzle_times[latest_date_index]
            this_weeks_time = (
                latest_time if is_date_this_week(latest_date) else 0
            )

        stats_by_day.append(
            {
                "puzzles_attempted": puzzles_attempted,
                "avg_denominator": len(puzzle_times),
                "avg_time": avg_time,
                "best_date": best_date,
                "best_time": best_time,
                "label": grouped_day[0]["day_of_week_name"],
                "latest_date": latest_date,
                "latest_time": latest_time,
                "this_weeks_time": this_weeks_time,
            }
        )

    puzzles_solved = sum([day["avg_denominator"] for day in stats_by_day])
    puzzles_attempted = sum([day["puzzles_attempted"] for day in stats_by_day])

    return {
        "longest_avg_time": max([day["avg_time"] for day in stats_by_day]),
        "longest_latest_time": max([day["latest_time"] for day in stats_by_day]),
        "puzzles_attempted": puzzles_attempted,
        "puzzles_solved": puzzles_solved,
        "solve_rate": round(puzzles_solved / puzzles_attempted * 1000) / 1000,
        "stats_by_day": stats_by_day,
    }


def get_streaks_from_history(puzzle_history):
    """Calculate streaks from puzzle history"""
    # todo
    return {"current_streak": 0, "longest_streak": 0}
