import BaseModel from "../models/BaseModel.js"

class NavigationMenuModel extends BaseModel {
  static tableName = "navigationMenu"

  static modifiers = {
    paginate: (query, limit, page) =>
      query.limit(limit).offset((page - 1) * limit),
  }
}

export default NavigationMenuModel
