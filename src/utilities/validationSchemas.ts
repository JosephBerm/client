import * as yup from 'yup'

export default class Validations {
	public static signupSchema = yup.object().shape({
		username: yup.string().required('Username is required'),
		email: yup.string().email('Invalid email').required('Email is required'),
		password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
		confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match'),
		firstName: yup.string().required('First name is required'),
		lastName: yup.string().required('Last name is required'),
		dateOfBirth: yup.date(),
	})

	public static loginSchema = yup.object().shape({
		username: yup.string().required('Username is required'),
		password: yup.string().required('Password is required'),
	})

	public static customerSchema = yup.object().shape({
		name: yup.string().required('name is required'),
		email: yup.string().required('email is required'),
	})

	public static changePasswordSchema = yup.object().shape({
		oldPassword: yup.string().required('Username is required'),
		newPassword: yup.string().required('New Password is required').min(6, 'Password must be at least 6 characters'),
		confirmNewPassword: yup.string().required('Confirm new Password is required').oneOf([yup.ref('newPassword')], 'Passwords must match')
	})

	public static store = {
		productSchema:  yup.object().shape({
			sku: yup.string().required('SKU is required'),
			name: yup.string().required('Name is required'),
			description: yup.string().required('Description is required'),
			price: yup.number().positive('Price must be a positive number').required('Price is required'),
		}),
	}

	public static providerSchema = yup.object().shape({
		name: yup.string().required('Name is required'),
		email: yup.string().required('Email is required'),
		identifier: yup.string().required('Identifier is required'),
	})

	public static userSchema = yup.object().shape({
		id: yup.number().required(),
		username: yup.string().required(),
		password: yup.string().required(),
		email: yup.string().email().required(),
		firstName: yup.string().required(),
		lastName: yup.string().required(),
		dateOfBirth: yup.date().nullable().required(),
		createdAt: yup.date().nullable().required(),
		address: yup.string().notRequired(),
		city: yup.string().notRequired(),
		state: yup.string().notRequired(),
		zipCode: yup.string().notRequired(),
		country: yup.string().notRequired(),
		phone: yup.string().notRequired(),
		mobile: yup.string().notRequired(),
	})

	public static profileSchema = yup.object().shape({

		email: yup.string().email().required(),
		firstName: yup.string().required(),
		lastName: yup.string().required()
	})
}
