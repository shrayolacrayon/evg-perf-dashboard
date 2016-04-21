package perfdash

import (
	"fmt"
	"github.com/evergreen-ci/evergreen/plugin"
	"github.com/evergreen-ci/evergreen/util"
	"github.com/mitchellh/mapstructure"
	"html/template"
	"io/ioutil"
	"net/http"
	"path/filepath"
)

func init() {
	plugin.Publish(&PerfDashboardPlugin{})
}

var includes = []template.HTML{
	`<script type="text/javascript" src="/plugin/dashboard/static/js/dashboard.js"></script>`,
}

// PerfDashboardPlugin displays performance statistics in the UI.
type PerfDashboardPlugin struct {
	Projects []string `yaml:"string"`
}

// Name implements Plugin Interface.
func (pdp *PerfDashboardPlugin) Name() string {
	return "dashboard"
}

func (pdp *PerfDashboardPlugin) GetUIHandler() http.Handler { return nil }
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
					return struct {
						Enabled bool `json:"enabled"`
					}{util.SliceContains(pdp.Projects, context.ProjectRef.Identifier)}, nil
				},
			},
		},
	}, nil
}
