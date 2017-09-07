const Sequelize=require("sequelize"),
        config=require("../config");
// Define your models
var options = {
  timezone:'+08:00'
}

var sequelize = new Sequelize(config.dbConnection,options);

const User = sequelize.define('user', {})
const Project = sequelize.define('project', {})
const UserProjects = sequelize.define('userProjects', {
    status: Sequelize.STRING
})

User.belongsToMany(Project, { through: UserProjects })
Project.belongsToMany(User, { through: UserProjects })

user.addProject(project, { through: { status: 'started' }})