// utility functions
const timeHoursMinutes = timeSeconds => {
    const hours = Math.floor(timeSeconds / 3600),
        minutes = Math.floor(timeSeconds % 3600 / 60),
        minutesPad = minutes < 10 ? "0".concat(minutes) : minutes,
        seconds = Math.floor(timeSeconds % 60),
        secondsPad = seconds < 10 ? "0".concat(seconds) : seconds;

    return hours > 0 ? [hours, minutesPad, secondsPad].join(":") : "".concat(minutes, ":").concat(secondsPad)
},

setBarSize = (currentTime, fastestTime, slowestTime) => {
    const scaleFactor = (currentTime - fastestTime) / (slowestTime - fastestTime);

    return {
        height: 70 + 205 * scaleFactor,
        width: 80 + 240 * scaleFactor
    }
};

// build stats display
const updateStatsInfo = statsAndStreaks => {
    let {
        stats,
        streaks
    } = statsAndStreaks;

    const todayWeekday = "Wednesday"; //f()().format("dddd"),
    const timesBest = stats.stats_by_day.map((statsAndStreaks => statsAndStreaks.best_time));

    return {
        today: todayWeekday,
        puzzlesSolved: stats.puzzles_solved,
        solveRate: "".concat(Math.round(100 * stats.solve_rate * 10) / 10, "%"),
        currentStreak: streaks.current_streak,
        longestStreak: streaks.longest_streak,
        fastestTime: Math.min(...timesBest),
        slowestTime: Math.max(stats.longest_avg_time, stats.longest_latest_time),
        byDay: stats.stats_by_day.map((statsAndStreaks => ({
            label: statsAndStreaks.label,
            isToday: statsAndStreaks.label === todayWeekday,
            averageTime: statsAndStreaks.avg_time,
            bestTime: statsAndStreaks.best_time,
            bestDate: "2017-05-22", //f()(statsAndStreaks.best_date).format("MM-DD-YYYY"),
            latestTime: statsAndStreaks.this_weeks_time
        })))
    }
};

var buildStatsSummary = statsInfo => {
    let {
        puzzlesSolved,
        solveRate,
        currentStreak,
        longestStreak
    } = statsInfo;

    const section = document.createElement("section");
        section.id = "stats-overview";
    const header = document.createElement("h1");
        header.className = "stats-header";
        header.textContent = "Your Statistics";
    const container = document.createElement("div");
        container.className = "container cf";

    function createStatBlock(headerText, value, icon = false) {
        const statBlock = document.createElement("div");
            statBlock.className = `single-stat`;
        if (icon) {
            const iconDiv = document.createElement("div");
                iconDiv.className = "icon-stats-streak";
            statBlock.appendChild(iconDiv);
        };
        const statValue = document.createElement("h2");
            statValue.textContent = value;
        const statLabel = document.createElement("p");
            statLabel.textContent = headerText;

        statBlock.appendChild(statValue);
        statBlock.appendChild(statLabel);

        return statBlock;
    }

    container.appendChild(createStatBlock("Puzzles Solved", puzzlesSolved));
    container.appendChild(createStatBlock("Solve Rate", solveRate));
    container.appendChild(createStatBlock("Current Streak", currentStreak, true));
    container.appendChild(createStatBlock("Longest Streak", longestStreak, true));

    section.append(header, container);

    return section;
};

