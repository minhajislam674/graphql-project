import { makeExecutableSchema } from "@graphql-tools/schema";

type Link = {
  id: string;
  url: string;
  description: string;
};

const links: Link[] = [
  {
    id: "link-0",
    url: "https://graphql-yoga.com",
    description: "The easiest way of setting up a GraphQL server",
  },
  {
    id: "link-1",
    url: "https://graphql-yoga.com",
    description: "The easiest way of setting up a GraphQL server",
  },
];

//the type definitions (schema) are the structure of the GraphQL API, and they are defined using the GraphQL Schema Definition Language (SDL)
const typeDefinitions = `
  type Query {
    info: String!
    feed: [Link!]!
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
    feed: () => links,
  },

  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
  },
};

//the schema is the combination of the type definitions and the resolver functions
export const schema = makeExecutableSchema({
  typeDefs: typeDefinitions,
  resolvers: resolvers,
});
