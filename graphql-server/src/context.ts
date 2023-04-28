import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//add our prisma connection to the GraphQL execution context. This will allowus to access context.prisma in all of your resolvers.
export type GraphQLContext = {
  prisma: PrismaClient;
};

export async function CreateContext(): Promise<GraphQLContext> {
  return {
    prisma,
  };
}
