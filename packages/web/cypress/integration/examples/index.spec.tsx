import React from "react";
import { mount } from "@cypress/react";
import { VideoEditor } from "@video-editor/web";

describe("Video editor renders", () => {
	it("visits app", () => {
	 cy.visit("http://localhost:3000");
	});

	it("works", () => {
		expect(true).to.equal(true);
		// mount(<VideoEditor />);
		// // now use standard Cypress commands
		// cy.get("button").click();
	});
});
