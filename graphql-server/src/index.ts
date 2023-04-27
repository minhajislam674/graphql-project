import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema";

function main() {
  const yoga = createYoga({ schema });
  const server = createServer(yoga);
  const port = 4000;

  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

main();
