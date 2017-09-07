const Sequelize=require("sequelize"),
        config=require("../config");
// Define your models
var options = {
  timezone:'+08:00'
}

var sequelize = new Sequelize(config.dbConnection,options);

/*
const People  = sequelize.define('People', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  }
});

People.belongsToMany(People, { as: 'Children', through: 'PeopleChildren' })

// force: true will drop the table if it already exists
People.sync({force: true}).then(() => {
  // Table created
  return People.create({
    firstName: 'John',
    lastName: 'Hancock'
  });
});
*/

var Person = sequelize.define('Person', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
Person.belongsToMany(Person, { as: 'Children', through: 'PersonChildren' });
/*Person.sequelize.sync({force:false}).then(function() {
    Person.build({ name: 'AAAGeorge Herbert Walker Bush ' }).save().then(function(father) {
        Person.build({ name: 'Junior W.Bush' }).save().then(function(son) {
            father.addChild(son);
        });
    })
});*/

Person.addChild(Person);
//Person.sequelize.sync({force:false});
/*Person.create({ name: 'ABC300' }).then(father=>{
        return Person.create({ name: '400' }).then(son=> {
            father.addChild(son);
        });
}).then(p=>{
    console.log(p);
}).then(p=>{
   return Person.findAll({
        include: [ {model:Person,
            as:'Children'} ],
       where:{
            name:'ABC300'
        }
    })
}).then(p=> {
    //console.log(p.toJSON());
    console.log(JSON.stringify(p,4,4));
}).then(p=>{
    return Person.findOne(
        {
            include: [ {model:Person,
            as:'Children'} ],
            where:{
                name:'AAAGeorge Herbert Walker Bush '
            }
        }
    )
}).then(p=>{
    console.log(JSON.stringify(p.toJSON(),4,4));
});*/


/*
Person.findAll({
    include: [ {model:Person,
        as:'Children'} ],
/!*    where:{
        name:'Junior W.Bush'
    }*!/
}).then(function (people) {
        console.log(JSON.stringify(people,4,4));
});*/

/*Person.create({ name: 'x1'
}).then(x=>{
    return Person.create({name:'x2'});
}).then(y=>{
    var father = Person.getChildren({
        where: {
            name: 'x1'
        }
    })
    var son = Person.getChildren({
        where: {
            name: 'x2'
        }
    })

    //father.addChild(son);
});*/

/*Person.findAll({
    include: [ {model:Person,
        as:'Children'} ],
/!*    where:{
        name:'Junior W.Bush'
    }*!/
}).then(function (people) {
        console.log(JSON.stringify(people,4,4));
});*/


/*
Person.create({ name: 'x1'}).then(p=>{
    return p;
}).then(p=>{
    return p.addChild(Person.build({name:'x2'}))
})*/
