import NavigationMenuModel from "../db/models/NavigationMenu.js"
import NavigationMenu from "../db/models/NavigationMenu.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  nameValidator,
  hierarchicalValidator,
  limitValidator,
  orderFieldValidator,
  orderValidator,
  pageValidator,
} from "../validators.js"

const prepareNavigationMenuRoutes = ({ app }) => {
  app.post(
    "/navigationMenus",
    auth,
    validate({
      body: {
        name: nameValidator.required(),
        hierarchical: hierarchicalValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1 && role.roleId !== 2) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const { name, hierarchical } = req.locals.body
      const navigationMenu = await NavigationMenu.query()
        .insert({
          name,
          hierarchical,
        })
        .returning("*")

      res.send({ result: navigationMenu })
    }
  )

  app.get(
    "/navigationMenus",
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator(["name", "hierarchical"]).default(
          "name"
        ),
        order: orderValidator.default("asc"),
      },
    }),
    async (req, res) => {
      const { limit, page, orderField, order } = req.locals.query
      const query = NavigationMenu.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const [countResult] = await query
        .clone()
        .clearSelect()
        .clearOrder()
        .count()
      const count = Number.parseInt(countResult.count, 10)
      const navigationMenus = await query

      res.send({
        result: navigationMenus,
        meta: {
          count,
        },
      })
    }
  )

  app.get(
    "/navigationMenus/:navigationMenuId",
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const checkNavigationmenu = await NavigationMenuModel.query().findById(
        req.params.navigationMenuId
      )

      if (!checkNavigationmenu) {
        return res.status(404).send({ error: "not found" })
      }

      res.send({ result: checkNavigationmenu })
    }
  )

  app.patch(
    "/navigationMenus/:navigationMenuId",
    auth,
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
      body: {
        name: nameValidator,
        hierarchical: hierarchicalValidator,
      },
    }),
    async (req, res) => {
      const { name, hierarchical } = req.locals.body
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1 && role.roleId !== 2) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const navigationMenu = await NavigationMenu.query().findById(
        req.params.navigationMenuId
      )

      if (!navigationMenu) {
        res.status(404).send({ error: "not found" })

        return
      }

      const updatedNavigationMenu = await NavigationMenu.query()
        .update({
          ...(name ? { name } : {}),
          ...(hierarchical ? { hierarchical } : {}),
        })
        .where({
          id: req.params.navigationMenuId,
        })
        .returning("*")

      res.send({ result: updatedNavigationMenu })
    }
  )

  app.delete(
    "/navigationMenus/:navigationMenuId",
    auth,
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1 && role.roleId !== 2) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const checkNavigationmenu = await NavigationMenuModel.query().findById(
        req.params.navigationMenuId
      )

      if (!checkNavigationmenu) {
        return res.status(404).send({ error: "not found" })
      }

      res.send({ result: checkNavigationmenu })
    }
  )
}

export default prepareNavigationMenuRoutes
