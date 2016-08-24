var dashboardData = {};
var commitInfo = {};
var baselines = {};
var counts = {};
var totals = {};


var getTestStatuses = function(jsonTasks, project) {
	var status = {}
	// for each task in the data, get the metrics of the selected baseline. 
	_.each(jsonTasks, function(task){
		var counts = _.countBy($scope.getBaselineData(task, project), function(t){return t.state.toLowerCase();});
		_.each(counts, function(key){
			if (status[key]){
				status[key] += counts[key];
			} else {
				status[key] = counts[key];
			}
		});
	});
	counts[project] = status;
};
// gets the dashboard for the app level by performing a get for 
// each project id and populating the dashboard data
var getAppDashboard = function(){
	console.log("here");
	// get the latest version data for the whole dashboard
	$.get("/plugin/json/version/latest/dashboard/", $window.dashboardProjects)
		.success(function(data){
			_.each($window.dashboardProjects, function(project, index){
				dashboardData[project] = data[index].json_tasks;
				commitInfo[project] = data[index].commit_info;
				baselines[project] = _.pluck(data[index].json_tasks.baselines, 'version');
				getTestStatuses(data[index].json_tasks, project);
			});
			ReactDOM.render(
			  <Root dashboardData={dashboardData}
			  	 	commitInfo={commitInfo} 
			  	 	projects={window.dashboardProjects}
			  	 	counts={counts}
			  	 	totals={totals}
			  	 	baselines={baselines}
			  	 	userTz={window.userTz} 
				></Root>,
			  document.getElementById('root')
			);
		})
}

getAppDashboard();

