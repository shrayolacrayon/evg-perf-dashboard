package dashboard

import (
	"testing"

	"github.com/evergreen-ci/evergreen/model"
	. "github.com/smartystreets/goconvey/convey"
)

func TestGetTasksWithJSONCommand(t *testing.T) {
	Convey("With a set of project tasks that do and don't have the json.send command", t, func() {

		jsonSendCommand := model.PluginCommandConf{
			Command:  "json.send",
			Params:   map[string]interface{}{"name": "dashboard"},
			Variants: []string{"exampleVar", "anotherOne"},
		}
		notJSONCommand := model.PluginCommandConf{
			Command:  "something.something",
			Params:   map[string]interface{}{"name": "dashboard"},
			Variants: []string{"shouldnt", "show", "up"},
		}
		notDashboardCommand := model.PluginCommandConf{
			Command:  "json.send",
			Params:   map[string]interface{}{"name": "perf"},
			Variants: []string{"shouldnt", "matter"},
		}
		jsonSendTask := model.ProjectTask{
			Name:     "test task",
			Commands: []model.PluginCommandConf{jsonSendCommand},
		}
		noJSONSendTask := model.ProjectTask{
			Name:     "nope",
			Commands: []model.PluginCommandConf{notJSONCommand},
		}
		Convey("with a project that has two tasks", func() {
			proj := model.Project{
				Identifier: "sampleProject",
				Tasks:      []model.ProjectTask{jsonSendTask, noJSONSendTask},
			}
			Convey("only tasks with json send commands should be added", func() {
				dashTasks, err := GetTasksWithJSONCommand("dashboard", "json.send", &proj)
				So(err, ShouldBeNil)
				So(len(dashTasks), ShouldEqual, 2)
				So(dashTasks[0].TaskName, ShouldEqual, "test task")
				So(dashTasks[0].BuildVariant, ShouldEqual, "exampleVar")
				So(dashTasks[1].TaskName, ShouldEqual, "test task")
				So(dashTasks[1].BuildVariant, ShouldEqual, "anotherOne")
			})

		})
		Convey("with a project with a command with a different name", func() {
			notDashboardTask := model.ProjectTask{
				Name:     "not dashboard",
				Commands: []model.PluginCommandConf{notDashboardCommand},
			}
			anotherProject := model.Project{
				Identifier: "anotherProject",
				Tasks:      []model.ProjectTask{notDashboardTask},
			}
			Convey("no tasks should be added", func() {
				dashTasks, err := GetTasksWithJSONCommand("dashboard", "json.send", &anotherProject)
				So(err, ShouldBeNil)
				So(len(dashTasks), ShouldEqual, 0)
			})
		})
	})
}
