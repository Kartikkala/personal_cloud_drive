import PasswordValidator from "password-validator"

const passwordSchema = new PasswordValidator()
const usernameSchema = new PasswordValidator()

passwordSchema
.is().min(8)
.is().max(24)
.has().uppercase()
.has().lowercase()
.has().digits(2)
.has().not().spaces()

usernameSchema
.is().min(2)
.is().max(20)
.has().not().spaces()

export {passwordSchema, usernameSchema}