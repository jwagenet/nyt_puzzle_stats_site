from datetime import date

from jinja2 import Environment, FileSystemLoader


def render_stats_and_streaks(filename, puzzle_type, stats, streaks):
    data = prep_stats_and_streaks(stats, streaks)

    environment = Environment(loader=FileSystemLoader("templates/"))
    stats_overview_template = environment.get_template("stats_overview.jinja")
    stats_overview = stats_overview_template.render(data)
    weekly_stats_template = environment.get_template("weekly_stats.jinja")
    weekly_stats = weekly_stats_template.render(data)
    page_template = environment.get_template("page.jinja")
    page = page_template.render(puzzle_type=puzzle_type, stats_overview=stats_overview, weekly_stats=weekly_stats)

    with open(filename, mode="w", encoding="utf-8") as f:
        f.write(page)


# data prep
def format_time(total_seconds):
    if total_seconds == 0:
        return "--:--"

    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    output = f"{hours:02}:"if hours > 0 else ""
    return output + f"{minutes:02}:{seconds:02}"


def set_bar_size(current_time, fastest_time, slowest_time):
    scale_factor = (current_time - fastest_time) / (slowest_time - fastest_time)

    # todo? magic numbers from
    return {
        "height": 70 + 205 * scale_factor,
        "width": 80 + 240 * scale_factor
    }

def prep_stats_and_streaks(stats, streaks):
    today_weekday = date.today().strftime("%A")
    best_times = [stat["best_time"] for stat in stats["stats_by_day"]]
    stats_by_day = []

    fastest_time = min(best_times)
    slowest_time = max([stats["longest_avg_time"], stats["longest_latest_time"]])

    for day in stats["stats_by_day"]:

        is_today = day["label"] == today_weekday
        latest_time_size = set_bar_size(day["this_weeks_time"], fastest_time, slowest_time)
        best_time_size = set_bar_size(day["best_time"], fastest_time, slowest_time)
        average_time_size= set_bar_size(day["avg_time"], fastest_time, slowest_time)
        best_date_text = date.fromisoformat(day["best_date"]).strftime("%Y-%m-%d") if day["best_date"] != 0 else ""

        stats_by_day.append({
            "label": day["label"],
            "is_today": is_today,
            "is_today_text": "Today" if is_today else "This Week",
            "latest_time_size": latest_time_size,
            "latest_time_text": format_time(day["this_weeks_time"]),
            "best_time_size": best_time_size,
            "best_time_text": format_time(day["best_time"]),
            "best_date_bottom": best_time_size["height"] + 8,
            "best_date_left": best_time_size["width"] + 40,
            "best_date_text": best_date_text,
            "average_time_size": average_time_size,
            "average_time_text": format_time(day["avg_time"]),
        })

    return {
        "today": today_weekday,
        "puzzles_solved": stats["puzzles_solved"],
        "solve_rate": f"{round(100 * stats['solve_rate'] * 10) / 10}%",
        "current_streak": streaks["current_streak"],
        "longest_streak": streaks["longest_streak"],
        "stats_by_day": stats_by_day
        }