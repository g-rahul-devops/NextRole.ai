import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
import { getRouterManifest } from '@tanstack/react-start/router-plugin';

import { startInstance } from './start';

export default createStartHandler({
  createRouter: startInstance.createRouter,
  getRouterManifest,
  streamHandler: defaultStreamHandler,
});
