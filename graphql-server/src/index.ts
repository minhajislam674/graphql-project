import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema";
import { CreateContext } from "./context";

function main() {
  const yoga = createYoga({ schema, context: CreateContext });
  const server = createServer(yoga);
  const port = 4000;

  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

main();
