module.exports = {
    selfDefinedStatus: ["running", "waiting", "done", "overdue", "terminated", "error"],

    launchedStatus: {
        running: {name: "RUNNING", target: "flow", status: "RUNNING"},
        waiting: {name: "FORCAST", target: "review"},
        done: {name: "HISTORY", target: "flow", status: "RUNNING"},
        overdue: {name: "OVERDUE", target: "flow"},
        terminated: {name: "TERMINATED", target: "flow", status: "TERMINATED"},
        error: {name: "ERROR", target: "flow", status: "ERROR"}
    },
    joinedStatus: {
        running: {name: "RUNNING", target: "review", type: "TODO"},
        waiting: {name: "FORCAST", target: "review", type: "FORCAST"},
        done: {name: "HISTORY", target: "review", status: "HISTORY"},
        overdue: {name: "OVERDUE", target: "review"},
        terminated: {name: "TERMINATED", target: "flow", status: "TERMINATED"},
        error: {name: "ERROR", target: "flow", status: "ERROR"}
    },

    flowStatus: {running: "RUNNING", completed: "COMPLETED", error: "ERROR", terminated: "TERMINATED"},
    reviewType: {todo: "TODO", forecast: "FORCAST", history: "HISTORY"}


}