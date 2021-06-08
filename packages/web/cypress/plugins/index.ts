import Cypress from "cypress";

import injectDevServer from "@cypress/react/plugins/react-scripts";

const moduleExport: Cypress.PluginConfig = (on, config) => {
	injectDevServer(on, config);
	return config;
};

export default moduleExport;
