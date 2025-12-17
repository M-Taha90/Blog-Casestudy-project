import { io } from "socket.io-client";
import { getSocketIOUrl } from "@/config/env";

export const socket = io(getSocketIOUrl(), {
  autoConnect: false, // We'll connect manually when needed
});

