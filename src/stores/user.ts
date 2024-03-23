import { create } from 'zustand'
import User, { IUser } from '@/classes/User'

type State = {
	User: IUser
}

type Actions = {
	setUser: (user: IUser) => void
	getUser: () => IUser
}

const useAccountStore = create<State & Actions>((set, get) => ({
	User: new User({}),
	setUser: (User: IUser) => set((state) => ({ ...state, User })),
	getUser: () => get().User,
}))

export { useAccountStore }
