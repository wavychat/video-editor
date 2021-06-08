import React from "react";
import { mount } from "@cypress/react";
import { VideoEditor } from "@video-editor/web";

describe("Video editor renders", () => {
	it("works", () => {
		mount(<VideoEditor />);
		// now use standard Cypress commands
		cy.get("button").focus();
	});
});
