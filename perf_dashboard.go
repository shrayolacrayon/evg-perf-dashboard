package perfdash

import (
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"path/filepath"

	"github.com/evergreen-ci/evergreen/plugin"
	"github.com/evergreen-ci/evergreen/util"
	"github.com/mitchellh/mapstructure"
)

func init() {
	plugin.Publish(&PerfDashboardPlugin{})
}

var includes = []template.HTML{
	`<script type="text/javascript" src="/plugin/dashboard/static/js/dashboard.js"></script>`,
}

// PerfDashboardPlugin displays performance statistics in the UI.
// Branches is a map of the branch name to the list of project names
// associated with that branch.
type PerfDashboardPlugin struct {
	Branches map[string][]string `yaml:"projects"`
}

type DashboardData struct {
	Project   string `json:"project"`
	VersionId string `json:"version_id"`
}

// Name implements Plugin Interface.
func (pdp *PerfDashboardPlugin) Name() string {
	return "dashboard"
}

func (pdp *PerfDashboardPlugin) GetUIHandler() http.Handler { return nil }

func (pdp *PerfDashboardPlugin) GetAppPluginInfo() *plugin.UIPage {
	data := func(context plugin.UIContext) (interface{}, error) {
		return pdp.Branches, nil
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

//func (pdp *PerfDashboardPlugin) CreateDashboard(w http.ResponseWriter, r *http.Request) {

//}
