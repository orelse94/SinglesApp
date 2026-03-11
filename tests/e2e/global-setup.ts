import { ensureE2ESeed } from "./seed";

async function globalSetup() {
  ensureE2ESeed();
}

export default globalSetup;
