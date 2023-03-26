import BaseModel from "../models/BaseModel.js"

class RoleModel extends BaseModel {
  static tableName = "role"

  static modifiers = {
    paginate: (query, limit, page) =>
      query.limit(limit).offset((page - 1) * limit),
  }
}

export default RoleModel
