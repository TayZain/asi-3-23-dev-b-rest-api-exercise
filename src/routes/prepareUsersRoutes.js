import hashPassword from "../db/hashPassword.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  emailValidator,
  firstNameValidator,
  idValidator,
  lastNameValidator,
  limitValidator,
  orderFieldValidator,
  orderValidator,
  pageValidator,
  passwordValidator,
  roleValidator,
} from "../validators.js"

const prepareUsersRoutes = ({ app }) => {
  app.post(
    "/users",
    auth,
    validate({
      body: {
        email: emailValidator.required(),
        firstName: firstNameValidator.required(),
        lastName: lastNameValidator.required(),
        roleId: roleValidator.required(),
        password: passwordValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const {
        body: { email, firstName, lastName, roleId, password },
      } = req.locals
      const [passwordHash, passwordSalt] = await hashPassword(password)
      const user = await UserModel.query()
        .insert({
          email,
          firstName,
          lastName,
          roleId,
          passwordHash,
          passwordSalt,
        })
        .returning("*")

      res.send({ result: user })
    }
  )

  app.get(
    "/users",
    auth,
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator([
          "email",
          "firstName",
          "lastName",
        ]).default("email"),
        order: orderValidator.default("desc"),
      },
    }),
    async (req, res) => {
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const { limit, page, orderField, order } = req.locals.query
      const query = UserModel.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const [countResult] = await query
        .clone()
        .clearSelect()
        .clearOrder()
        .count()
      const count = Number.parseInt(countResult.count, 10)
      const users = await query.withGraphFetched("role")

      res.send({
        result: users,
        meta: {
          count,
        },
      })
    }
  )

  app.get(
    "/users/:userId",
    auth,
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),

    async (req, res) => {
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const checkUser = await UserModel.query().findById(req.params.userId)

      if (!checkUser) {
        return res.status(404).send({ error: "not found" })
      }

      res.send({ result: checkUser })
    }
  )

  app.patch(
    "/users/:userId",
    auth,
    validate({
      params: {
        userId: idValidator.required(),
      },
      body: {
        email: emailValidator,
        firstName: firstNameValidator,
        lastName: lastNameValidator,
        roleId: roleValidator,
        password: passwordValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { email, firstName, lastName, roleId, password },
      } = req.locals
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)

      const checkUser = await UserModel.query().findById(req.params.userId)

      if (!checkUser) {
        return res.status(404).send({ error: "not found" })
      }

      const updatedUser = await UserModel.query()
        .update({
          ...(email ? { email } : {}),
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(roleId ? { roleId } : {}),
          ...(passwordHash ? { passwordHash } : {}),
          ...(passwordSalt ? { passwordSalt } : {}),
        })
        .where({
          id: req.params.userId,
        })
        .returning("*")

      res.send({ result: updatedUser })
    }
  )

  app.delete(
    "/users/:userId",
    auth,
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await UserModel.query().findById(req.locals.session.user.id)

      if (role.roleId !== 1) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const checkUser = await UserModel.query().findById(req.params.userId)

      if (!checkUser) {
        return res.status(404).send({ error: "not found" })
      }

      await UserModel.query().delete().where({
        id: req.params.userId,
      })

      res.send({ result: checkUser })
    }
  )
}

export default prepareUsersRoutes
