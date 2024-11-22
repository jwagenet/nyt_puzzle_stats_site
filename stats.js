// utility functions
const timeHoursMinutes = timeSeconds => {
    const hours = Math.floor(timeSeconds / 3600),
        minutes = Math.floor(timeSeconds % 3600 / 60),
        minutesPad = minutes < 10 ? "0".concat(minutes) : minutes,
        seconds = Math.floor(timeSeconds % 60),
        secondsPad = seconds < 10 ? "0".concat(seconds) : seconds;
    return hours > 0 ? [hours, minutesPad, secondsPad].join(":") : "".concat(minutes, ":").concat(secondsPad)
},

setBarHeight = (currentTime, fastestTime, slowestTime) => {
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
    return a.createElement("section", {id: "stats-overview"},
        a.createElement("h1", {className: "stats-header"}, "Your Statistics"),
        a.createElement("div", {className: "container cf"},
            a.createElement("div", {className: "single-stat"},
                a.createElement("h2", null, puzzlesSolved),
                a.createElement("p", null, "Puzzles Solved")),
            a.createElement("div", {className: "single-stat"},
                a.createElement("h2", null, solveRate),
                a.createElement("p", null, "Solve Rate")),
            a.createElement("div", {className: "single-stat"},
                a.createElement("div", {className: "icon-stats-streak"}),
                a.createElement("h2", null, currentStreak),
                a.createElement("p", null, "Current Streak")),
            a.createElement("div", {className: "single-stat"},
                a.createElement("div", {className: "icon-stats-streak"}),
                a.createElement("h2", null, longestStreak),
                a.createElement("p", null, "Longest Streak"))))
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
    latestTimeHeight = setBarHeight(latestTime, fastestTime, slowestTime),
    bestTimeHeight = setBarHeight(bestTime, fastestTime, slowestTime),
    averageTimeHeight = setBarHeight(averageTime, fastestTime, slowestTime),
    isTodayString = isToday ? "Today" : "This Week",
    bestDateBottom = bestTimeHeight.height + 8,
    bestDateLeft = bestTimeHeight.width + 40,
    latestTimeString = 0 !== latestTime ? timeHoursMinutes(latestTime) : "--:--",
    bestTimeString = timeHoursMinutes(bestTime),
    averageTimeString = timeHoursMinutes(averageTime);
    return a.createElement("div", {className: y()("single-day", {active: isToday})},
        a.createElement("p", {className: "day-of-week"},
            a.createElement("span", {className: "day-first"}, label.substring(0, 1)),
            a.createElement("span", {className: "day-tail"}, label.substring(1))),
        0 === averageTime ? a.createElement(a.Fragment, null,
            a.createElement("div", {className: "time-bar today no-stats"}),
            a.createElement("div", {className: "time-bar best no-stats"}),
            a.createElement("div", {className: "time-bar average no-stats"})
        ) : a.createElement(a.Fragment, null,
            a.createElement("div", {className: "time-bar today",
                style: {
                    height: latestTimeHeight.height,
                    width: latestTimeHeight.width}},
            a.createElement("p", {className: "time"}, latestTimeString),
            a.createElement("p", null, isTodayString)),
            a.createElement("p", {className: "best-date",
                style: {
                    bottom: bestDateBottom,
                    left: bestDateLeft}}, bestDate),
            a.createElement("div", {className: "time-bar best",
                style: {
                    height: bestTimeHeight.height,
                    width: bestTimeHeight.width}},
            a.createElement("p", {className: "time"}, bestTimeString),
            a.createElement("p", null, "Best")),
            a.createElement("div", {className: "time-bar average",
                style: {
                    height: averageTimeHeight.height,
                    width: averageTimeHeight.width}},
            a.createElement("div", {className: "condensed"},
                a.createElement("p", null, "T ", a.createElement("span", {className: "time"}, latestTimeString)),
                a.createElement("p", null, "B ", a.createElement("span", {className: "time"}, bestTimeString)),
                a.createElement("p", null, "A ", a.createElement("span", {className: "time"}, averageTimeString))),
            a.createElement("div", {className: "expanded"},
            a.createElement("p", {className: "time"}, averageTimeString),
            a.createElement("p", null, "Average")))))
};

var buildStatsDaily = statsInfo => {
    (0, a.useEffect)((() => {
        document.querySelectorAll(".single-day").forEach((element => {
            element.addEventListener("click", (() => {
                (element => {
                    let elementActive = (document.querySelectorAll(".active.single-day") || [])[0];
                    elementActive && elementActive.classList.remove("active"),
                    elementActive = element,
                    elementActive.classList.add("active")
                })(element)
            }))
        }))
    }), []);

    const {
        byDay,
        fastestTime,
        slowestTime
    } = statsInfo;

    return a.createElement("section", {id: "weekly-stats"},
                a.createElement("div", {className: "header"},
                a.createElement("h1", {className: "stats-subheader"}, "Daily Solve Times")),
                a.createElement("div", {className: "container clearfix"},
                byDay.map((e => a.createElement(buildStatsDay, {
                        key: e.label,
                        label: e.label,
                        fastestTime: fastestTime,
                        slowestTime: slowestTime,
                        bestDate: e.bestDate,
                        bestTime: e.bestTime,
                        latestTime: e.latestTime,
                        averageTime: e.averageTime,
                        isToday: e.isToday
                    })))))
};

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
function updateStatsContent(statsInfo) {
    a.createElement("div", null,
        a.createElement("div", {className: "stats-content"},
            statsInfo && a.createElement(buildStatsSummary, statsInfo),
            statsInfo && a.createElement(buildStatsDaily, statsInfo)))
    };
    const statsRootElement = document.getElementById("stats-root");
    // (0, r.s)(statsRootElement).render(a.createElement(a.Fragment, null, a.createElement(G, null)), statsRootElement)


const updateStatsDisplays = async function() {
    let statsAndStreaks = await fetch("./stats-and-streaks.json")
        .then(response => response.json())
        .then(json => json.results);

    console.log(statsAndStreaks)
    console.log(g(statsAndStreaks))


    };

    updateStatsDisplays()
