import * as yup from 'yup'

export default class Validations {
	public static signup = yup.object().shape({
		username: yup.string().required('Username is required'),
		email: yup.string().email('Invalid email').required('Email is required'),
		password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
		confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match'),
		firstName: yup.string().required('First name is required'),
		lastName: yup.string().required('Last name is required'),
		dateOfBirth: yup.date(),
	})
}
