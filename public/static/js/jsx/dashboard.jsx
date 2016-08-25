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
 		this.props.dashboardProjects = $window.dashboardProjects;

 		this.state = {
 			hidePassing: false,
 		}

 	}

 	handleHidePassing(hidePassing) {
 		this.setState({hidePassing: hidePassing})
 	}

 	render() {
 		return (
 			<div className="container">
 				<AppHeader hidePassing={this.state.hidePassing} onHidePassingChange={this.handleHidePassing}/>
 				<ColumnHeaders projects={this.props.dashboardProjects} columnWidth={this.props.colWidth}/>
 			</div>
 			)
 		}
	}

	function AppHeader({hidePassing, onHidePassingCheck}){
		return (
			<div className="row">
				<div className="col-lg-4">
					Perf Dashboard
				</div>
				<HidePassingCheckbox className="col-lg-2" hidePassing={hidePassing} onCheck={onHidePassingCheck}/>
			</div>
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
				<span>
					Hide Passing Tasks
					<input
						className="checkbox"
						type="checkbox"
						checked={this.props.hidePassing}
						ref="hidePassing"
						onChange={this.handleChange}
					/>
				</span>
				)
		}
	}

	function ColumnHeaders ({projects, columnWidth}){
		return (
			<div className="row">
				{
					_.map(projects, function(projectName){
						return <ProjectName className={"col-lg-" + columnWidth} projectName={projectName}/>
					})
				}
			</div>
			)
	}

	function ProjectName({projectName}){
		return (
			<div className="row">
				<div className="col-lg-6">
					{projectName}
				</div>
			</div>
			)
	}

	function ProgressBar({statusList, statusCounts}) {
		var total = _.reduce(statusCounts, function(sum, amount){
				return sum + amount;
		});
		var Tooltip = ReactBootstrap.Tooltip;
		return (
			<div className="progress dash-progress">
				{
					_.map(statusList, function(status){
						var progressStyle = {
							width: getProgressWidth(status, statusCounts, total)
						};
						toolTipContent = status + ":" + statusCounts[status];
						var tt = <Tooltip id="tooltip">{toolTip}</Tooltip>;
						return (
							<div className={"progress-bar " + getColor(status)} style={progressStyle}>
							</div>
						)
					})
				}
			</div>
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
				<ButtonGroup>
					<DropdownButton title={this.props.baselines[0]} onSelect={handleChange}>
						{
							_.map(this.props.baselines.slice(1), function(baseline){
								return <MenuItem eventKey={baseline}> {formatBaseline(baseline)}</MenuItem>
							})
						}
					</DropdownButton>
				</ButtonGroup>
				)
		}
	}




	
 		
