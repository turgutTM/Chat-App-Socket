"use client";

import { Provider } from "react-redux";
import { store } from "../app/store/store";
import { Providers } from "@/Redux/provider";

export function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
