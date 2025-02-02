import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApiSettingsState = {
  idInstance: string;
  apiTokenInstance: string;
  phoneNumber: string;
  avatar: string;
  name: string;
  chatId: string;
  setIdInstance: (str: string) => void;
  setApiTokenInstance: (str: string) => void;
  setPhoneNumber: (str: string) => void;
  setAvatar: (str: string) => void;
  setName: (str: string) => void;
  setChatId: (str: string) => void;
};

const apiSettingsSlice: StateCreator<
  ApiSettingsState,
  [['zustand/persist', unknown]]
> = (set) => ({
  idInstance: '0',
  apiTokenInstance: '0',
  phoneNumber: '',
  avatar: '',
  name: '',
  chatId: '',
  setIdInstance: (str: string) => set({ idInstance: str }),
  setApiTokenInstance: (str: string) => set({ apiTokenInstance: str }),
  setPhoneNumber: (str: string) => set({ phoneNumber: str }),
  setAvatar: (str: string) => set({ avatar: str }),
  setName: (str: string) => set({ name: str }),
  setChatId: (str: string) => set({ chatId: str }),
});

export const useApiSettings = create<ApiSettingsState>()(
  persist(apiSettingsSlice, {
    name: 'green-api',
  })
);
