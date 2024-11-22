const statsAndStreaks = fetch("./stats-and-streaks.json")
  .then(response => response.json())
  .then(json => json.results);

const g = e => {
    let {
        stats: t,
        streaks: n
    } = e;
    const a = "Wednesday" //f()().format("dddd"),
        r = t.stats_by_day.map((e => e.best_time));
    return {
        today: a,
        puzzlesSolved: t.puzzles_solved,
        solveRate: "".concat(Math.round(100 * t.solve_rate * 10) / 10, "%"),
        currentStreak: n.current_streak,
        longestStreak: n.longest_streak,
        fastestTime: Math.min(...r),
        slowestTime: Math.max(t.longest_avg_time, t.longest_latest_time),
        byDay: t.stats_by_day.map((e => ({
            label: e.label,
            isToday: e.label === a,
            averageTime: e.avg_time,
            bestTime: e.best_time,
            bestDate: "2017-05-22", //f()(e.best_date).format("MM-DD-YYYY"),
            latestTime: e.this_weeks_time
        })))
    }
},
_ = g({
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

var b = e => {
    const {
        puzzlesSolved: t,
        solveRate: n,
        currentStreak: r,
        longestStreak: s
    } = e;
    return a.createElement("section", {id: "stats-overview"},
        a.createElement("h1", {className: "stats-header"}, "Your Statistics"),
        a.createElement("div", {className: "container cf"},
            a.createElement("div", {className: "single-stat"},
                a.createElement("h2", null, t),
                a.createElement("p", null, "Puzzles Solved")),
            a.createElement("div", {className: "single-stat"},
                a.createElement("h2", null, n),
                a.createElement("p", null, "Solve Rate")),
            a.createElement("div", {className: "single-stat"},
                a.createElement("div", {className: "icon-stats-streak"}),
                a.createElement("h2", null, r),
                a.createElement("p", null, "Current Streak")),
            a.createElement("div", {className: "single-stat"},
                a.createElement("div", {className: "icon-stats-streak"}),
                a.createElement("h2", null, s),
                a.createElement("p", null, "Longest Streak"))))
};

const E = e => {
    const t = Math.floor(e / 3600),
        n = Math.floor(e % 3600 / 60),
        a = n < 10 ? "0".concat(n) : n,
        r = Math.floor(e % 60),
        s = r < 10 ? "0".concat(r) : r;
    return t > 0 ? [t, a, s].join(":") : "".concat(n, ":").concat(s)
},

w = (e, t, n) => {
    const a = (e - t) / (n - t);
    return {
        height: 70 + 205 * a,
        width: 80 + 240 * a
    }
};

var T = e => {
    const {
        label: t,
        isToday: n,
        averageTime: r,
        latestTime: s,
        bestTime: i,
        bestDate: o,
        fastestTime: l,
        slowestTime: c
    } = e,
    u = w(s, l, c),
    d = w(i, l, c),
    m = w(r, l, c),
    f = n ? "Today" : "This Week",
    v = d.height + 8,
    g = d.width + 40,
    _ = 0 !== s ? E(s) : "--:--",
    p = E(i), b = E(r);
    return a.createElement("div", {className: y()("single-day", {active: n})},
        a.createElement("p", {className: "day-of-week"},
            a.createElement("span", {className: "day-first"}, t.substring(0, 1)),
            a.createElement("span", {className: "day-tail"}, t.substring(1))),
        0 === r ? a.createElement(a.Fragment, null,
            a.createElement("div", {className: "time-bar today no-stats"}),
            a.createElement("div", {className: "time-bar best no-stats"}),
            a.createElement("div", {className: "time-bar average no-stats"})
        ) : a.createElement(a.Fragment, null,
            a.createElement("div", {className: "time-bar today",
                style: {
                    height: u.height,
                    width: u.width}},
            a.createElement("p", {className: "time"}, _),
            a.createElement("p", null, f)),
            a.createElement("p", {className: "best-date",
                style: {
                    bottom: v,
                    left: g}}, o),
            a.createElement("div", {className: "time-bar best",
                style: {
                    height: d.height,
                    width: d.width}},
            a.createElement("p", {className: "time"}, p),
            a.createElement("p", null, "Best")),
            a.createElement("div", {className: "time-bar average",
                style: {
                    height: m.height,
                    width: m.width}},
            a.createElement("div", {className: "condensed"},
                a.createElement("p", null, "T ", a.createElement("span", {className: "time"}, _)),
                a.createElement("p", null, "B ", a.createElement("span", {className: "time"}, p)),
                a.createElement("p", null, "A ", a.createElement("span", {className: "time"}, b))),
            a.createElement("div", {className: "expanded"},
            a.createElement("p", {className: "time"}, b),
            a.createElement("p", null, "Average")))))
};

var N = e => {
    (0, a.useEffect)((() => {
        document.querySelectorAll(".single-day").forEach((e => {
            e.addEventListener("click", (() => {
                (e => {
                    let t = (document.querySelectorAll(".active.single-day") || [])[0];
                    t && t.classList.remove("active"), t = e, t.classList.add("active")
                })(e)
            }))
        }))
    }), []);
    const {
        byDay: t,
        fastestTime: n,
        slowestTime: r
    } = e;
    return a.createElement("section", {id: "weekly-stats"},
                a.createElement("div", {className: "header"},
                a.createElement("h1", {className: "stats-subheader"}, "Daily Solve Times")),
                a.createElement("div", {className: "container clearfix"},
                    t.map((e => a.createElement(T, {
                        key: e.label,
                        label: e.label,
                        fastestTime: n,
                        slowestTime: r,
                        bestDate: e.bestDate,
                        bestTime: e.bestTime,
                        latestTime: e.latestTime,
                        averageTime: e.averageTime,
                        isToday: e.isToday
                    })))))
};

function x(e, t, n, a, r, s, i) {
    a.createElement("div", null,
        a.createElement("div", {className: "stats-content"},
            n && a.createElement(b, n),
            n && a.createElement(N, n)))
    };
    const C = document.getElementById("stats-root");
    // (0, r.s)(C).render(a.createElement(a.Fragment, null, a.createElement(G, null)), C)