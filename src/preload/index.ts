// src/preload/index.ts  –  contextBridge whitelist (strict API surface)

import { contextBridge, ipcRenderer } from 'electron';
import type { NeiroAPI, IpcChannels } from '../shared/ipc.js';

// Typed invoke helper
function invoke<K extends keyof IpcChannels>(
  channel: K,
  payload?: IpcChannels[K][0]
): Promise<IpcChannels[K][1]> {
  return ipcRenderer.invoke(channel, payload) as Promise<IpcChannels[K][1]>;
}

// Strict whitelist — only these channels are accessible from the renderer
const neiroAPI: NeiroAPI = {
  vault: {
    search: (params) => invoke('vault:search', params),
    getAtom: (id)    => invoke('vault:getAtom', id),
  },
  persona: {
    ask:         (params)     => invoke('persona:ask', params),
    getEvidence: (responseId) => invoke('persona:getEvidence', responseId),
  },
  self: {
    listBeliefs:   ()          => invoke('self:listBeliefs'),
    updateBelief:  (id, patch) => invoke('self:updateBelief', { id, patch }),
  },
  feedback: {
    submit: (params) => invoke('feedback:submit', params),
  },
  insights: {
    list: () => invoke('insights:list'),
  },
};

contextBridge.exposeInMainWorld('neiro', neiroAPI);