var buildStatsDay = dayInfo => {
    const {
        label,
        isToday,
        averageTime,
        latestTime,
        bestTime,
        bestDate,
        fastestTime,
        slowestTime
    } = dayInfo,

    latestTimeHeight = setBarSize(latestTime, fastestTime, slowestTime),
    bestTimeHeight = setBarSize(bestTime, fastestTime, slowestTime),
    averageTimeHeight = setBarSize(averageTime, fastestTime, slowestTime),
    isTodayString = isToday ? "Today" : "This Week",
    bestDateBottom = bestTimeHeight.height + 8,
    bestDateLeft = bestTimeHeight.width + 40,
    latestTimeString = 0 !== latestTime ? timeHoursMinutes(latestTime) : "--:--",
    bestTimeString = timeHoursMinutes(bestTime),
    averageTimeString = timeHoursMinutes(averageTime);

    const singleDay = document.createElement("div");
        singleDay.className = `single-day${isToday ? " active" : ""}`;
    const dayOfWeek = document.createElement("p");
        dayOfWeek.className = "day-of-week";
    const dayFirst = document.createElement("span");
        dayFirst.className = "day-first";
        dayFirst.textContent = label.substring(0, 1);
    const dayTail = document.createElement("span");
        dayTail.className = "day-tail";
        dayTail.textContent = label.substring(1);

    dayOfWeek.append(dayFirst, dayTail);
    singleDay.append(dayOfWeek);

    if (averageTime === 0) {
        ["time-bar today no-stats", "time-bar best no-stats", "time-bar average no-stats"].forEach(className => {
            const bar = document.createElement("div");
            bar.className = className;
            singleDay.append(bar);
        });
    } else {
        const latestBar = document.createElement("div");
            latestBar.className = "time-bar today";
            latestBar.style.height = latestTimeHeight.height + "px";
            latestBar.style.width = latestTimeHeight.width + "px";
        const latestTime = document.createElement("p");
            latestTime.className = "time";
            latestTime.textContent = latestTimeString;
        const latestText = document.createElement("p");
            latestText.textContent = isTodayString;

        latestBar.append(latestTime, latestText);

        const bestDateElem = document.createElement("p");
            bestDateElem.className = "best-date";
            bestDateElem.style.bottom = bestDateBottom + "px";
            bestDateElem.style.left = bestDateLeft + "px";
            bestDateElem.textContent = bestDate;
        const bestBar = document.createElement("div");
            bestBar.className = "time-bar best";
            bestBar.style.height = bestTimeHeight.height + "px";
            bestBar.style.width = bestTimeHeight.width + "px";
        const bestTime = document.createElement("p");
            bestTime.className = "time";
            bestTime.textContent = bestTimeString;
        const bestText = document.createElement("p");
            bestText.textContent = "Best";

        bestBar.append(bestTime, bestText);

        const averageBar = document.createElement("div");
            averageBar.className = "time-bar average";
            averageBar.style.height = averageTimeHeight.height + "px";
            averageBar.style.width = averageTimeHeight.width + "px";

            const condensed = document.createElement("div");
                condensed.className = "condensed";
            const latestCondensed = document.createElement("p");
                latestCondensed.innerHTML = `T <span class="time">${latestTimeString}</span>`;
            const bestCondensed = document.createElement("p");
                bestCondensed.innerHTML = `B <span class="time">${bestTimeString}</span>`;
            const averageCondensed = document.createElement("p");
                averageCondensed.innerHTML = `A <span class="time">${averageTimeString}</span>`;
            condensed.append(latestCondensed, bestCondensed, averageCondensed);

            const expanded = document.createElement("div");
                expanded.className = "expanded";
            const averageTimeElem = document.createElement("p");
                averageTimeElem.className = "time";
                averageTimeElem.textContent = averageTimeString;
            const averageText = document.createElement("p");
                averageText.textContent = "Average";
            expanded.append(averageTimeElem, averageText);

        averageBar.append(condensed, expanded);

        singleDay.append(latestBar, bestDateElem, bestBar, averageBar);
    }

    return singleDay
};

var buildStatsDaily = statsInfo => {
    const {
        byDay,
        fastestTime,
        slowestTime
    } = statsInfo;

    const section = document.createElement("section");
        section.id = "weekly-stats";
    const header = document.createElement("h1");
        header.className = "stats-subheader";
        header.textContent = "Daily Solve Times";
    const container = document.createElement("div");
        container.className = "container clearfix";

    dayElements = byDay.map(dayInfo => buildStatsDay({
        key: dayInfo.label,
        label: dayInfo.label,
        fastestTime: fastestTime,
        slowestTime: slowestTime,
        bestDate: dayInfo.bestDate,
        bestTime: dayInfo.bestTime,
        latestTime: dayInfo.latestTime,
        averageTime: dayInfo.averageTime,
        isToday: dayInfo.isToday
    }));

    dayElements.forEach(dayElement => container.appendChild(dayElement));
    section.append(header, container)

    return section
};

