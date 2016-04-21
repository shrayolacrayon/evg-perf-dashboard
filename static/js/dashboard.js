function DashboardController($scope, $window, $http){

	$scope.status_list = ["pass", "forced accept", "undesired", "unacceptable", "no info"];

	$scope.version = $window.version.Version;
	$scope.counts = {};

	$scope.baselines = [];
	$scope.currentBaseline = "";
	$scope.baselineData = [];

	// gets the color class associated with the state
	$scope.getColor = function(state){
		if (state){
			return "dashboard-" + state.toLowerCase().split(" ").join("-")
		}	
	};

	$scope.getWidth = function(state){
		return ($scope.counts[state.toLowerCase()] / $scope.total) * 100 + "%";
	}

	$scope.getOrder = function(test){
		return _.indexOf($scope.status_list, test.state);
	};

	$scope.showProgress = function() {
		return !_.isEmpty($scope.counts);
	};


	var getTestStatuses = function() {
		var status = {}
		// for each task in the data, get the metrics of the selected baseline. 
		_.each($scope.dashboardData, function(task){
			var counts = _.countBy($scope.getBaselineData(task), function(t){return t.state.toLowerCase();});
			for (key in counts) {
				if (status[key]){
					status[key] += counts[key];
				} else {
					status[key] = counts[key];
				}
			}
		});
		var total = getTotal(status);

		$scope.total = getTotal(status);
		$scope.counts = status;
	};

	var getTotal = function(statuses) {
		var sum = 0;
		for (key in statuses) {
			sum += statuses[key];
		}
		return sum;
	};

	var setInitialBaselines = function(d){
		var data;
		if (d.length > 0) {
			data = d[0].data;
		} else {
			console.log("no baselines");
			return
		}
		if (data && data.baselines){
			$scope.baselines = _.pluck(data.baselines, 'version')
			$scope.setBaseline($scope.baselines[0]);
		}
	};

	$scope.setBaseline = function(baseline){
		$scope.currentBaseline = baseline;
		getTestStatuses();
	};

	$scope.getBaselineData = function(task){
		b =  _.filter(task.data.baselines, function(b){
			return $scope.currentBaseline == b.version;
		})
		return b[0].data;
	};


	// gets the dashbord data and populates the baseline list. 
	var getDashboardData = function() {
		$http.get("/plugin/json/version/" + $scope.version.id + "/dashboard/")
		.success(function(d){
			if (d != null){
				$scope.dashboardData = d;
				// take the first task's data and get the set of baselines from it 
				// NOTE: this is assuming that tasks all have the same baselines.
				setInitialBaselines(d);
			} else {
				$scope.dashboardData = []
			}
		})
	};

	getDashboardData();


}