import { create } from "zustand";

type SidebarState = {
  isOpen: boolean;
  toggle: () => void;
};

type AddUserGroup ={
  isvisible: boolean
  show:() => void
}

export const useSidebar = create<SidebarState>((set) => ({
  isOpen: false,
  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
}));


export const useAddUserGroup = create<AddUserGroup>((set) =>({

   isvisible: false,

   show:() => set((s) => ({isvisible: !s.isvisible}) )

}))