const applyEvent = () => {
    document.querySelectorAll(".single-day").forEach(element => {
        element.addEventListener("click", (() => {
            (element => {
                let elementActive = (document.querySelectorAll(".active.single-day") || [])[0];
                elementActive && elementActive.classList.remove("active"),
                elementActive = element,
                elementActive.classList.add("active")
            })(element)
        }))
    })
}

const dummyStats = updateStatsInfo({
    stats: {
        longest_avg_time: 1268,
        longest_latest_time: 310,
        puzzles_attempted: 645,
        puzzles_solved: 345,
        solve_rate: .651,
        stats_by_day: [{
            avg_denominator: 7,
            avg_time: 533,
            best_date: "2017-05-22",
            best_time: 300,
            label: "Monday",
            latest_date: "2017-06-26",
            latest_time: 355,
            this_weeks_time: 355
        }, {
            avg_denominator: 7,
            avg_time: 733,
            best_date: "2017-05-23",
            best_time: 265,
            label: "Tuesday",
            latest_date: "2017-06-27",
            latest_time: 555,
            this_weeks_time: 555
        }, {
            avg_denominator: 7,
            avg_time: 933,
            best_date: "2017-05-24",
            best_time: 465,
            label: "Wednesday",
            latest_date: "2017-06-28",
            latest_time: 755,
            this_weeks_time: 755
        }, {
            avg_denominator: 4,
            avg_time: 1104,
            best_date: "2017-02-23",
            best_time: 604,
            label: "Thursday",
            latest_date: "2017-02-23",
            latest_time: 904,
            this_weeks_time: 904
        }, {
            avg_denominator: 11,
            avg_time: 1368,
            best_date: "2017-04-28",
            best_time: 828,
            label: "Friday",
            latest_date: "2017-04-28",
            latest_time: 1128,
            this_weeks_time: 1128
        }, {
            avg_denominator: 4,
            avg_time: 1517,
            best_date: "2017-03-11",
            best_time: 1005,
            label: "Saturday",
            latest_date: "2017-03-25",
            latest_time: 1310,
            this_weeks_time: 1310
        }, {
            avg_denominator: 7,
            avg_time: 1033,
            best_date: "2017-03-12",
            best_time: 604,
            label: "Sunday",
            latest_date: "2017-03-26",
            latest_time: 755,
            this_weeks_time: 755
        }]
    },
    streaks: {
        msg: "Start date <date_start> is empty",
        current_streak: 1,
        longest_streak: 12
    }
});

// execute stats display
async function fetchStatsInfo() {
    let statsAndStreaks = await fetch("./stats-and-streaks.json")
        .then(response => response.json())
        .then(json => json.results);

    return statsAndStreaks
};

async function fetchPuzzleHistory() {
    let statsAndStreaks = await fetch("./data.json")
        .then(response => response.json());

    console.log(statsAndStreaks)

    return statsAndStreaks
};

function buildStatsContent(statsInfo) {
    const statsRoot = document.getElementById("stats-root");
    while (statsRoot.lastElementChild) {
        statsRoot.removeChild(statsRoot.lastElementChild);
    }

    const content = document.createElement("div");
        content.className = "stats-content";
    content.append(buildStatsSummary(statsInfo), buildStatsDaily(statsInfo));
    statsRoot.appendChild(content);

    applyEvent()
};

