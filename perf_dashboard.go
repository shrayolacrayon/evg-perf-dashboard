package dashboard

import (
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"path/filepath"

	"github.com/evergreen-ci/evergreen/model"
	"github.com/evergreen-ci/evergreen/model/version"
	"github.com/evergreen-ci/evergreen/plugin"
	"github.com/evergreen-ci/evergreen/util"
	"github.com/gorilla/mux"
	"github.com/mitchellh/mapstructure"
)

const (
	PerfDashboardPluginName = "dashboard"
)

func init() {
	plugin.Publish(&PerfDashboardPlugin{})
}

var includes = []template.HTML{
	`<script type="text/javascript" src="/plugin/dashboard/static/js/dashboard.js"></script>`,
	`<link href="/plugin/dashboard/static/css/dashboard.css" rel="stylesheet"/>`,
}

// PerfDashboardPlugin displays performance statistics in the UI.
// Branches is a map of the branch name to the list of project names
// associated with that branch.
type PerfDashboardPlugin struct {
	Branches map[string][]string `yaml:"branches"`
}

type DashboardData struct {
	Project   string `json:"project"`
	VersionId string `json:"version_id"`
}

type DashboardTask struct {
	TaskName     string `json:"taskName"`
	BuildVariant string `json:"buildVariant"`
}

// DashboardAppData is the data that is returned from calling the app level data function
type DashboardAppData struct {
	Branches      map[string][]string `json:"branches"`
	DefaultBranch string              `json:"default_branch"`
}

// Name implements Plugin Interface.
func (pdp *PerfDashboardPlugin) Name() string {
	return PerfDashboardPluginName
}

func (pdp *PerfDashboardPlugin) GetUIHandler() http.Handler {
	r := mux.NewRouter()

	r.HandleFunc("/tasks/project/{project_id}/version/{version_id}", getTasksForVersion)
	return r

}

func (pdp *PerfDashboardPlugin) GetAppPluginInfo() *plugin.UIPage {
	data := func(context plugin.UIContext) (interface{}, error) {
		defaultBranch := context.Request.FormValue("branch")
		dashboardData := DashboardAppData{
			DefaultBranch: defaultBranch,
			Branches:      pdp.Branches,
		}

		return dashboardData, nil
	}
	return &plugin.UIPage{"perf_dashboard.html", data}
}

func (pdp *PerfDashboardPlugin) Configure(params map[string]interface{}) error {
	err := mapstructure.Decode(params, pdp)
	if err != nil {
		return fmt.Errorf("error decoding %v params: %v", pdp.Name(), err)
	}
	return nil
}

func (pdp *PerfDashboardPlugin) GetPanelConfig() (*plugin.PanelConfig, error) {
	dashboardHTML, err := ioutil.ReadFile(filepath.Join(plugin.TemplateRoot(pdp.Name()), "version_perf_dashboard.html"))
	if err != nil {
		return nil, fmt.Errorf("Can't load version panel file html %v", err)
	}
	return &plugin.PanelConfig{
		Panels: []plugin.UIPanel{
			{
				Includes:  includes,
				Page:      plugin.VersionPage,
				Position:  plugin.PageCenter,
				PanelHTML: template.HTML(dashboardHTML),
				DataFunc: func(context plugin.UIContext) (interface{}, error) {
					exists := false
					for _, projects := range pdp.Branches {
						if util.SliceContains(projects, context.ProjectRef.Identifier) {
							exists = true
							break
						}
					}
					return struct {
						Enabled bool `json:"enabled"`
					}{exists}, nil
				},
			},
		},
	}, nil
}

func getTasksForVersion(w http.ResponseWriter, r *http.Request) {
	projectId := mux.Vars(r)["project_id"]
	versionId := mux.Vars(r)["version_id"]

	if projectId == "" {
		http.Error(w, "empty project id", http.StatusBadRequest)
		return
	}
	if versionId == "" {
		http.Error(w, "empty version id", http.StatusBadRequest)
		return
	}
	projectRef, err := model.FindOneProjectRef(projectId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return

	}
	v, err := version.FindOne(version.ById(versionId).WithFields(version.RevisionKey))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return

	}

	project, err := model.FindProject(v.Revision, projectRef)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return

	}

	if len(project.Tasks) == 0 {
		if err != nil {
			http.Error(w, fmt.Sprintf("no project tasks for project %v with revision %v", projectRef.Identifier, v.Revision),
				http.StatusBadRequest)
			return

		}
	}
	taskMap := getVariantsWithCommand("json.send", project)
	plugin.WriteJSON(w, http.StatusOK, taskMap)
}

// hasCommand traverses the command structure to see if the command exists
func hasCommand(commandName string, command model.PluginCommandConf, project *model.Project) bool {
	exists := false
	if command.Function != "" {
		for _, c := range project.Functions[command.Function].List() {
			exists = exists || hasCommand(commandName, c, project)
		}
	} else {
		exists = (command.Command == commandName && command.Params["name"] == PerfDashboardPluginName)
	}
	return exists
}

// createTaskCacheForCommand returns a map of tasks that have the command
func createTaskCacheForCommand(commandName string, project *model.Project) map[string]bool {
	tasks := map[string]bool{}
	for _, t := range project.Tasks {
		for _, command := range t.Commands {
			if hasCommand(commandName, command, project) {
				tasks[t.Name] = true
				break
			}
		}
	}
	return tasks
}

// getVariantsWithCommand creates a cache of all tasks that have a command name and then iterates over all build variants
// to check if the task is in the cache, adds the bv name to a map
func getVariantsWithCommand(commandName string, project *model.Project) map[string][]string {
	taskCache := createTaskCacheForCommand(commandName, project)
	buildVariants := map[string][]string{}
	for _, bv := range project.BuildVariants {
		for _, t := range bv.Tasks {
			if _, ok := taskCache[t.Name]; ok {
				variants, ok := buildVariants[t.Name]
				if !ok {
					buildVariants[t.Name] = []string{bv.Name}
				} else {
					buildVariants[t.Name] = append(variants, bv.Name)
				}
			}
		}
	}
	return buildVariants
}
