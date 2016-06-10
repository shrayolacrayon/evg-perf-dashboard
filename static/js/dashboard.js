mciModule.controller('DashboardController', function PerfController($scope, $window, $http, $location){

	$scope.status_list = ["pass", "forced accept", "undesired", "unacceptable", "no info"];

	$scope.dashboardProjects = $window.dashboardProjects;
	if ($window.version){
		$scope.version = $window.version.Version;	
	}

  	$scope.conf = $window.plugins["dashboard"];
	$scope.counts = {};

	$scope.baselines = {};
	$scope.currentBaseline = {};
	$scope.baselineData = [];

	$scope.dashboardData = {};
	$scope.commitInfo = {};
	$scope.total = {};

	$scope.hidePassingTasks = false;

	// gets the color class associated with the state
	$scope.getColor = function(state){
		if (state){
			return "dashboard-" + state.toLowerCase().split(" ").join("-")
		}	
	};

	$scope.getWidth = function(state, project){
		if ($scope.counts[project]){
			return ($scope.counts[project][state.toLowerCase()] / $scope.total[project]) * 100 + "%";
		}
	}

	$scope.getOrder = function(test){
		return _.indexOf($scope.status_list, test.state);
	};

	$scope.filterPassed = function(test){
		if ($scope.hidePassingTasks){
			return test.state != 'pass';
		}
		return true;
	}
	$scope.getNumberPassing = function(project, task){
		return _.filter($scope.getBaselineData(task, project), function(t){
			return t.state == 'pass';
		}).length;
	}
	$scope.allPassing = function(project, task){

		return $scope.hidePassingTasks && $scope.getNumberPassing(project, task) == $scope.getBaselineData(task,project).length;
	}

	$scope.getBaselines = function(baseline, project){
		return baseline[project];
	}

	$scope.showProgress = function() {
		return !_.isEmpty($scope.counts);
	};

	$scope.getData = function(project){
		return $scope.dashboardData[project];
	}

	$scope.getColWidth = function(){
		return "col-lg-" + (12/$scope.dashboardProjects.length);

	}

	$scope.getCommitInfo = function(project) {
		return $scope.commitInfo[project];
	}


	var getTestStatuses = function(project) {
		var status = {}
		// for each task in the data, get the metrics of the selected baseline. 
		_.each($scope.dashboardData[project], function(task){
			var counts = _.countBy($scope.getBaselineData(task, project), function(t){return t.state.toLowerCase();});
			for (key in counts) {
				if (status[key]){
					status[key] += counts[key];
				} else {
					status[key] = counts[key];
				}
			}
		});
		var total = getTotal(status);

		$scope.total[project] = getTotal(status);
		$scope.counts[project] = status;
	};

	var getTotal = function(statuses) {
		var sum = 0;
		for (key in statuses) {
			sum += statuses[key];
		}
		return sum;
	};

	var setInitialBaselines = function(d, project){
		if (d.length > 0) {
			data = d[0].data;
		} else {
			console.log("no baselines");
			return
		}
		if (data && data.baselines){
			$scope.baselines[project] = _.pluck(data.baselines, 'version')
			$scope.setBaseline($scope.baselines[project][0], project);
		}
	};

	$scope.setBaseline = function(baseline, project){
		$scope.currentBaseline[project] = baseline;
		getTestStatuses(project);
	};

	$scope.getBaselineData = function(task, project){
		b =  _.filter(task.data.baselines, function(b){
			return $scope.currentBaseline[project] == b.version;
		})
		return b[0].data;
	};



	// gets the dashbord data and populates the baseline list. // 
	// In this case, the dashboardData's key is the version id. 
	var getVersionDashboard = function() {
		$http.get("/plugin/json/version/" + $scope.version.id + "/dashboard/")
		.success(function(d){
			if (d != null){
				$scope.dashboardData[$scope.version.id] = d;
				// take the first task's data and get the set of baselines from it 
				// NOTE: this is assuming that tasks all have the same baselines.
				setInitialBaselines(d, $scope.version.id);
			} else {
				$scope.dashboardData ={}
			}
		})
	};

	// gets the dashboard for the app level by performing a get for 
	// each project id and populating the dashboard data
	var getAppDashboard = function(){
		// get the latest version data for the whole dashboard
			_.each($scope.dashboardProjects, function(projectName){
				$http.get("/plugin/json/version/latest/" + projectName + "/dashboard/")
					.success(function(d){
						$scope.dashboardData[projectName] = d.json_tasks;
						$scope.commitInfo[projectName] = d.commit_info;
						$scope.hidePassingTasks = true;
						setInitialBaselines(d.json_tasks, projectName);
					})
			})
	}

	var getData = function(){
		if ($scope.dashboardProjects){
			getAppDashboard();
		} else {
			getVersionDashboard();
		}
	}
	getData();


})
