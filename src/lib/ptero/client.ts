import axios from "axios";
import { config } from "../config";

const pteroHeaders = {
  Accept: "Application/vnd.pterodactyl.v1+json",
  Authorization: `Bearer ${config.PTERO_TOKEN}`,
};

const panelAPIBaseURL = `${config.PTERO_SERVER}/api/client`;

const serverAPIBaseURL = `${panelAPIBaseURL}/servers/${config.PTERO_SERVER_ID}`;

export const serverAPI = axios.create({
  baseURL: serverAPIBaseURL,
  timeout: 5000,
  headers: pteroHeaders,
});

export const panelAPI = axios.create({
  baseURL: panelAPIBaseURL,
  timeout: 5000,
  headers: pteroHeaders,
});
