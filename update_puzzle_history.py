# standard
import argparse
import json
import os
from datetime import datetime, timedelta

# pip
from tqdm import tqdm
from dotenv import load_dotenv

# remote
from nyt_crossword_stats.fetch_puzzle_stats import DATE_FORMAT, get_puzzle_stats, get_v3_puzzle_detail, login

load_dotenv()

puzzle_type = "mini"
start_date = "2024-04-01"
end_date = "2024-11-24"
update_old = False


def get_date_str(date_object):
    return datetime.strftime(date_object, DATE_FORMAT)


def get_date_obj(date_string):
    return datetime.strptime(date_string, DATE_FORMAT)


def get_cookie():
    username = os.getenv("NYT_USERNAME")
    password = os.getenv("NYT_PASSWORD")
    cookie = os.getenv("NYT_COOKIE")
    cookie_date = os.getenv("NYT_COOKIE_DATE")
    if cookie_date == "": cookie_date = None
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


def get_puzzle_details(puzzle):
    if puzzle["solved"] == True:
        detail = get_v3_puzzle_detail(puzzle_id=puzzle["puzzle_id"], cookie=cookie)
        puzzle["solving_seconds"] = detail.get("secondsSpentSolving", None)
    else:
        puzzle["solving_seconds"] = None

    puzzle["day_of_week_name"] = datetime.strptime(puzzle["print_date"], DATE_FORMAT).strftime("%A")
    puzzle["day_of_week_integer"] = datetime.strptime(puzzle["print_date"], DATE_FORMAT).strftime("%w")

    return puzzle


def update_puzzle_details(puzzle_overview, updated_overview):
    count = 0
    for updated in tqdm(updated_overview):
        for puzzle in puzzle_overview:
            if puzzle["print_date"] == updated["print_date"] and puzzle["solved"] != updated["solved"]:
                puzzle.update(get_puzzle_details(updated))
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

    start_date = get_date_obj(start_date)

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

    update_start = min(puzzles_incomplete + puzzles_not_started)
    update_end =  max(puzzles_incomplete + puzzles_not_started)
    old_end = min([oldest_solved] + puzzles_not_started)

    if newest_puzzle < today:
        print("\nAdding new puzzles")
        new_overview = get_puzzle_stats(puzzle_type, newest_puzzle + timedelta(days=1), today, cookie)
        for puzzle in tqdm(new_overview):
            puzzle = get_puzzle_details(puzzle)

        puzzle_overview.extend(new_overview)

    if update_start and update_end and update_start <= update_end:
        print("\nUpdating incomplete and not started puzzles")
        puzzle_overview = update_puzzle_details(
            puzzle_overview,
            get_puzzle_stats(puzzle_type, update_start, update_end, cookie))

    if update_old:
        if old_end and oldest_puzzle <= old_end:
            print("\nUpdating old puzzles")
            puzzle_overview = update_puzzle_details(
                puzzle_overview,
                get_puzzle_stats(puzzle_type, oldest_puzzle, old_end  - timedelta(days=1), cookie))

        if update_old and start_date < oldest_puzzle:
            print("\nAdding old puzzles")
            old_overview = get_puzzle_stats(puzzle_type, start_date, oldest_puzzle - timedelta(days=1), cookie)
            for puzzle in tqdm(old_overview):
                puzzle = get_puzzle_details(puzzle)

            puzzle_overview[:0] = old_overview

    return puzzle_overview


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


if __name__ == "__main__":
    args = parser.parse_args()
    puzzle_type = args.type
    start_date = args.start_date
    end_date = args.end_date
    update_old = args.update_old

    cookie = get_cookie()
    filepath = f"{puzzle_type}-history.json"

    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            puzzle_overview = json.load(f)

        puzzle_overview = update_puzzle_overview(puzzle_overview, puzzle_type, start_date, cookie, update_old)

    else:
        print(f"Fetching {puzzle_type} puzzle history for first time.")
        puzzle_overview = get_puzzle_stats(puzzle_type, start_date, end_date, cookie)
        for puzzle in tqdm(puzzle_overview):
            puzzle = get_puzzle_details(puzzle)

    with open(filepath, "w") as f:
        json.dump(puzzle_overview, f)