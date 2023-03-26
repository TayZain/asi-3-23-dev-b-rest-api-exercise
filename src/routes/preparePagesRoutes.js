import PageModel from "../db/models/PageModel.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  limitValidator,
  orderFieldValidator,
  orderValidator,
  pageValidator,
  statusValidator,
  textValidator,
  urlValidator,
} from "../validators.js"

const preparePagesRoutes = ({ app }) => {
  app.post(
    "/pages",
    auth,
    validate({
      body: {
        title: textValidator.required(),
        content: textValidator.required(),
        status: statusValidator.required(),
        url: urlValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1 && role.roleId !== 2) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const userId = req.locals.session.user.id

      const { title, content, status, url } = req.locals.body
      const page = await PageModel.query()
        .insert({
          title,
          content,
          status,
          url,
          createdBy: userId,
        })
        .returning("*")

      res.send({ result: page })
    }
  )

  app.get(
    "/pages",
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator(["title", "datePublished"]).default(
          "datePublished"
        ),
        order: orderValidator.default("desc"),
      },
    }),
    async (req, res) => {
      const { limit, page, orderField, order } = req.locals.query
      const query = PageModel.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const [countResult] = await query
        .clone()
        .clearSelect()
        .clearOrder()
        .count()
      const count = Number.parseInt(countResult.count, 10)
      const pages = await query.withGraphFetched("creator")

      res.send({
        result: pages,
        meta: {
          count,
        },
      })
    }
  )

  app.get(
    "/pages/:pageId",
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const checkPage = await UserModel.query().findById(req.params.userId)

      if (!checkPage) {
        return res.status(404).send({ error: "not found" })
      }

      res.send({ result: checkPage })
    }
  )

  app.patch(
    "/pages/:pageId",
    auth,
    validate({
      body: {
        title: textValidator,
        content: textValidator,
        status: statusValidator,
        url: urlValidator,
      },
    }),
    async (req, res) => {
      const { title, content, status, url } = req.locals.body
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1 && role.roleId !== 2) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const checkPage = await PageModel.query().findById(req.params.pageId)

      if (!checkPage) {
        return res.status(404).send({ error: "not found" })
      }

      const userId = req.locals.session.user.id
      const updatedPage = await PageModel.query()
        .update({
          ...(title ? { title } : {}),
          ...(content ? { content } : {}),
          ...(status ? { status } : {}),
          ...(url ? { url } : {}),
          ...(userId ? { editBy: userId } : {}),
        })
        .where({
          id: req.params.pageId,
        })
        .returning("*")

      res.send({ result: updatedPage })
    }
  )

  app.delete(
    "/pages/:pageId",
    auth,
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1 && role.roleId !== 2) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const checkPage = await PageModel.query().findById(req.params.pageId)

      if (!checkPage) {
        return res.status(404).send({ error: "not found" })
      }

      await PageModel.query().delete().where({
        id: req.params.pageId,
      })

      res.send({ result: checkPage })
    }
  )
}

export default preparePagesRoutes
