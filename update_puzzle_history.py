# standard
import argparse
import json
import os
from datetime import datetime, timedelta

# pip
from tqdm import tqdm
from dotenv import load_dotenv

# local
from stats_and_streaks import get_stats_and_streaks_from_history
from template_writer import render_stats_and_streaks

# remote
from nyt_crossword_stats.fetch_puzzle_stats import DATE_FORMAT, login, batch_process_puzzle_overview, process_puzzle_detail

load_dotenv()


def get_date_str(date_object):
    return datetime.strftime(date_object, DATE_FORMAT)


def get_date_obj(date_string):
    return datetime.strptime(date_string, DATE_FORMAT)


def get_cookie():
    username = os.getenv("NYT_USERNAME")
    password = os.getenv("NYT_PASSWORD")
    cookie = os.getenv("NYT_COOKIE")
    cookie_date = os.getenv("NYT_COOKIE_DATE")
    cookie_date = None if cookie_date == "" else cookie_date
    today = datetime.now()

    if not cookie_date or get_date_obj(cookie_date) < today - timedelta(days=1):
        if not username:
            print("\nNeed NYT login information")
            username = input("User id (email) : ")
            password = input("Password : ")

        cookie = login(username, password)
        cookie_date = get_date_str(today)
        with open(".env", "w") as f:
            f.write(f"NYT_USERNAME={username}\nNYT_PASSWORD={password}\nNYT_COOKIE={cookie}\nNYT_COOKIE_DATE={cookie_date}")

    return cookie


def update_puzzle_details(puzzle_overview, updated_overview, cookie):
    count = 0
    for updated in tqdm(updated_overview):
        for puzzle in puzzle_overview:
            if puzzle["print_date"] == updated["print_date"] and puzzle["solved"] != updated["solved"]:
                puzzle.update(process_puzzle_detail(updated, cookie))
                count += 1

    if count:
        print(f"Updated {count} puzzles to solved")

    return puzzle_overview


def update_puzzle_overview(puzzle_overview, puzzle_type, start_date, cookie, update_old=False):
    """
    Strategy:
    1. Always look for new puzzles and add to end of overview
    2. Always update changes to incomplete or not started puzzles within current set
        starting at oldest of (incomplete, not_started after a solve)
        ending at newest of (incomplete, not_started)
    3. If update_old update changes prior to newest of (incomplete, solved) within existing set
    4. If update_old and start_date outside existing add old puzzles to start of overview 
    """

    puzzles_solved = [get_date_obj(puzzle["print_date"]) for puzzle in puzzle_overview if puzzle["solved"]]
    oldest_solved = min(puzzles_solved)

    puzzles_incomplete, puzzles_not_started = [], []
    for puzzle in puzzle_overview:
        if not puzzle["solved"]:
            if puzzle["percent_filled"] > 0:
                puzzles_incomplete.append(get_date_obj(puzzle["print_date"]))
            elif puzzle["percent_filled"] == 0 and get_date_obj(puzzle["print_date"]) > oldest_solved:
                puzzles_not_started.append(get_date_obj(puzzle["print_date"]))

    today = get_date_obj(get_date_str(datetime.now()))
    newest_puzzle = max(puzzles_solved + puzzles_incomplete + puzzles_not_started)
    oldest_puzzle = min(puzzles_solved + puzzles_incomplete + puzzles_not_started)

    if newest_puzzle < today:
        print("\nAdding new puzzles")
        new_overview = batch_process_puzzle_overview(puzzle_type, newest_puzzle + timedelta(days=1), today, cookie)
        for puzzle in tqdm(new_overview):
            puzzle = process_puzzle_detail(puzzle, cookie)

        puzzle_overview.extend(new_overview)

    puzzles_update = puzzles_incomplete + puzzles_not_started
    if puzzles_update != []:
        update_start = min(puzzles_update)
        update_end =  max(puzzles_update)

        print("\nUpdating incomplete and not started puzzles")
        puzzle_overview = update_puzzle_details(
            puzzle_overview,
            batch_process_puzzle_overview(puzzle_type, update_start, update_end, cookie),
            cookie)

    if update_old:
        old_end = min([oldest_solved] + puzzles_not_started)
        if old_end != [] and oldest_puzzle < old_end:
            print("\nUpdating old puzzles")
            puzzle_overview = update_puzzle_details(
                puzzle_overview,
                batch_process_puzzle_overview(puzzle_type, oldest_puzzle, old_end  - timedelta(days=1), cookie),
                cookie)

        if update_old and start_date < oldest_puzzle:
            print("\nAdding old puzzles")
            old_overview = batch_process_puzzle_overview(puzzle_type, start_date, oldest_puzzle - timedelta(days=1), cookie)
            for puzzle in tqdm(old_overview):
                puzzle = process_puzzle_detail(puzzle, cookie)

            puzzle_overview[:0] = old_overview

    return puzzle_overview


def fetch_puzzle_overview(puzzle_type, start_date, end_date, update_old=False):
    cookie = get_cookie()
    filepath = f"{puzzle_type}-history.json"

    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            puzzle_overview = json.load(f)

        puzzle_overview = update_puzzle_overview(puzzle_overview, puzzle_type, start_date, cookie, update_old)

    else:
        print(f"Fetching {puzzle_type} puzzle history for first time.")
        puzzle_overview = batch_process_puzzle_overview(puzzle_type, start_date, end_date, cookie)
        for puzzle in tqdm(puzzle_overview):
            puzzle = process_puzzle_detail(puzzle, cookie)

    with open(filepath, "w") as f:
        json.dump(puzzle_overview, f)

    return puzzle_overview


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update NYT Crossword stats")
    parser.add_argument(
        "-s", "--start-date", default=datetime.strftime(datetime.now() - timedelta(days=30), DATE_FORMAT),
        help="The first date to pull from, inclusive (defaults to 30 days ago)",
        )
    parser.add_argument(
        "-e", "--end-date", default=datetime.strftime(datetime.now(), DATE_FORMAT),
        help="The last date to pull from, inclusive (defaults to today)",
        )
    parser.add_argument(
        "-o", "--update_old",  action="store_true",
        help="Flag to check for updates prior to oldest solve/incomplete",
        )
    parser.add_argument(
        "-t", "--type", default="daily",
        help='The type of puzzle data to fetch. Valid values are "daily", "bonus", and "mini" (defaults to daily)',
        )

    args = parser.parse_args()
    puzzle_type = args.type
    start_date = get_date_obj(args.start_date)
    end_date = get_date_obj(args.end_date)
    update_old = args.update_old
    filename = f"{args.type}-stats.html"

    puzzle_history = fetch_puzzle_overview(puzzle_type, start_date, end_date, update_old)
    stats_and_streaks = get_stats_and_streaks_from_history(puzzle_history)

    # print(stats_and_streaks)
    render_stats_and_streaks(filename, puzzle_type, **stats_and_streaks)