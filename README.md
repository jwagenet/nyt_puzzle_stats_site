# NYT Puzzle Stats Site

A clone of the NYT daily crossword statistics page to supply your own stats (in my case the mini).

## Setup

```bash
git submodule update --init
pip install -r ./nyt_crossword_stats/requirements.txt
```

## Usage

Update (or initialize) puzzle history:
```bash
py update_puzzle_history.py -t "mini" -s "2024-04-01"
```

Look for older puzzles not in the initial set:
```bash
py update_puzzle_history.py -t "mini" -s "2024-01-01" --update_old
```

Open `mini-stats.html`