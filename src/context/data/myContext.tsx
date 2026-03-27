import { createContext } from "react";

interface AppContext {
  mode: string;
  toggleMode: () => void;
}

const myContext = createContext<AppContext>({ mode: 'light', toggleMode: () => {} });
export default myContext;
