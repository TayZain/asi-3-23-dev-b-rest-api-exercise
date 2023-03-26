import * as yup from "yup"

// generic
export const boolValidator = yup.bool()
export const stringValidator = yup.string()
export const idValidator = yup.number().integer().min(1)

//Pages
export const statusValidator = yup.string()
export const textValidator = yup.string()
export const urlValidator = yup.string()

//navigationMenu
export const hierarchicalValidator = yup.string()

//role
export const nameValidator = yup.string()
export const permissionValidator = yup.string()
export const roleValidator = yup.number().integer().min(1)

// users
export const displayNameValidator = yup.string().min(1)
export const emailValidator = yup.string().email()
export const passwordValidator = yup.string().min(8)
export const firstNameValidator = yup.string()
export const lastNameValidator = yup.string()

// collection (pagination, order, etc.)
export const limitValidator = yup.number().integer().min(1).max(100).default(5)

export const pageValidator = yup.number().integer().min(1).default(1)

export const orderFieldValidator = (fields) => yup.string().oneOf(fields)

export const orderValidator = yup.string().lowercase().oneOf(["asc", "desc"])
