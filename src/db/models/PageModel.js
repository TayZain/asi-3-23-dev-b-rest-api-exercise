import BaseModel from "../models/BaseModel.js"
import UserModel from "./UserModel.js"

class PageModel extends BaseModel {
  static tableName = "pages"

  static modifiers = {
    paginate: (query, limit, page) =>
      query.limit(limit).offset((page - 1) * limit),
  }

  static relationMappings() {
    return {
      creator: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserModel,
        join: {
          from: "pages.createdBy",

          to: "users.id",
        },
      },

      editor: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserModel,
        join: {
          from: "pages.editBy",
          to: "users.id",
        },
      },
    }
  }
}

export default PageModel
