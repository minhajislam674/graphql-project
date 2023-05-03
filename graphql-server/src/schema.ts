import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLContext } from "./context";
import { Link, Comment } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { GraphQLError } from "graphql";

const parseIntSafe = (value: string): number | null => {
  if (/^(\d+)$/.test(value)) {
    return parseInt(value, 10);
  }
  return null;
};

//the type definitions (schema) are the structure of the GraphQL API, and they are defined using the GraphQL Schema Definition Language (SDL)
const typeDefinitions = `
  type Query {
    info: String!
    feed (filterNeedle: String): [Link!]!
    comment(id: ID!): Comment
    link(id: ID): Link
  }

  type Mutation {
    postLink (url: String!, description: String!): Link! 
    postCommentOnLink (linkId: ID!, body: String!): Comment!
  }
 
  type Link {
    id: ID!
    description: String!
    url: String!
    comments: [Comment!]!    
  }

  type Comment {
    id: ID!
    body: String!
    link: Link
  }
`;
//the resolver functions are part of the GraphQL schema, and they are the actual implementation (code/logic) of the GraphQL schema
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: (
      parent: unknown,
      args: { filterNeedle?: string },
      context: GraphQLContext
    ) => {
      const where = args.filterNeedle
        ? {
            OR: [
              { description: { contains: args.filterNeedle } },
              { url: { contains: args.filterNeedle } },
            ],
          }
        : {};
      //If no filterNeedle argument value is provided, then the where object will be just an empty object and no filtering conditions will be appplied
      //If filterNeedle argument is provided, we are construting a where object that expresses our two filter conditions from above, which is used by prisma to filter out links that do not adhere to conditions

      return context.prisma.link.findMany({ where });
    },

    comment: (parent: unknown, args: { id: string }, context: GraphQLContext) =>
      context.prisma.comment.findUnique({
        where: {
          id: parseInt(args.id),
        },
      }),
    link: (parent: unknown, args: { id: string }, context: GraphQLContext) =>
      context.prisma.link.findUnique({
        where: {
          id: parseInt(args.id),
        },
      }),
  },

  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
    comments: (parent: Link, args: {}, context: GraphQLContext) => {
      return context.prisma.comment.findMany({
        where: {
          linkId: parent.id,
        },
      });
    },
  },

  Comment: {
    id: (parent: Comment) => parent.id,
    body: (parent: Comment) => parent.body,
    link: (parent: Comment, args: {}, context: GraphQLContext) => {
      return context.prisma.link.findUnique({
        where: {
          id: parent.linkId!,
        },
      });
    },
  },

  Mutation: {
    async postCommentOnLink(
      parent: unknown,
      args: { linkId: string; body: string },
      context: GraphQLContext
    ) {
      const comment = await context.prisma.comment
        .create({
          data: {
            body: args.body,
            linkId: parseIntSafe(args.linkId),
          },
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === "P2003"
          ) {
            return Promise.reject(
              new GraphQLError(
                `Cannot post comment on non-existing link with id '${args.linkId}'.`
              )
            );
          }
          return Promise.reject(err);
        });

      return comment;
    },

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
