 /*
	Dashboard react code
 */

 function getColor(state) {
		if (state){
			return "dashboard-" + state.toLowerCase().split(" ").join("-");
		}	
 }

 //function getProgressWidth(state)

 class Root extends React.Component {
 	constructor(props) {
 		super(props);

 		this.props.status_list = ["pass", "forced accept", "undesired", "unacceptable", "no info"];
 		console.log(this)
 		this.state = {
 			hidePassing: false,
 		}

 	}

 	handleHidePassing(hidePassing) {
 		this.setState({hidePassing: hidePassing})
 	}

 	render() {
 		return (
 			React.createElement("div", {className: "container"}, 
 				React.createElement(AppHeader, {hidePassing: this.state.hidePassing, onHidePassingChange: this.handleHidePassing}), 
 				React.createElement(ColumnHeaders, {projects: this.dashboardProjects, columnWidth: this.props.colWidth})
 			)
 			)
 		}
	}

	function AppHeader({hidePassing, onHidePassingCheck}){
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "col-lg-4"}, 
					"Perf Dashboard"
				), 
				React.createElement(HidePassingCheckbox, {className: "col-lg-2", hidePassing: hidePassing, onCheck: onHidePassingCheck})
			)
			)
	}

	class HidePassingCheckbox extends React.Component {
		constructor(props){
			super(props);
			this.handleChange = this.handleChange.bind(this);
		}
		handleChange(event){
			this.props.onCheck(this.refs.hidePassing.checked)
		}
		render() {
			return (
				React.createElement("span", null, 
					"Hide Passing Tasks", 
					React.createElement("input", {
						className: "checkbox", 
						type: "checkbox", 
						checked: this.props.hidePassing, 
						ref: "hidePassing", 
						onChange: this.handleChange}
					)
				)
				)
		}
	}

	function ColumnHeaders ({projects, columnWidth}){
		return (
			React.createElement("div", {className: "row"}, 
				
					_.map(projects, function(projectName){
						return React.createElement(ProjectName, {className: "col-lg-" + columnWidth, projectName: projectName})
					})
				
			)
			)
	}

	function ProjectName({projectName}){
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "col-lg-6"}, 
					projectName
				)
			)
			)
	}

	function ProgressBar({statusList, statusCounts}) {
		var total = _.reduce(statusCounts, function(sum, amount){
				return sum + amount;
		});
		var Tooltip = ReactBootstrap.Tooltip;
		return (
			React.createElement("div", {className: "progress dash-progress"}, 
				
					_.map(statusList, function(status){
						var progressStyle = {
							width: getProgressWidth(status, statusCounts, total)
						};
						toolTipContent = status + ":" + statusCounts[status];
						var tt = React.createElement(Tooltip, {id: "tooltip"}, toolTip);
						return (
							React.createElement("div", {className: "progress-bar " + getColor(status), style: progressStyle}
							)
						)
					})
				
			)
			)
	}

	// given a status and a map of project totals, returns the percentage. 
	function getProgressWidth(status, statusCounts, totalCount) {
		return statusCounts[status] / totalCount; 
	}

	class BaselineDropdown extends React.Component {
		constructor(props){
			super(props);
			this.handleChange = this.handleChange.bind(this);
		}
		handleChange(event){
			this.props.onChange(event.key);
		}
		render(){
			var ButtonGroup = ReactBootstrap.ButtonGroup;
			return (
				React.createElement(ButtonGroup, null, 
					React.createElement(DropdownButton, {title: this.props.baselines[0], onSelect: handleChange}, 
						
							_.map(this.props.baselines.slice(1), function(baseline){
								return React.createElement(MenuItem, {eventKey: baseline}, " ", formatBaseline(baseline))
							})
						
					)
				)
				)
		}
	}




	
 		
