const { GraphQLObjectType, GraphQLSchema, GraphQLID, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLEnumType  } = require('graphql');
const Project = require('../models/Project');
const Client = require('../models/Client');
const { default: mongoose } = require('mongoose');

// Project type
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString},
        client: {
            type: ClientType, 
            resolve(parent, args){
                return Client.findById(parent.clientId)
            }
        }
    })
});

// Client type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        phone: {type: GraphQLString},
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find({clientId: parent.id})
            }
        }
    })
});

// Clients query
const clients = {
    type: new GraphQLList(ClientType),
    resolve(parent,args) {
        return Client.find()
    }
}

// Client Query
const client = {
    type: ClientType,
    args: {id: {type: GraphQLID}},
    resolve(parent, args){
        return Client.findById(args.id)
    }
}
// Add a Client 
const addClient = {
    type: ClientType,
    args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        phone: {type: GraphQLNonNull(GraphQLString)}
    },
    resolve(parent, args){
        const {name, email, phone} = args;
        const client = new Client({name, email, phone});
        return client.save()
    }
}

// Delete a client

const deleteClient = {
    type: ClientType,
    args: {
        id: {type: GraphQLNonNull(GraphQLID)}
    },
    resolve(parent, args){
        return Client.findByIdAndRemove(args.id)
    }
}
// Projects Query
const projects =  {
    type: new GraphQLList(ProjectType),
    resolve(parent, args){
        return Project.find()
    }
}

// Project Query
const project = {
    type: ProjectType,
    args: {id: {type: GraphQLID}},
    resolve(parent, args){
        return Project.findById(args.id)
    }
}

// Add new Project 
const addProject = {
    type: ProjectType,
    args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLNonNull(GraphQLString)},
        status: {type: new GraphQLEnumType({
            name: 'ProjectStatus',
            values: {
                'new': {value: 'Not Started'},
                'completed': {value: 'Completed'},
                'progress': {value: 'In Progress'},
            }
            }),
            defaultValues: 'Not Started'
        },
        clientId: {type: GraphQLNonNull(GraphQLID)}
    },
    resolve(parent, args){
        const {name, description, status, clientId} = args;
        const project = new Project({name, description, status, clientId});
        return project.save()
    }
}
// Update existing Project 
const updateProject = {
    type: ProjectType,
    args: {
        id: {type: GraphQLNonNull(GraphQLID)},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: new GraphQLEnumType({
            name: 'ProjectStatusUpdate',
            values: {
                'new': {value: 'Not Started'},
                'completed': {value: 'Completed'},
                'progress': {value: 'In Progress'},
            }
            })
        },
    },
    resolve(parent, args){
        const {name, description, status, id} = args;
        return Project.findByIdAndUpdate(
            id, 
            {
                $set:{
                    name, 
                    description, 
                    status
                }
            }, 
            {new: true}
        )
    }
}

// Delete a Project 
const deleteProject = {
    type: ProjectType,
    args: {
        id: {type: GraphQLNonNull(GraphQLID)},
    },
    resolve(parent, args){
        const {id} = args;
        return Project.findByIdAndRemove(id)
    }
}

const query = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: { clients, client, project, projects }
});


const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: { addClient, deleteClient, addProject, deleteProject, updateProject}
})

module.exports = new GraphQLSchema({
    query,
    mutation
})