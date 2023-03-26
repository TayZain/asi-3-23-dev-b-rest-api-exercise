import prepareSignRoutes from "./routes/prepareSignRoutes.js"
import prepareNavigationMenuRoutes from "./routes/prepareNavigationMenuRoutes.js"
import preparePagesRoutes from "./routes/preparePagesRoutes.js"
import prepareRolesRoutes from "./routes/prepareRolesRoutes.js"
import prepareUsersRoutes from "./routes/prepareUsersRoutes.js"

const prepareRoutes = (ctx) => {
  prepareSignRoutes(ctx)
  prepareUsersRoutes(ctx)
  prepareRolesRoutes(ctx)
  prepareNavigationMenuRoutes(ctx)
  preparePagesRoutes(ctx)
}

export default prepareRoutes
