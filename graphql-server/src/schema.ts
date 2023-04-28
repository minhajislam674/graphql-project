import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLContext } from "./context";
import { Link } from "@prisma/client";

//the type definitions (schema) are the structure of the GraphQL API, and they are defined using the GraphQL Schema Definition Language (SDL)
const typeDefinitions = `
  type Query {
    info: String!
    feed: [Link!]!
  }

  type Mutation {
    postLink (url: String!, description: String!): Link! 
  }
 

  type Link {
    id: ID!
    description: String!
    url: String!
  }
`;
//the resolver functions are part of the GraphQL schema, and they are the actual implementation (code/logic) of the GraphQL schema
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: (parent: unknown, args: {}, context: GraphQLContext) =>
      context.prisma.link.findMany(), //Prisma Client API exposes a number of database queries that let us read and write data in the database.
  },

  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
  },

  Mutation: {
    postLink: (
      parent: unknown,
      args: { description: string; url: string },
      context: GraphQLContext
    ) => {
      //Prisma Client API exposes a number of database queries that let us read and write data in the database.
      //calling the create method on a link from your Prisma Client API. As arguments, we're passing the data that the resolvers receive via the args parameter.
      const newLink = context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      });
      return newLink;
    },
  },
};

//the schema is the combination of the type definitions and the resolver functions
export const schema = makeExecutableSchema({
  typeDefs: typeDefinitions,
  resolvers: resolvers,
});
