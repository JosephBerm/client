import { create } from 'zustand'
import User, { IUser } from '@/classes/User'

type State = {
	User: IUser,
	LoggedIn: boolean
}

type Actions = {
	setUser: (user: IUser) => void
	getUser: () => IUser
	login: (user: IUser) => void,
	logout: () => void
}

const useAccountStore = create<State & Actions>((set, get) => ({
	User: new User({}),
	LoggedIn: false,

	setUser: (User: IUser) => set((state) => ({ ...state, User })),
	getUser: () => get().User,
	login: (User: IUser) => set((state) => ({ ...state, User, LoggedIn: true })),
	logout : () => set((state) => ({ ...state, User: new User({}), LoggedIn: false}))
}))

export { useAccountStore }