async function renderStatsContent() {
    const timeout = 5000;
    let statsInfo = dummyStats;

    try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout))
        statsInfo = await Promise.race([fetchStatsInfo(), timeoutPromise]);
        statsInfo = updateStatsInfo(statsInfo);
    } catch (error) {
        console.error("Failed to fetch stats info:", error);
    }

    buildStatsContent(statsInfo)
};

// process scraped data
function getMostRecentMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7
    const mostRecentMonday = new Date(today);
    mostRecentMonday.setDate(today.getDate() - daysSinceMonday);
    return mostRecentMonday;
};

function isDateThisWeek(monday, dateToCheck) {
    const providedDate = new Date(dateToCheck);

    monday.setHours(0, 0, 0, 0);
    providedDate.setHours(0, 0, 0, 0);

    return providedDate >= monday;
};

async function getStatsAndStreaks() {
    const puzzleHistory = await fetchPuzzleHistory()

    return {
        stats: getStatsFromHistory(puzzleHistory),
        streaks: getStreaksFromHistory(puzzleHistory)
    }
};

function getStatsFromHistory(puzzleHistory) {
    const mostRecentMonday = getMostRecentMonday()
    let groupedDays = []
    let statsByDay = []

    puzzleHistory.forEach(puzzle => {
        let dayOfWeekInteger = puzzle.day_of_week_integer
        dayOfWeekInteger = dayOfWeekInteger > 0 ? dayOfWeekInteger - 1 : 6

        if (!groupedDays[dayOfWeekInteger]) {
            groupedDays[dayOfWeekInteger] = [];
        }
        groupedDays[dayOfWeekInteger].push(puzzle);
    });

    groupedDays.forEach((day, i) => {
        const puzzlesAttempted = day.map(day => day.percent_filled > 0 ? 1 : 0)
            .reduce((sum, number) => sum + number, 0);

        const puzzlesSolved = day.map(day => day.solved ? 1 : 0)
        const puzzleTimes = day.map(day => day.solving_seconds)
                                .filter((_, index) => puzzlesSolved[index]);
        const puzzleDatesText = day.map(day => day.print_date)
                                .filter((_, index) => puzzlesSolved[index]);

        const puzzleDates = puzzleDatesText.map(date => new Date(date).getTime());
        const bestTime = Math.min(...puzzleTimes);
        const latestDateIndex = puzzleDates.indexOf(Math.max(...puzzleDates));
        const latestDate = puzzleDatesText[latestDateIndex];
        const latestTime = puzzleTimes[latestDateIndex];

        statsByDay.push({
            puzzles_attempted : puzzlesAttempted,
            avg_denominator: puzzleTimes.length,
            avg_time: Math.ceil(puzzleTimes.reduce((sum, num) => sum + num, 0) / puzzleTimes.length),
            best_date: puzzleDatesText[puzzleTimes.indexOf(bestTime)],
            best_time: bestTime,
            label: day[0].day_of_week_name,
            latest_date: latestDate,
            latest_time: latestTime,
            this_weeks_time: isDateThisWeek(mostRecentMonday, latestDate) ? latestTime : 0
        })
    });

    const puzzlesSolved = statsByDay.map(statsByDay => statsByDay.avg_denominator)
        .reduce((sum, number) => sum + number, 0);
    const puzzlesAttempted = statsByDay.map(statsByDay => statsByDay.puzzles_attempted)
    .reduce((sum, number) => sum + number, 0);

    return {
        longest_avg_time: Math.max(...statsByDay.map(statsByDay => statsByDay.avg_time)),
        longest_latest_time: Math.max(...statsByDay.map(statsByDay => statsByDay.latest_time)),
        puzzles_attempted: puzzlesAttempted,
        puzzles_solved: puzzlesSolved,
        solve_rate: Math.round(puzzlesSolved / puzzlesAttempted  * 1000) / 1000,
        stats_by_day: statsByDay
    }
};

function getStreaksFromHistory(puzzleHistory) {
    return {
        current_streak: 0,
        longest_streak: 0
    }
};

console.log(getStatsAndStreaks())
renderStatsContent()