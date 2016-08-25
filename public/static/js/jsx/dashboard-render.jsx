var dashboardData = {};
var commitInfo = {};
var baselines = {};
var counts = {};

// gets the dashboard for the app level by performing a get for 
// each project id and populating the dashboard data
var getAppDashboard = function(){

	// get the latest version data for the whole dashboard
		_.each($window.dashboardProjects, function(projectName){
			$http.get("/plugin/json/version/latest/" + projectName + "/dashboard/")
				.success(function(d){
					dashboardData[projectName] = d.json_tasks;
					commitInfo[projectName] = d.commit_info;
					setInitialBaselines(d.json_tasks, projectName);
				})
		})
}

ReactDOM.render(
  <Root dashboardData={dashboardData}
  	 	commitInfo={commitInfo} 
  	 	projects={window.dashboardProjects} 
  	 	userTz={window.userTz} 
	></Root>,
  document.getElementById('root')
);
